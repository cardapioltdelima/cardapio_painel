import React, { useMemo, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Order, OrderStatus, PaymentStatus, Product } from '../types';
import Card from './Card';
import OrdersIcon from './icons/OrdersIcon';
import { FaDollarSign, FaCheckCircle, FaHourglassHalf, FaTrophy } from 'react-icons/fa';

interface DashboardProps {
    orders: Order[];
    products: Product[];
}

type TimeRange = 'today' | '7days' | '30days';

const Dashboard: React.FC<DashboardProps> = ({ orders, products }) => {
    const [timeRange, setTimeRange] = useState<TimeRange>('today');

    const filteredOrders = useMemo(() => {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        let startDate = today;

        if (timeRange === '7days') {
            startDate = new Date(today.getTime() - 6 * 24 * 60 * 60 * 1000);
        } else if (timeRange === '30days') {
            startDate = new Date(today.getTime() - 29 * 24 * 60 * 60 * 1000);
        }

        return orders.filter(o => new Date(o.createdAt) >= startDate);
    }, [orders, timeRange]);

    const stats = useMemo(() => {
        const faturamento = filteredOrders
            .filter(o => o.payment_status === PaymentStatus.Pago)
            .reduce((sum, o) => sum + o.total, 0);
        
        return {
            totalPedidos: filteredOrders.length,
            faturamento: faturamento.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
            pedidosPendentes: filteredOrders.filter(o => o.status !== OrderStatus.Concluido && o.status !== OrderStatus.Cancelado).length,
            pedidosConcluidos: filteredOrders.filter(o => o.status === OrderStatus.Concluido).length
        };
    }, [filteredOrders]);

    const revenueChartData = useMemo(() => {
        const paidOrders = filteredOrders.filter(o => o.payment_status === PaymentStatus.Pago);
        const dataMap = new Map<string, number>();

        paidOrders.forEach(order => {
            const date = new Date(order.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
            dataMap.set(date, (dataMap.get(date) || 0) + order.total);
        });

        return Array.from(dataMap.entries()).map(([date, total]) => ({ date, Faturamento: total })).reverse();
    }, [filteredOrders]);

    const topProductsData = useMemo(() => {
        const productSales = new Map<string, { name: string; quantity: number; revenue: number }>();

        filteredOrders.forEach(order => {
            order.items.forEach(item => {
                const existing = productSales.get(item.productId) || { name: item.productName, quantity: 0, revenue: 0 };
                productSales.set(item.productId, {
                    ...existing,
                    quantity: existing.quantity + item.quantity,
                    revenue: existing.revenue + (item.quantity * item.price),
                });
            });
        });

        return Array.from(productSales.values())
            .sort((a, b) => b.quantity - a.quantity)
            .slice(0, 5);
    }, [filteredOrders]);

    const TimeRangeButton: React.FC<{range: TimeRange, label: string}> = ({ range, label }) => (
        <button 
            onClick={() => setTimeRange(range)}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                timeRange === range 
                ? 'bg-purple-600 text-white shadow' 
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}>
            {label}
        </button>
    );

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                 <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">Dashboard</h2>
                 <div className="flex space-x-2 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
                    <TimeRangeButton range="today" label="Hoje" />
                    <TimeRangeButton range="7days" label="7 Dias" />
                    <TimeRangeButton range="30days" label="30 Dias" />
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                 <Card title="Total de Pedidos" value={stats.totalPedidos} icon={<OrdersIcon className="h-6 w-6 text-white"/>} color="bg-blue-500" />
                <Card title="Faturamento Total" value={stats.faturamento} icon={<FaDollarSign className="h-6 w-6 text-white"/>} color="bg-green-500" />
                <Card title="Pedidos Pendentes" value={stats.pedidosPendentes} icon={<FaHourglassHalf className="h-6 w-6 text-white"/>} color="bg-yellow-500" />
                <Card title="Pedidos Concluídos" value={stats.pedidosConcluidos} icon={<FaCheckCircle className="h-6 w-6 text-white"/>} color="bg-purple-500" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 h-96">
                    <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">Histórico de Faturamento</h3>
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={revenueChartData} margin={{ top: 5, right: 20, left: -10, bottom: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.3)" />
                            <XAxis dataKey="date" stroke="#9ca3af" />
                            <YAxis stroke="#9ca3af" tickFormatter={(value) => `R$${value}`}/>
                            <Tooltip contentStyle={{ backgroundColor: '#374151', border: 'none', borderRadius: '0.5rem' }} formatter={(value: number) => [value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }), 'Faturamento']}/>
                            <Legend />
                            <Line type="monotone" dataKey="Faturamento" stroke="#8b5cf6" strokeWidth={2} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 h-96">
                    <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">Top 5 Produtos Mais Vendidos</h3>
                     <div className="space-y-4">
                        {topProductsData.map((product, index) => (
                            <div key={product.name} className="flex items-center">
                                <div className="flex-shrink-0 w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mr-4">
                                    {index < 3 ? <FaTrophy className={`text-xl ${index === 0 ? 'text-yellow-400' : index === 1 ? 'text-gray-400' : 'text-yellow-600'}`} /> : <span className="font-bold text-gray-500">{index + 1}</span>}
                                </div>
                                <div className="flex-grow">
                                    <p className="font-medium text-gray-900 dark:text-white truncate">{product.name}</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">{product.quantity} vendidos &bull; {product.revenue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;