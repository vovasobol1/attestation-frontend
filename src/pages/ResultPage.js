import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
    Container,
    Typography,
    CircularProgress,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableRow,
    Paper,
    Box,
    Button
} from '@mui/material';
import axios from 'axios';
import { API } from '../config';

const ResultPage = () => {
    const { passport } = useParams();
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axios.get(`${API}/attestation/result/${passport}`)
            .then(res => {
                setData(res.data);
                setLoading(false);
            })
            .catch(() => {
                setError('Информация не найдена');
                setLoading(false);
            });
    }, [passport]);

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Container maxWidth="sm" sx={{ mt: 6 }}>
                <Typography color="error" variant="h6" align="center">
                    {error}
                </Typography>
            </Container>
        );
    }

    const rows = [
        ['ФИО', data.fullName],
        ['Паспорт', data.passport],
        ['Страна паспорта', data.passportCountry],
        ['Профессия', data.profession],
        ['Судимость', data.conviction],
        ['Запрет в РФ', data.rfBan],
        ['Дата визита', data.visitDate ? new Date(data.visitDate).toLocaleDateString() : '—'],
    ];

    const formattedNumber = data.certificateNumber
        ? data.certificateNumber.toString().padStart(6, '0')
        : '';

    const downloadFile = async (key, filename = null) => {
        try {
            const encodedKey = encodeURIComponent(key);
            const response = await axios.get(`${API}/download/${encodedKey}`, {
                responseType: 'blob'
            });

            const blob = new Blob([response.data]);
            const url = window.URL.createObjectURL(blob);

            const link = document.createElement('a');
            link.href = url;
            link.download = filename || key.split('/').pop();
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error('Ошибка при скачивании файла:', err);
        }
    };

    return (
        <>
            {data.certificateNumber && (
                <Box
                    sx={{
                        position: 'fixed',
                        top: 8,
                        right: 16,
                        zIndex: 1300
                    }}
                >
                    <Typography variant="caption" color="text.primary">
                        № {data.certificateNumber.toString().padStart(6, '0')}
                    </Typography>
                </Box>
            )}
            <Container maxWidth="sm" sx={{ mt: { xs: 2, md: 4 }, px: { xs: 1, sm: 2 }, position: 'relative' }}>

                <Typography variant="h5" gutterBottom align="center">
                    Сертификат о прохождении аттестации
                </Typography>
                <Typography variant="subtitle1" gutterBottom align="center" sx={{ mb: 4 }}>
                    Certificate of Completion of Attestation
                </Typography>


                <TableContainer component={Paper} elevation={3}>
                    <Table>
                        <TableBody>
                            {rows.map(([label, value]) => (
                                <TableRow key={label}>
                                    <TableCell sx={{ fontWeight: 'bold', width: '40%' }}>{label}</TableCell>
                                    <TableCell>{value}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>

                {data.photoUrls && data.photoUrls.length > 0 && (
                    <Box mt={4}>
                        <Typography variant="h6" gutterBottom>Загруженные файлы</Typography>

                        <Box display="flex" flexDirection="column" gap={3}>
                            {data.photoUrls.map((key) => {
                                const filename = key.split('/').pop();
                                const isPdf = filename.toLowerCase().endsWith('.pdf');
                                const fileUrl = `${API}/download/${encodeURIComponent(key)}?inline=true`;

                                return (
                                    <Box key={key}>
                                        <Typography variant="body2" gutterBottom>
                                            {filename}
                                            {isPdf && (
                                                <Button
                                                    size="small"
                                                    variant="outlined"
                                                    sx={{ ml: 1, mt: { xs: 1, sm: 0 } }}
                                                    onClick={() => window.open(fileUrl, '_blank')}
                                                >
                                                    Открыть PDF
                                                </Button>
                                            )}
                                        </Typography>

                                        {!isPdf && (
                                            <Box
                                                component="img"
                                                src={fileUrl}
                                                alt={filename}
                                                sx={{
                                                    width: '100%',
                                                    maxHeight: 300,
                                                    objectFit: 'contain',
                                                    borderRadius: 2,
                                                    border: '1px solid #ccc'
                                                }}
                                            />
                                        )}
                                    </Box>
                                );
                            })}
                        </Box>
                    </Box>
                )}
                {data.attestations && Array.isArray(data.attestations) && data.attestations.length > 0 && (
                    <Box mt={4}>
                        <Typography variant="h6" gutterBottom>Аттестации</Typography>

                        {data.attestations.map((item, idx) => (
                            <Paper key={idx} sx={{ p: 2, mb: 2 }}>
                                <Typography variant="subtitle1" gutterBottom>
                                    Вид аттестации: <strong>{item.type || '—'}</strong>
                                </Typography>
                                <Typography>Теория: {item.theory || '—'}</Typography>
                                <Typography>Практика: {item.practice || '—'}</Typography>
                            </Paper>
                        ))}
                    </Box>
                )}

            </Container>
        </>

    );
};

export default ResultPage;
