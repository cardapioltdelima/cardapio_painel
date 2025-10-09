
import React, { useState } from 'react';
import { Order, OrderStatus, PaymentStatus } from '../types';
import { FaWhatsapp, FaUser, FaMapMarkerAlt, FaTimes, FaCalendarAlt, FaClock } from 'react-icons/fa';
import Receipt from './Receipt';
import './Receipt.css';

interface OrderDetailsModalProps {
    order: Order;
    onClose: () => void;
    updateOrderStatus: (orderId: string, newStatus: OrderStatus) => void;
    updatePaymentStatus: (orderId: string, newStatus: PaymentStatus) => void;
}

const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({ order, onClose, updateOrderStatus, updatePaymentStatus }) => {

    const [currentStatus, setCurrentStatus] = useState(order.status);
    const [currentPaymentStatus, setCurrentPaymentStatus] = useState(order.payment_status);
    const [isPrinting, setIsPrinting] = useState(false);

    const handleSave = () => {
        if (currentStatus !== order.status) {
            updateOrderStatus(order.id, currentStatus);
        }
        if (currentPaymentStatus !== order.payment_status) {
            updatePaymentStatus(order.id, currentPaymentStatus);
        }
        onClose(); // Close modal after saving
    };

    const handlePrint = () => {
        setIsPrinting(true);
        setTimeout(() => {
            window.print();
            setIsPrinting(false);
        }, 100);
    };

    return (
        <>
            <div className={`fixed inset-0 bg-black bg-opacity-60 z-40 flex justify-center items-center ${isPrinting ? 'printing' : ''}`} onClick={onClose}>
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 sm:p-8 w-full max-w-2xl m-4 transform transition-all" onClick={e => e.stopPropagation()}>
                    <div className="flex justify-between items-center border-b pb-4 mb-4 dark:border-gray-600">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Detalhes do Pedido #{order.id.slice(-6)}</h2>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                            <FaTimes size={24} />
                        </button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Customer Info */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Informações do Cliente</h3>
                            <div className="flex items-center space-x-3 text-gray-600 dark:text-gray-300">
                                <FaUser className="text-purple-500"/>
                                <span>{order.customer.name}</span>
                            </div>
                            <div className="flex items-center space-x-3 text-gray-600 dark:text-gray-300">
                                <FaMapMarkerAlt className="text-purple-500"/>
                                <span>{order.customer.address}</span>
                            </div>
                            <a 
                                href={`https://wa.me/${order.customer.whatsapp}`} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="inline-flex items-center space-x-3 text-green-500 hover:text-green-600"
                            >
                                <FaWhatsapp />
                                <span>{order.customer.whatsapp}</span>
                            </a>
                        </div>

                        {/* Scheduling Info */}
                        {order.data_agendamento && (
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Informações de Agendamento</h3>
                                <div className="flex items-center space-x-3 text-gray-600 dark:text-gray-300">
                                    <FaCalendarAlt className="text-purple-500"/>
                                    <span>{new Date(order.data_agendamento).toLocaleDateString('pt-BR')}</span>
                                </div>
                                <div className="flex items-center space-x-3 text-gray-600 dark:text-gray-300">
                                    <FaClock className="text-purple-500"/>
                                    <span>{order.turno} - {order.horario_agendamento}</span>
                                </div>
                            </div>
                        )}
                        
                        {/* Order Items */}
                        <div>
                            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Itens do Pedido</h3>
                            <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                            {order.items.map(item => (
                                <div key={item.productId} className="flex justify-between items-center text-gray-600 dark:text-gray-300">
                                    <p>{item.quantity}x {item.productName}</p>
                                    <p>{(item.quantity * item.price).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                                </div>
                            ))}
                            </div>
                            <div className="flex justify-between items-center mt-4 pt-2 border-t dark:border-gray-600">
                                 <p className="font-bold text-gray-800 dark:text-white">Total:</p>
                                 <p className="font-bold text-lg text-purple-600 dark:text-purple-400">{order.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">Mudar Status do Pedido</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Status atual: <span className='font-bold'>{currentStatus}</span></p>
                            <div className="flex flex-wrap gap-3">
                                {order.status === OrderStatus.Aguardando && (
                                    <button onClick={() => setCurrentStatus(OrderStatus.EmPreparo)} className={`px-4 py-2 text-white rounded-lg transition-colors ${currentStatus === OrderStatus.EmPreparo ? 'bg-blue-600' : 'bg-blue-400 hover:bg-blue-500'}`}>
                                        Aprovar / Em Preparo
                                    </button>
                                )}
                                {order.status === OrderStatus.EmPreparo && (
                                    <button onClick={() => setCurrentStatus(OrderStatus.Concluido)} className={`px-4 py-2 text-white rounded-lg transition-colors ${currentStatus === OrderStatus.Concluido ? 'bg-green-600' : 'bg-green-400 hover:bg-green-500'}`}>
                                        Marcar como Concluído
                                    </button>
                                )}
                                {order.status !== OrderStatus.Cancelado && order.status !== OrderStatus.Concluido && (
                                    <button onClick={() => setCurrentStatus(OrderStatus.Cancelado)} className={`px-4 py-2 text-white rounded-lg transition-colors ${currentStatus === OrderStatus.Cancelado ? 'bg-red-600' : 'bg-red-400 hover:bg-red-500'}`}>
                                        Cancelar Pedido
                                    </button>
                                )}
                            </div>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">Mudar Status do Pagamento</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Status atual: <span className='font-bold'>{currentPaymentStatus}</span></p>
                            <select
                                value={currentPaymentStatus}
                                onChange={(e) => setCurrentPaymentStatus(e.target.value as PaymentStatus)}
                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-purple-500 focus:border-purple-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-purple-500 dark:focus:border-purple-500"
                            >
                                {Object.values(PaymentStatus).map(status => (
                                    <option key={status} value={status}>{status}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Save and Print Buttons */}
                    <div className="mt-8 pt-4 border-t dark:border-gray-600 flex justify-end gap-4">
                        <button 
                            onClick={handlePrint}
                            className="px-6 py-2 bg-gray-500 text-white font-bold rounded-lg hover:bg-gray-600 transition-colors"
                        >
                            Imprimir Recibo
                        </button>
                        <button 
                            onClick={handleSave}
                            className="px-6 py-2 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-700 transition-colors disabled:bg-gray-400"
                            disabled={currentStatus === order.status && currentPaymentStatus === order.payment_status}
                        >
                            Salvar Alterações
                        </button>
                    </div>
                </div>
            </div>
            {isPrinting && <Receipt order={order} />}
        </>
    );
};

export default OrderDetailsModal;
