export interface User {
  id: string;
  email: string;
  role: 'user' | 'admin';
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  category: 'moto' | 'scooter' | 'pieces' | 'voiture';
  price: number;
  stock: number;
  brand: string;
  model: string;
  year: number;
  images: string[];
  created_at: string;
}
