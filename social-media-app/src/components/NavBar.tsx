import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar: React.FC = () => {
  const location = useLocation();

  return (
    <nav className="bg-white border-gray-200 dark:bg-gray-900">
      <div className="max-w-screen-xl flex items-center justify-between mx-auto p-4">
        <Link to="/" className="flex items-center space-x-3 rtl:space-x-reverse">
          <img src="https://flowbite.com/docs/images/logo.svg" className="h-8" alt="Flowbite Logo" />
          <span className="self-center text-2xl font-semibold whitespace-nowrap dark:text-white">Flowbite</span>
        </Link>
        <div className="flex items-center space-x-8 rtl:space-x-reverse">
          <Link to="/login" className="text-slate-900 hover:text-slate-700 dark:text-slate-200 dark:hover:text-slate-400">
            Login
          </Link>
          {location.pathname === '/login' && (
            <Link to="/register" className="text-slate-900 hover:text-slate-700 dark:text-slate-200 dark:hover:text-slate-400">
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
