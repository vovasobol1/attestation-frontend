// pages/LoginPage.js
import React, { useState } from 'react';
import {
    Container,
    TextField,
    Button,
    Typography,
    Box, InputAdornment, IconButton,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import bcrypt from 'bcryptjs';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import axios from "axios";
import {API} from "../config";


const LoginPage = () => {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const [passwordVisible, setPasswordVisible] = useState(true);

    const toggleVisibility = () => setPasswordVisible(!passwordVisible);

    const handleLogin = async () => {
        try {
            const res = await axios.post(`${API}/login`, { password });
            if (res.data.ok) {
                localStorage.setItem('admin', 'true');
                navigate('/');
            }
        } catch {
            setError('Неверный пароль');
        }
    };


    return (
        <Container maxWidth="xs" sx={{ mt: 10 }}>
            <Typography variant="h5" gutterBottom>
                Вход администратора
            </Typography>

            <Box display="flex" flexDirection="column" gap={2}>
                <TextField
                    label="Пароль"
                    type={passwordVisible ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    fullWidth
                    InputProps={{
                        endAdornment: (
                            <InputAdornment position="end">
                                <IconButton onClick={toggleVisibility} edge="end">
                                    {passwordVisible ? <VisibilityOff /> : <Visibility />}
                                </IconButton>
                            </InputAdornment>
                        ),
                    }}
                />
                {error && <Typography color="error">{error}</Typography>}
                <Button variant="contained" onClick={handleLogin}>
                    Войти
                </Button>
            </Box>
        </Container>
    );
};

export default LoginPage;
