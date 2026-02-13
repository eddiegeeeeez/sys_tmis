export enum UserRole {
  SUPER_ADMIN = 'Super Admin',
  SYSTEM_ADMIN = 'System Admin',
  MANAGER = 'Manager',
  CASHIER = 'Cashier',
  INVENTORY_CLERK = 'Inventory Clerk',
}

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  sku: string;
  image?: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: 'Active' | 'Inactive';
  lastLogin?: string;
}

export interface Transaction {
  id: string;
  date: string;
  total: number;
  status: 'Completed' | 'Refunded';
}

// --- New Types based on PDF Data Dictionary ---

export interface Employee {
  EmployeeID: string;
  FirstName: string;
  LastName: string;
  Position: string;
  Department: string;
  Email: string;
  ContactNumber: string;
  EmploymentStatus: 'Full-time' | 'Part-time' | 'Contract';
  BasicSalary: number;
  HireDate: string;
}

export interface PayrollRecord {
  PayrollID: string;
  EmployeeName: string; // Joined for display
  PayPeriodStart: string;
  PayPeriodEnd: string;
  BasicSalary: number;
  GrossPay: number;
  TotalDeductions: number;
  NetPay: number;
  Status: 'Pending' | 'Approved' | 'Paid';
}

export interface Attendance {
  AttendanceID: string;
  EmployeeName: string;
  Date: string;
  TimeIn: string;
  TimeOut: string;
  Status: 'Present' | 'Absent' | 'Late' | 'On Leave';
}

export interface Supplier {
  SupplierID: string;
  SupplierName: string;
  ContactPerson: string;
  ContactNumber: string;
  Email: string;
}

export interface PurchaseOrder {
  PurchaseOrderID: string;
  PONumber: string;
  SupplierName: string;
  OrderDate: string;
  ExpectedDeliveryDate: string;
  TotalAmount: number;
  Status: 'Pending' | 'Approved' | 'Received' | 'Cancelled';
}

export interface Customer {
  CustomerID: string;
  CustomerName: string;
  CustomerType: 'Retail' | 'Wholesale' | 'Corporate';
  ContactNumber: string;
  LoyaltyPoints: number;
}

export interface Expense {
  ExpenseID: string;
  ExpenseCategory: string; // Utilities, Rent, etc.
  Description: string;
  Amount: number;
  ExpenseDate: string;
  Status: 'Pending' | 'Approved' | 'Paid';
}