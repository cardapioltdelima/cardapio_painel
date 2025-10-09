
import React from 'react';
import { Order } from '../types';
import './Receipt.css';

interface ReceiptProps {
    order: Order;
}

const Receipt: React.FC<ReceiptProps> = ({ order }) => {
    return (
        <div className="receipt-container">
            <div className="receipt-header">
                <h2>Recibo</h2>
                <p>Pedido #{order.id.slice(-6)}</p>
            </div>
            <div className="receipt-body">
                <div className="customer-info">
                    <p><strong>Cliente:</strong> {order.customer.name}</p>
                    <p><strong>Endereço:</strong> {order.customer.address}</p>
                </div>
                <div className="order-items">
                    <table>
                        <thead>
                            <tr>
                                <th>Qtd</th>
                                <th>Produto</th>
                                <th>Preço Unit.</th>
                                <th>Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {order.items.map(item => (
                                <tr key={item.productId}>
                                    <td>{item.quantity}</td>
                                    <td>{item.productName}</td>
                                    <td>{item.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                                    <td>{(item.quantity * item.price).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="receipt-total">
                    <p><strong>Total a Pagar:</strong></p>
                    <p>{order.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                </div>
            </div>
            <div className="receipt-footer">
                <p>Obrigado pela sua preferência!</p>
            </div>
        </div>
    );
};

export default Receipt;
