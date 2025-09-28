
export enum Role {
  Admin = 'Admin',
  Atendente = 'Atendente',
}

export interface User {
  id: number;
  name: string;
  role: Role;
  avatar: string;
}

export enum OrderStatus {
  Aguardando = 'Aguardando Aprovação',
  EmPreparo = 'Em Preparo',
  Concluido = 'Concluído',
  Cancelado = 'Cancelado',
}

export enum PaymentStatus {
  Pendente = 'Pendente',
  Pago = 'Pago',
  PagamentoNaEntrega = 'Pagamento na Entrega',
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
}
export interface Order {
  id: string;
  customer: {
    name: string;
    whatsapp: string;
    address: string;
  };
  items: OrderItem[];
  status: OrderStatus;
  payment_status: PaymentStatus;
  total: number;
  createdAt: Date;
}

export interface Product {
  id: string;
  name:string;
  categoryId: string;
  price: number;
  size: string;
  unit: string;
  imageUrl: string;
}

export interface Category {
  id: string;
  name: string;
}
