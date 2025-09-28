
import React from 'react';
import DashboardIcon from './icons/DashboardIcon';
import OrdersIcon from './icons/OrdersIcon';
import ProductsIcon from './icons/ProductsIcon';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
  currentView: string;
  setCurrentView: (view: 'dashboard' | 'pedidos' | 'produtos') => void;
  isSidebarOpen: boolean;
  setSidebarOpen: (isOpen: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, setCurrentView, isSidebarOpen, setSidebarOpen }) => {
    const { user } = useAuth();

    const navItems = [
        { id: 'dashboard', label: 'Dashboard', icon: DashboardIcon, adminOnly: false },
        { id: 'pedidos', label: 'Pedidos', icon: OrdersIcon, adminOnly: false },
        { id: 'produtos', label: 'Produtos', icon: ProductsIcon, adminOnly: true },
    ];

    const handleNavClick = (view: 'dashboard' | 'pedidos' | 'produtos') => {
        setCurrentView(view);
        setSidebarOpen(false);
    }

    const NavLink: React.FC<{item: typeof navItems[0]}> = ({item}) => {
        const isActive = currentView === item.id;
        const Icon = item.icon;
        return (
            <button
                onClick={() => handleNavClick(item.id as 'dashboard' | 'pedidos' | 'produtos')}
                className={`flex items-center px-4 py-3 w-full text-left transition-colors duration-200 ${
                    isActive
                        ? 'bg-purple-700 text-white'
                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
            >
                <Icon className="h-6 w-6 mr-3" />
                <span className="font-medium">{item.label}</span>
            </button>
        );
    }

    return (
        <>
            {/* Mobile sidebar overlay */}
            <div className={`fixed inset-0 z-20 bg-black bg-opacity-50 transition-opacity lg:hidden ${isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                <div onClick={() => setSidebarOpen(false)} className="absolute inset-0"></div>
            </div>

            {/* Sidebar */}
            <div className={`transform top-0 left-0 w-64 bg-gray-800 text-white fixed h-full overflow-auto ease-in-out transition-all duration-300 z-30 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0`}>
                 <div className="flex items-center justify-center h-20 border-b border-gray-700">
                    <h1 className="text-2xl font-bold text-white">Admin</h1>
                </div>
                <nav className="flex-1 mt-6">
                    {navItems.map(item =>
                        <NavLink key={item.id} item={item} />
                    )}
                </nav>
            </div>
        </>
    );
};

export default Sidebar;
