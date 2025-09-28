import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import UserIcon from './icons/UserIcon';
import LogoutIcon from './icons/LogoutIcon';

interface HeaderProps {
  currentView: string;
  toggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ currentView, toggleSidebar }) => {
    const { user, logout } = useAuth();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleLogout = async () => {
        await logout();
        setDropdownOpen(false);
    };

    return (
        <header className="flex items-center justify-between h-20 px-6 bg-white dark:bg-gray-800 border-b dark:border-gray-700">
            <div className="flex items-center">
                <button onClick={toggleSidebar} className="md:hidden mr-4 text-gray-500 focus:outline-none">
                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M4 6H20M4 12H20M4 18H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                </button>
                <h1 className="text-2xl font-semibold capitalize text-gray-800 dark:text-white">{currentView}</h1>
            </div>
            <div className="relative" ref={dropdownRef}>
                <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center space-x-2 focus:outline-none"
                >
                    <UserIcon className="h-10 w-10 rounded-full object-cover p-2 bg-gray-200 dark:bg-gray-600" />
                    <div className='text-left hidden sm:block'>
                        <span className="font-medium text-gray-800 dark:text-gray-200">{user?.email}</span>
                    </div>
                </button>

                {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-700 rounded-md shadow-lg overflow-hidden z-20">
                        <div className="py-2">
                            <div className="px-4 py-2">
                                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{user?.email}</p>
                            </div>
                            <div className="border-t border-gray-200 dark:border-gray-600"></div>
                            <button
                                onClick={handleLogout}
                                className="w-full text-left flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600"
                            >
                                <LogoutIcon className="w-4 h-4 mr-2" />
                                <span>Sair</span>
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </header>
    );
};

export default Header;