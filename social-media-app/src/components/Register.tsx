import React, { useState } from 'react';
import axios from 'axios';

const Register: React.FC = () => {
  const [emailReg, setEmailReg] = useState('');
  const [passwordReg, setPasswordReg] = useState('');

  const register = () => {
    axios.post("http://localhost:3000/register", {
      email: emailReg,
      password: passwordReg,
    }).then((response) => {
      console.log(response.data);
    }).catch((error) => {
      console.error("Error registering:", error.response.data.err);
    });
  };

  return (
    <div className='register'>
      <h1>Register</h1>
      <input 
        type="text"
        onChange={(e) => setEmailReg(e.target.value)}
        placeholder="Email"
      />
      <input 
        type="password"
        onChange={(e) => setPasswordReg(e.target.value)}
        placeholder="Password"
      />
      <button onClick={register}>Register</button>
    </div>
  );
};

export default Register;
