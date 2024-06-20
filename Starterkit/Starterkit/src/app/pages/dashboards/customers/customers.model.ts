export interface Customers {
    id: number;
    username: string;
    phone: string;
    email: string;
    address: string;
    rating: string;
    balance: string;
    date: string;
}

export interface Customer {
  id: number;
  name: string;
  phoneNumber: string;
  email: string;
  address: string;
  isBlocked: boolean;
  birthDate: Date;
  numCompte: number;
}
