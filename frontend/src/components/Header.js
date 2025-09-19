import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Header = () => {
  const { user, logout } = useAuth();

  return (
    <header className="bg-gray-800 text-white p-4 flex justify-between items-center">
      <Link to="/" className="text-xl font-bold">Grip Invest</Link>
      <nav>
        {user ? (
          <div className="flex items-center space-x-4">
            <Link to="/dashboard" className="hover:text-gray-300">Dashboard</Link>
            <Link to="/products" className="hover:text-gray-300">Products</Link>
            <Link to="/profile" className="hover:text-gray-300">Profile</Link>
            {user && (user.isAdmin || user.is_admin) && ( // Conditionally render for admin
              <>
                <Link to="/admin/products" className="hover:text-gray-300">Admin Products</Link>
                <Link to="/logs" className="hover:text-gray-300">Logs</Link>
              </>
            )}
            <button onClick={logout} className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded">
              Logout
            </button>
          </div>
        ) : (
          <div className="flex items-center space-x-4">
            <Link to="/login" className="hover:text-gray-300">Login</Link>
            <Link to="/signup" className="hover:text-gray-300">Signup</Link>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header;
