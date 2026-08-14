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
