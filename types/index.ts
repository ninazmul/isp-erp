export interface Expense {
  _id: string;
  category: string;
  amount: number;
  expenseDate: Date | string;
  paymentMethod: string;
  reference?: string;
  description?: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface Income {
  _id: string;
  category: string;
  amount: number;
  incomeDate: Date | string;
  paymentMethod: string;
  reference?: string;
  description?: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface Category {
  _id: string;
  name: string;
  type: "income" | "expense";
  isDefault: boolean;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface Admin {
  _id: string;
  email: string;
  createdAt: Date | string;
  updatedAt?: Date | string;
}

export interface Package {
  _id: string;
  name: string;
  monthlyFee: number;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface Location {
  _id: string;
  name: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface Customer {
  _id: string;
  customerCode: string;
  username?: string;
  name: string;
  phone: string;
  email?: string;
  location: string;
  packageName: string;
  monthlyFee: number;
  connectionDate: Date | string;
  router?: string;
  ipAddress?: string;
  status: "Active" | "Inactive" | "Disconnected" | string;
  notes?: string;
  isDeleted?: boolean;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface Bill {
  _id: string;
  customer: Customer;
  month: number;
  year: number;
  amount: number;
  paidAmount?: number;
  dueAmount?: number;
  advanceAmount?: number;
  status: "Paid" | "Unpaid" | string;
  paymentDate?: Date | string;
  paymentMethod?: string;
  remarks?: string;
  invoiceNumber: string;
  previousDueAmount?: number;
  previousAdvanceAmount?: number;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}
