'use client'

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/lib/auth';

export default function Home() {
  const router = useRouter();
  
  useEffect(() => {
    const user = authService.getUser();
    
    if (!user) {
      // Not authenticated, go to login
      router.replace('/login');
      return;
    }
    
    // Authenticated, redirect based on role
    switch (user.role) {
      case "SuperAdmin":
        router.replace("/super-admin");
        break;
      case "SystemAdmin":
        router.replace("/admin");
        break;
      case "Manager":
        router.replace("/manager");
        break;
      case "Cashier":
        router.replace("/cashier");
        break;
      case "InventoryClerk":
        router.replace("/inventory");
        break;
      default:
        router.replace("/dashboard");
    }
  }, [router]);
  
  return null;
}
