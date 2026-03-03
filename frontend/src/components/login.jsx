import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/config';

export default function Login() {
    const [credentials, setCredentials] = useState({
        username: '',
        password: ''
    });

    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        setCredentials({
            ...credentials,
            [e.target.name]: e.target.value
        });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Note the trailing slash!
            const response = await api.post('accounts/login/', credentials);

            // Save the JWT tokens returned by Django SimpleJWT
            localStorage.setItem('access_token', response.data.access);
            localStorage.setItem('refresh_token', response.data.refresh);

            // Redirect the user to the home page and force a reload to update App.jsx state
            window.location.href = '/';
        } catch (error) {
            // Safely handle error like we did in register.jsx
            if (error.response && error.response.data) {
                const errorMsg = error.response.data.detail || JSON.stringify(error.response.data);
                setError(errorMsg);
            } else {
                setError("Network error or CORS issue blocked the request.");
            }
        }
    };

    return (
        <div className='logincontainer'>
            <h2>Login</h2>

            {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}

            <form onSubmit={handleSubmit}>
                <div>
                    <label>Username: </label>
                    <input
                        type="text"
                        name="username"
                        value={credentials.username}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div>
                    <label>Password: </label>
                    <input
                        type="password"
                        name="password"
                        value={credentials.password}
                        onChange={handleChange}
                        required
                    />
                </div>
                <button type="submit">Login</button>
            </form>
        </div>
    );
}
