import React, { useState } from 'react';
import {
    Container,
    TextField,
    Button,
    Typography,
    Box,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from "axios";
import { API } from "../config";

const SearchAttestation = () => {
    const [passport, setPassport] = useState('');
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleSearch = async () => {
        const trimmedPassport = passport.trim();
        if (!trimmedPassport) {
            setError('Введите номер паспорта');
            return;
        }

        try {
            const response = await axios.get(`${API}/attestation/search`, {
                params: { passport: trimmedPassport }
            });

            if (response.data) {
                navigate('/', { state: response.data });
            } else {
                setError('Запись не найдена');
            }
        } catch (err) {
            setError('Запись не найдена');
        }
    };

    return (

        <Container maxWidth="sm" sx={{ mt: 6 }}>
            <Typography variant="h5" gutterBottom>
                Поиск по номеру паспорта
            </Typography>

            <Box display="flex" gap={2} mb={4}>
                <TextField
                    label="Паспорт"
                    variant="outlined"
                    fullWidth
                    value={passport}
                    onChange={(e) => {
                        setPassport(e.target.value);
                        setError(null); // убираем ошибку при новом вводе
                    }}
                />
                <Button variant="contained" onClick={handleSearch}>
                    Найти
                </Button>
            </Box>
            <Button
                variant="outlined"
                onClick={() => navigate('/')}
                sx={{ mb: 2 }}
            >
                Назад
            </Button>

            {error && (
                <Typography color="error">{error}</Typography>
            )}
        </Container>
    );
};

export default SearchAttestation;
