import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '../components/UserContext'; // Ensure this is correct
import axios from 'axios';

const Login: React.FC = () => {
  const [emailLog, setEmailLog] = useState('');
  const [passwordLog, setPasswordLog] = useState('');
  const { setUserId, setToken } = useUser(); // Correctly use UserContext
  const navigate = useNavigate(); // Hook for navigation

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:3000/login", {
        email: emailLog,
        password: passwordLog,
      });

      // Ensure response contains userId and token
      if (response.data.userId && response.data.token) {
        setUserId(response.data.userId); // Set userId from response
        setToken(response.data.token); // Set token in context
        localStorage.setItem('token', response.data.token); // Store token in localStorage

        // Redirect to home page
        navigate('/');
      } else {
        console.error("Login response did not contain userId or token");
      }
    } catch (error) {
      console.error("Error logging in:", error.response?.data?.message || error.message);
    }
  }

  return (
    <div className="max-w-md mx-auto mt-10">
      <h2 className="text-2xl font-bold mb-4">Login</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="email" className="block text-gray-700">Email:</label>
          <input
            type="email"
            id="email"
            className="w-full px-3 py-2 border border-gray-300 rounded"
            value={emailLog}
            onChange={(e) => setEmailLog(e.target.value)}
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="password" className="block text-gray-700">Password:</label>
          <input
            type="password"
            id="password"
            className="w-full px-3 py-2 border border-gray-300 rounded"
            value={passwordLog}
            onChange={(e) => setPasswordLog(e.target.value)}
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-slate-800 text-white py-2 rounded hover:bg-slate-600"
        >
          Login
        </button>
      </form>
      <p className="mt-4">
        Don't have an account?{' '}
        <Link to="/register" className="text-blue-500 hover:underline">
          Register
        </Link>
      </p>
    </div>
  );
};

export default Login;
