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
  connectionDate: Date;
  router?: string;
  ipAddress?: string;
  status: string;
  notes?: string;
  isDeleted: boolean;
}

export interface Bill {
  _id: string;
  invoiceNumber: string;
  customer: Customer;
  month: number;
  year: number;
  amount: number;
  paidAmount?: number;
  dueAmount?: number;
  advanceAmount?: number;
  previousDueAmount?: number;
  previousAdvanceAmount?: number;
  status: string;
  paymentDate?: Date;
  paymentMethod?: string;
  remarks?: string;
}

export interface Expense {
  _id: string;
  category: string;
  amount: number;
  expenseDate: Date;
  paymentMethod: string;
  reference?: string;
  description?: string;
}

export interface Income {
  _id: string;
  category: string;
  amount: number;
  incomeDate: Date;
  paymentMethod: string;
  reference?: string;
  description?: string;
}

export interface Category {
  _id: string;
  name: string;
  type: "income" | "expense";
  isDefault: boolean;
}

export interface Admin {
  _id: string;
  email: string;
  createdAt: Date;
}

export interface Package {
  _id: string;
  name: string;
  monthlyFee: number;
}

export interface Location {
  _id: string;
  name: string;
}
