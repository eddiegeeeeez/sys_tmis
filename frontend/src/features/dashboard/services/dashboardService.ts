import api from '../../../lib/axios';

export interface RecentEvent {
  event: string;
  time: string;
  status: string;
}

export interface WeeklyExpense {
  name: string;
  sales: number;
}

export interface CategoryExpense {
  name: string;
  value: number;
}

export interface LowStockItem {
  name: string;
  stock: number;
  status: string;
}

export interface PendingPO {
  id: string;
  supplier: string;
  status: string;
  eta: string;
}

export interface RecentTransaction {
  transactionNumber: string;
  time: string;
  totalAmount: number;
  itemCount: number;
  paymentMethod: string;
}

export interface DashboardSummary {
  totalUsers: number;
  activeEmployees: number;
  totalProducts: number;
  lowStockCount: number;
  monthlyExpenses: number;
  pendingPurchaseOrders: number;
  presentToday: number;
  securityAlerts: number;
  recentEvents: RecentEvent[];
  weeklyExpenses: WeeklyExpense[];
  expensesByCategory: CategoryExpense[];
  lowStockItems: LowStockItem[];
  pendingPOs: PendingPO[];
  // Cashier
  todayRevenue: number;
  todayTransactionCount: number;
  todayItemsSold: number;
  recentTransactions: RecentTransaction[];
  // Phase 3 & 4 — Enhanced metrics
  monthlyRevenue: number;
  previousMonthRevenue: number;
  previousMonthExpenses: number;
  profitEstimate: number;
  databaseConnected: boolean;
  pendingMigrationsCount: number;
  revenueTrend: number;
  expenseTrend: number;
  attendanceRate: number;
  payrollDueSoon: boolean;
  newStockAlerts: number;
}

export const emptyDashboard: DashboardSummary = {
  totalUsers: 0,
  activeEmployees: 0,
  totalProducts: 0,
  lowStockCount: 0,
  monthlyExpenses: 0,
  pendingPurchaseOrders: 0,
  presentToday: 0,
  securityAlerts: 0,
  recentEvents: [],
  weeklyExpenses: [],
  expensesByCategory: [],
  lowStockItems: [],
  pendingPOs: [],
  todayRevenue: 0,
  todayTransactionCount: 0,
  todayItemsSold: 0,
  recentTransactions: [],
  monthlyRevenue: 0,
  previousMonthRevenue: 0,
  previousMonthExpenses: 0,
  profitEstimate: 0,
  databaseConnected: false,
  pendingMigrationsCount: 0,
  revenueTrend: 0,
  expenseTrend: 0,
  attendanceRate: 0,
  payrollDueSoon: false,
  newStockAlerts: 0,
};

export const getDashboardSummary = async (): Promise<DashboardSummary> => {
  const { data } = await api.get<{ data: DashboardSummary }>('dashboard/summary');
  return data.data;
};
