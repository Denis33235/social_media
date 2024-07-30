import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useUser } from '../components/UserContext'; // Assuming you have a UserContext

const Navbar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { userId, token, setUserId, setToken } = useUser(); // Add setUserId and setToken to UserContext

  const handleLogout = () => {
    setUserId(null);
    setToken(null);
    navigate('/login');
  };

  return (
    <nav className="bg-white border-gray-200 dark:bg-gray-900">
      <div className="max-w-screen-xl flex items-center justify-between mx-auto p-4">
        <Link to="/" className="flex items-center space-x-3 rtl:space-x-reverse">
          <img src="https://flowbite.com/docs/images/logo.svg" className="h-8" alt="Flowbite Logo" />
          <span className="self-center text-2xl font-semibold whitespace-nowrap dark:text-white">Flowbite</span>
        </Link>
        <div className="flex items-center space-x-8 rtl:space-x-reverse">
          <Link
            to="/"
            className={`text-slate-900 hover:text-slate-700 dark:text-slate-200 dark:hover:text-slate-400 ${location.pathname === '/' ? 'font-bold' : ''}`}
          >
            Home
          </Link>
          <Link
            to="/search-users"
            className={`text-slate-900 hover:text-slate-700 dark:text-slate-200 dark:hover:text-slate-400 ${location.pathname === '/search-users' ? 'font-bold' : ''}`}
          >
            Search Users
          </Link>
          <Link
            to="/profile"
            className={`text-slate-900 hover:text-slate-700 dark:text-slate-200 dark:hover:text-slate-400 ${location.pathname === '/profile' ? 'font-bold' : ''}`}
          >
            Profile
          </Link>
          {!userId ? (
            <>
              <Link
                to="/login"
                className={`text-slate-900 hover:text-slate-700 dark:text-slate-200 dark:hover:text-slate-400 ${location.pathname === '/login' ? 'font-bold' : ''}`}
              >
                Login
              </Link>
              {location.pathname === '/login' && (
                <Link
                  to="/register"
                  className="text-slate-900 hover:text-slate-700 dark:text-slate-200 dark:hover:text-slate-400"
                >
                  Register
                </Link>
              )}
            </>
          ) : (
            <button
              onClick={handleLogout}
              className="text-slate-900 hover:text-slate-700 dark:text-slate-200 dark:hover:text-slate-400"
            >
              Logout
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
