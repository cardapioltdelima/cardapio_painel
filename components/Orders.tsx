
import React, { useState, useMemo } from 'react';
import { Order, OrderStatus, PaymentStatus, Product } from '../types';
import OrderDetailsModal from './OrderDetailsModal';
import { FaWhatsapp, FaEye } from 'react-icons/fa';

interface OrdersProps {
    orders: Order[];
    products: Product[];
    updateOrderStatus: (orderId: string, newStatus: OrderStatus) => void;
    updatePaymentStatus: (orderId: string, newStatus: PaymentStatus) => void;
}

const getStatusColor = (status: OrderStatus) => {
    switch (status) {
        case OrderStatus.Aguardando: return 'bg-yellow-500 text-yellow-900';
        case OrderStatus.EmPreparo: return 'bg-blue-500 text-blue-900';
        case OrderStatus.Concluido: return 'bg-green-500 text-green-900';
        case OrderStatus.Cancelado: return 'bg-red-500 text-red-900';
        default: return 'bg-gray-500 text-gray-900';
    }
};

const getPaymentStatusColor = (status: PaymentStatus) => {
    switch (status) {
        case PaymentStatus.Pendente: return 'bg-orange-500 text-orange-900';
        case PaymentStatus.Pago: return 'bg-green-500 text-green-900';
        case PaymentStatus.PagamentoNaEntrega: return 'bg-cyan-500 text-cyan-900';
        default: return 'bg-gray-500 text-gray-900';
    }
};

const Orders: React.FC<OrdersProps> = ({ orders, products, updateOrderStatus, updatePaymentStatus }) => {
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [filter, setFilter] = useState<string>('Todos');

    const filteredOrders = useMemo(() => {
        if (filter === 'Todos') return orders;
        return orders.filter(order => order.status === filter);
    }, [orders, filter]);

    const handleOpenModal = (order: Order) => {
        setSelectedOrder(order);
    };

    const handleCloseModal = () => {
        setSelectedOrder(null);
    };

    const filterOptions = ['Todos', ...Object.values(OrderStatus)];

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
                <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4 sm:mb-0">Gerenciamento de Pedidos</h2>
                 <div className="flex items-center space-x-2 w-full sm:w-auto">
                    <label htmlFor="status-filter" className="text-sm font-medium whitespace-nowrap">Filtrar por status:</label>
                    <select
                        id="status-filter"
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-purple-500 focus:border-purple-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-purple-500 dark:focus:border-purple-500"
                    >
                        {filterOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                </div>
            </div>

            {/* Mobile Card View */}
            <div className="grid grid-cols-1 gap-4 md:hidden">
                {filteredOrders.sort((a,b) => b.createdAt.getTime() - a.createdAt.getTime()).map(order => (
                    <div key={order.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg shadow p-4 space-y-3">
                        <div className="flex justify-between items-start">
                            <span className="font-bold text-gray-900 dark:text-white">Pedido #{order.id.slice(-6)}</span>
                            <div className='flex flex-col items-end gap-2'>
                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
                                    {order.status}
                                </span>
                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getPaymentStatusColor(order.payment_status)}`}>
                                    {order.payment_status}
                                </span>
                            </div>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-300">Cliente: <span className="font-medium text-gray-800 dark:text-gray-100">{order.customer.name}</span></p>
                            <p className="text-sm text-gray-600 dark:text-gray-300">Data: <span className="font-medium text-gray-800 dark:text-gray-100">{new Date(order.createdAt).toLocaleDateString('pt-BR')}</span></p>
                            <p className="text-sm text-gray-600 dark:text-gray-300">Total: <span className="font-medium text-gray-800 dark:text-gray-100">{order.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span></p>
                            {order.data_agendamento && (
                                <>
                                    <p className="text-sm text-gray-600 dark:text-gray-300">Data Agendada: <span className="font-medium text-gray-800 dark:text-gray-100">{new Date(order.data_agendamento).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</span></p>
                                    <p className="text-sm text-gray-600 dark:text-gray-300">Turno: <span className="font-medium text-gray-800 dark:text-gray-100">{order.turno}</span></p>
                                    <p className="text-sm text-gray-600 dark:text-gray-300">Horário: <span className="font-medium text-gray-800 dark:text-gray-100">{order.horario_agendamento}</span></p>
                                </>
                            )}
                        </div>
                        <div className="flex items-center justify-end space-x-4 pt-2">
                            <a
                                href={`https://wa.me/${order.customer.whatsapp}?text=Olá, ${order.customer.name}! Sobre seu pedido ${order.id.slice(-6)}...`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-green-500 hover:text-green-700 transition-colors"
                                title="Confirmar via WhatsApp"
                            >
                                <FaWhatsapp size={22} />
                            </a>
                             <button onClick={() => handleOpenModal(order)} className="text-purple-500 hover:text-purple-700 transition-colors" title="Ver Detalhes">
                                <FaEye size={22}/>
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                        <tr>
                            <th scope="col" className="px-6 py-3">Pedido</th>
                            <th scope="col" className="px-6 py-3">Cliente</th>
                            <th scope="col" className="px-6 py-3">Data</th>
                            <th scope="col" className="px-6 py-3">Data Agendada</th>
                            <th scope="col" className="px-6 py-3">Turno</th>
                            <th scope="col" className="px-6 py-3">Horário</th>
                            <th scope="col" className="px-6 py-3">Total</th>
                            <th scope="col" className="px-6 py-3">Status Pedido</th>
                            <th scope="col" className="px-6 py-3">Status Pgto.</th>
                            <th scope="col" className="px-6 py-3">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredOrders.sort((a,b) => b.createdAt.getTime() - a.createdAt.getTime()).map(order => (
                            <tr key={order.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">#{order.id.slice(-6)}</td>
                                <td className="px-6 py-4">{order.customer.name}</td>
                                <td className="px-6 py-4">{new Date(order.createdAt).toLocaleDateString('pt-BR')}</td>
                                <td className="px-6 py-4">{order.data_agendamento ? new Date(order.data_agendamento).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : 'N/A'}</td>
                                <td className="px-6 py-4">{order.turno || 'N/A'}</td>
                                <td className="px-6 py-4">{order.horario_agendamento || 'N/A'}</td>
                                <td className="px-6 py-4">{order.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
                                        {order.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getPaymentStatusColor(order.payment_status)}`}>
                                        {order.payment_status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 flex items-center space-x-3">
                                    <a
                                        href={`https://wa.me/${order.customer.whatsapp}?text=Olá, ${order.customer.name}! Sobre seu pedido ${order.id.slice(-6)}...`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-green-500 hover:text-green-700 transition-colors"
                                        title="Confirmar via WhatsApp"
                                    >
                                        <FaWhatsapp size={20} />
                                    </a>
                                     <button onClick={() => handleOpenModal(order)} className="text-purple-500 hover:text-purple-700 transition-colors" title="Ver Detalhes">
                                        <FaEye size={20}/>
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {filteredOrders.length === 0 && <p className="text-center py-8 text-gray-500">Nenhum pedido encontrado.</p>}

            {selectedOrder && (
                <OrderDetailsModal
                    order={selectedOrder}
                    onClose={handleCloseModal}
                    updateOrderStatus={updateOrderStatus}
                    updatePaymentStatus={updatePaymentStatus}
                />
            )}
        </div>
    );
};

export { Orders };
