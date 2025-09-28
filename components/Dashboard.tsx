
import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Order, OrderStatus } from '../types';
import Card from './Card';
import OrdersIcon from './icons/OrdersIcon';
import { FaDollarSign, FaCheckCircle, FaHourglassHalf } from 'react-icons/fa';


interface DashboardProps {
    orders: Order[];
}

const Dashboard: React.FC<DashboardProps> = ({ orders }) => {

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dailyStats = useMemo(() => {
        const todaysOrders = orders.filter(o => new Date(o.createdAt) >= today);
        const faturamentoDiario = todaysOrders
            .filter(o => o.status === OrderStatus.Concluido)
            .reduce((sum, o) => sum + o.total, 0);
        return {
            pedidosNoDia: todaysOrders.length,
            faturamentoDiario: faturamentoDiario.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
            pedidosPendentes: todaysOrders.filter(o => o.status === OrderStatus.Aguardando || o.status === OrderStatus.EmPreparo).length,
            pedidosConcluidos: todaysOrders.filter(o => o.status === OrderStatus.Concluido).length
        };
    }, [orders]);

    const orderStatusData = useMemo(() => {
        const statusCounts = orders.reduce((acc, order) => {
            acc[order.status] = (acc[order.status] || 0) + 1;
            return acc;
        }, {} as Record<OrderStatus, number>);
        
        return Object.entries(statusCounts).map(([name, value]) => ({ name, Pedidos: value }));
    }, [orders]);

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                 <Card 
                    title="Pedidos no Dia" 
                    value={dailyStats.pedidosNoDia} 
                    icon={<OrdersIcon className="h-6 w-6 text-white"/>}
                    color="bg-blue-500"
                />
                <Card 
                    title="Faturamento Diário" 
                    value={dailyStats.faturamentoDiario} 
                    icon={<FaDollarSign className="h-6 w-6 text-white"/>}
                    color="bg-green-500"
                />
                <Card 
                    title="Pedidos Pendentes" 
                    value={dailyStats.pedidosPendentes} 
                    icon={<FaHourglassHalf className="h-6 w-6 text-white"/>}
                    color="bg-yellow-500"
                />
                <Card 
                    title="Pedidos Concluídos (dia)" 
                    value={dailyStats.pedidosConcluidos} 
                    icon={<FaCheckCircle className="h-6 w-6 text-white"/>}
                    color="bg-purple-500"
                />
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 h-96">
                <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">Distribuição de Status de Pedidos (Total)</h3>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={orderStatusData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.3)" />
                        <XAxis dataKey="name" stroke="#9ca3af" />
                        <YAxis stroke="#9ca3af"/>
                        <Tooltip contentStyle={{ backgroundColor: '#374151', border: 'none', borderRadius: '0.5rem' }}/>
                        <Legend />
                        <Bar dataKey="Pedidos" fill="#8b5cf6" />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default Dashboard;
