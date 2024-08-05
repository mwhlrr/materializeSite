// frontend/src/components/Register.js

import React, { useState } from 'react';
import axios from 'axios';

const Register = () => {
  const [form, setForm] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    email: '',
    name: '',
    lastName: ''
  });

  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post('http://localhost:3000/api/users/register', form);
      console.log('Registration successful:', response.data);
      setError('');
    } catch (err) {
      console.error('Registration error:', err.response.data);
      setError(err.response.data.error);
    }
  };

  return (
    <div>
      <h1>Register</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <input type="text" name="username" placeholder="Username" value={form.username} onChange={handleChange} required />
        <input type="email" name="email" placeholder="Email" value={form.email} onChange={handleChange} required />
        <input type="text" name="name" placeholder="First Name" value={form.name} onChange={handleChange} required />
        <input type="text" name="lastName" placeholder="Last Name" value={form.lastName} onChange={handleChange} required />
        <input type="password" name="password" placeholder="Password" value={form.password} onChange={handleChange} required />
        <input type="password" name="confirmPassword" placeholder="Confirm Password" value={form.confirmPassword} onChange={handleChange} required />
        <button type="submit">Register</button>
      </form>
      <button onClick={() => window.location.href = 'http://localhost:3000/auth/google'}>Sign up with Google</button>
      <button onClick={() => window.location.href = 'http://localhost:3000/auth/apple'}>Sign up with Apple</button>
    </div>
  );
};

export default Register;
