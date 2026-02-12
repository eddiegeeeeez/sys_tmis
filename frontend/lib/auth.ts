import { fetchApi } from "./api";

const TOKEN_KEY = "tmis_token";
const USER_KEY = "tmis_user";
const EXPIRY_KEY = "tmis_expiry";

export interface LoginResponse {
    token: string;
    role: string;
    name: string;
    email: string;
}

export interface UserData {
    name: string;
    role: string;
    email: string;
}

export const authService = {
    async login(email: string, password: string): Promise<LoginResponse> {
        const data = await fetchApi("/api/Auth/login", {
            method: "POST",
            body: JSON.stringify({ email, password }),
        });

        console.log('[AuthService] Login response:', data);

        if (data.token) {
            localStorage.setItem(TOKEN_KEY, data.token);
            const userData = { 
                name: data.name, 
                role: data.role,
                email: data.email
            };
            console.log('[AuthService] Saving user data:', userData);
            localStorage.setItem(USER_KEY, JSON.stringify(userData));
            // Token expires in 24 hours
            const expiryTime = new Date().getTime() + (24 * 60 * 60 * 1000);
            localStorage.setItem(EXPIRY_KEY, expiryTime.toString());
        }

        return data;
    },

    logout() {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        localStorage.removeItem(EXPIRY_KEY);
        window.location.href = "/login";
    },

    getToken() {
        if (typeof window !== "undefined") {
            const token = localStorage.getItem(TOKEN_KEY);
            const expiry = localStorage.getItem(EXPIRY_KEY);
            
            if (token && expiry) {
                if (new Date().getTime() > parseInt(expiry)) {
                    authService.logout();
                    return null;
                }
            }
            return token;
        }
        return null;
    },

    getUser(): UserData | null {
        if (typeof window !== "undefined") {
            const userStr = localStorage.getItem(USER_KEY);
            const user = userStr ? JSON.parse(userStr) : null;
            console.log('[AuthService] getUser() called, returning:', user);
            return user;
        }
        return null;
    },

    isAuthenticated() {
        return !!this.getToken();
    }
};
