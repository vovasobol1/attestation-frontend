// components/ExportDialog.js
import React, { useEffect, useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Grid,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    TextField,
    FormControlLabel,
    Checkbox,
    useMediaQuery,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import axios from 'axios';
import { API } from '../config';
import { useNotifier } from './Notifier';

const ExportDialog = ({ open, onClose }) => {
    const notify = useNotifier();
    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

    const [professions, setProfessions] = useState([]);
    const [loading, setLoading] = useState(false);

    // Фильтры — каждый диапазон можно включить/выключить чекбоксом
    const [useDateRange, setUseDateRange] = useState(false);
    const [dateFrom, setDateFrom] = useState(null);
    const [dateTo, setDateTo] = useState(null);

    const [useCertRange, setUseCertRange] = useState(false);
    const [certFrom, setCertFrom] = useState('');
    const [certTo, setCertTo] = useState('');

    const [profession, setProfession] = useState(''); // '' = Все
    const [result, setResult] = useState(''); // '' = Все

    // Подгружаем список профессий при открытии
    useEffect(() => {
        if (!open) return;
        axios
            .get(`${API}/attestation/professions`)
            .then((res) => setProfessions(Array.isArray(res.data) ? res.data : []))
            .catch((err) => {
                console.error('Ошибка при загрузке профессий:', err);
                notify('Не удалось загрузить список профессий', 'error');
            });
    }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

    const handleExport = async () => {
        // Собираем только включённые фильтры
        const params = {};

        if (useDateRange) {
            if (dateFrom) params.dateFrom = dayjs(dateFrom).format('YYYY-MM-DD');
            if (dateTo) params.dateTo = dayjs(dateTo).format('YYYY-MM-DD');
            if (dateFrom && dateTo && dayjs(dateFrom).isAfter(dayjs(dateTo))) {
                notify('Дата «с» не может быть позже даты «по»', 'error');
                return;
            }
        }
        if (useCertRange) {
            const cf = certFrom !== '' ? Number(certFrom) : null;
            const ct = certTo !== '' ? Number(certTo) : null;
            if (cf !== null && ct !== null && cf > ct) {
                notify('№ сертификата «с» не может быть больше «по»', 'error');
                return;
            }
            if (certFrom !== '') params.certFrom = certFrom;
            if (certTo !== '') params.certTo = certTo;
        }
        if (profession) params.profession = profession;
        if (result) params.result = result;

        setLoading(true);
        try {
            const res = await axios.get(`${API}/attestation/export`, {
                params,
                responseType: 'blob',
            });

            // Имя файла из заголовка, иначе дефолтное
            let fileName = `attestations_${dayjs().format('YYYY-MM-DD')}.xlsx`;
            const cd = res.headers['content-disposition'];
            const match = cd && cd.match(/filename="?([^"]+)"?/);
            if (match) fileName = match[1];

            const blob = new Blob([res.data], {
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            notify('Файл выгружен', 'success');
            onClose();
        } catch (err) {
            console.error('Ошибка при выгрузке в Excel:', err);
            notify('Ошибка при выгрузке', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Dialog
                open={open}
                onClose={onClose}
                fullScreen={fullScreen}
                fullWidth
                maxWidth="sm"
            >
                <DialogTitle>Выгрузка в Excel</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 0 }}>
                        {/* Период по дате визита */}
                        <Grid size={12}>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={useDateRange}
                                        onChange={(e) => setUseDateRange(e.target.checked)}
                                    />
                                }
                                label="Фильтровать по дате визита"
                            />
                        </Grid>
                        {useDateRange && (
                            <>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <DatePicker
                                        label="Дата с"
                                        value={dateFrom}
                                        onChange={setDateFrom}
                                        format="DD.MM.YYYY"
                                        slotProps={{ textField: { fullWidth: true } }}
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <DatePicker
                                        label="Дата по"
                                        value={dateTo}
                                        onChange={setDateTo}
                                        format="DD.MM.YYYY"
                                        slotProps={{ textField: { fullWidth: true } }}
                                    />
                                </Grid>
                            </>
                        )}

                        {/* Диапазон номеров сертификатов */}
                        <Grid size={12}>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={useCertRange}
                                        onChange={(e) => setUseCertRange(e.target.checked)}
                                    />
                                }
                                label="Фильтровать по № сертификата"
                            />
                        </Grid>
                        {useCertRange && (
                            <>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <TextField
                                        fullWidth
                                        type="number"
                                        label="№ с"
                                        value={certFrom}
                                        onChange={(e) => setCertFrom(e.target.value)}
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <TextField
                                        fullWidth
                                        type="number"
                                        label="№ по"
                                        value={certTo}
                                        onChange={(e) => setCertTo(e.target.value)}
                                    />
                                </Grid>
                            </>
                        )}

                        {/* Профессия */}
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <FormControl fullWidth>
                                <InputLabel id="export-profession-label">Профессия</InputLabel>
                                <Select
                                    labelId="export-profession-label"
                                    label="Профессия"
                                    value={profession}
                                    onChange={(e) => setProfession(e.target.value)}
                                >
                                    <MenuItem value="">Все</MenuItem>
                                    {professions.map((p) => (
                                        <MenuItem key={p} value={p}>
                                            {p}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>

                        {/* Результат */}
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <FormControl fullWidth>
                                <InputLabel id="export-result-label">Результат</InputLabel>
                                <Select
                                    labelId="export-result-label"
                                    label="Результат"
                                    value={result}
                                    onChange={(e) => setResult(e.target.value)}
                                >
                                    <MenuItem value="">Все</MenuItem>
                                    <MenuItem value="passed">Сдал</MenuItem>
                                    <MenuItem value="failed">Не сдал</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions
                    sx={{
                        flexDirection: { xs: 'column', sm: 'row' },
                        gap: 1,
                        px: 3,
                        pb: 2,
                        '& > *': { ml: '0 !important' },
                    }}
                >
                    <Button onClick={onClose} fullWidth={fullScreen} disabled={loading}>
                        Отмена
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleExport}
                        fullWidth={fullScreen}
                        disabled={loading}
                    >
                        {loading ? 'Выгрузка…' : 'Выгрузить в Excel'}
                    </Button>
                </DialogActions>
            </Dialog>
        </LocalizationProvider>
    );
};

export default ExportDialog;
