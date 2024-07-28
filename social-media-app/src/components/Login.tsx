import React, { useState } from 'react';
import axios from 'axios';
import { useUser } from '../components/UserContext';

const Login: React.FC = () => {
  const [emailLog, setEmailLog] = useState('');
  const [passwordLog, setPasswordLog] = useState('');
  const{setUserId}=useUser();

  const login = () => {
    axios.post("http://localhost:3000/login", {
      email: emailLog,
      password: passwordLog,
    }).then((response) => {
      if (response.data.userId) {
        setUserId(response.data.userId);  // Set userId from response
      }
    }).catch((error) => {
      console.error("Error logging in:", error.response.data.message);
    });
  };

  return (
    <div className='login'>
      <h1>Login</h1>
      <input 
        type="text"
        onChange={(e) => setEmailLog(e.target.value)}
        placeholder="Email"
      />
      <input 
        type="password"
        onChange={(e) => setPasswordLog(e.target.value)}
        placeholder="Password"
      />
      <button onClick={login}>Login</button>
    </div>
  );
};

export default Login;
