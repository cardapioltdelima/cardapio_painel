import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import Login from './components/Login';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import Orders from './components/Orders';
import Products from './components/Products';
import { useSupabaseData } from './hooks/useSupabaseData';

type View = 'dashboard' | 'pedidos' | 'produtos';

const MainApp: React.FC = () => {
    const [currentView, setCurrentView] = useState<View>('dashboard');
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const data = useSupabaseData();

    const renderView = () => {
        switch (currentView) {
            case 'dashboard':
                return <Dashboard orders={data.orders} products={data.products} />;
            case 'pedidos':
                return <Orders orders={data.orders} products={data.products} updateOrderStatus={data.updateOrderStatus} updatePaymentStatus={data.updatePaymentStatus} />;
            case 'produtos':
                return <Products products={data.products} categories={data.categories} saveProduct={data.saveProduct} deleteProduct={data.deleteProduct} />;
            default:
                return <Dashboard orders={data.orders} products={data.products} />;
        }
    };

    return (
        <div className="flex h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
            <Sidebar currentView={currentView} setCurrentView={setCurrentView} isSidebarOpen={isSidebarOpen} setSidebarOpen={setSidebarOpen} />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header currentView={currentView} toggleSidebar={() => setSidebarOpen(!isSidebarOpen)} />
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 dark:bg-gray-900 p-4 sm:p-6 lg:p-8">
                    {renderView()}
                </main>
            </div>
        </div>
    );
};


const App: React.FC = () => {
    const { user, loading } = useAuth();

    if (loading) {
        return <div className="flex items-center justify-center h-screen">Carregando...</div>; // Ou um componente de spinner
    }

    return user ? <MainApp /> : <Login />;
}

export default App;