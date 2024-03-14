import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export const Login = () => {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleUsername = (e) => {
        setUsername(e.target.value.trim());
    }

    const handlePassword = (e) => {
        setPassword(e.target.value.trim());
    }

    const handleLogin = () => {
        axios.post('http://localhost:3000/api/login', {
            username,
            password
        })
        .then((res) => {
            if (res.status === 200) {
                localStorage.setItem('username', res.data.username);
                localStorage.setItem('channel_id', res.data.channel_id);
                localStorage.setItem('accessToken', res.data.accessToken);
                navigate('/dashboard');
            }
        })
        .catch((err) => {
            console.error(err);
        });
    }
  return (
    <div className="Login">
      <div>
        <label for="username">Username</label>
        <input type="text" name="username" required onChange={handleUsername} />

        <label for="password">Password</label>
        <input type="password" name="password" required onChange={handlePassword}/>

        <button type="button" onClick={handleLogin}>Login</button>
      </div>
    </div>
  );
};
