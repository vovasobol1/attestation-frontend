import React, {useEffect, useState} from 'react';
import { saveAs } from 'file-saver';
import * as fontkit from 'fontkit';
import { PDFDocument, rgb , StandardFonts} from 'pdf-lib';
import {
    Container,
    TextField,
    MenuItem,
    Button,
    Typography,
    InputLabel,
    Select,
    FormControl,
    Grid,
    Box, Tooltip, Divider,
} from '@mui/material';
import {useLocation, useNavigate, useParams} from "react-router-dom";
import axios from "axios";
import {API} from "../config";
import QRCode from "qrcode";
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import {useNotifier} from "../components/Notifier";
import SelectWithOther from "../components/SelectWithOter";
import ConfirmDialog from "../components/ConfirmDialog";
import ExportDialog from "../components/ExportDialog";


const professions = [
    'Сварщик ручной дуговой сварки',
    'Сварщик-аргонщик',
    'Монтажник',
    'Арматурщик',
    'Плотник',
    'Бетонщик',
];

const attestationTypes = [
    'Сварка ручная дуговая Д25 до Д159',
    'Сварка ручная дуговая Д159 до Д426',
    'Сварка ручная дуговая Д426 до Д820',
    'Сварка ручная дуговая Д820 до Д1020',
    'Сварка ручная дуговая Д1020 до Д1420',
    'Бетонные работы',
    'Монтажные работы на трубопроводе',
    'Вязка арматуры',
    'Опалубка',
];

const countries = ['Россия', 'Узбекистан', 'Казахстан', 'Таджикистан'];

const AttestationForm = ({ isEdit = false }) => {
    const notify = useNotifier();

    const [openConfirm, setOpenConfirm] = useState(false);
    const [openExport, setOpenExport] = useState(false);
    const [certificateNumber, setCertificateNumber] = useState('');
    const [form, setForm] = useState({
        fullName: '',
        passport: '',
        passportCountry: '',
        profession: '',
        rank: '',
        visitDate: '',
        conviction: 'Нет',
        rfBan: 'Разрешено',
        attestation:{} ,
        photoUrls : [],
    });
    const [originalPassport, setOriginalPassport] = useState(null);
    const [formAttestat, setFormAttestat] = useState({
        attestations: [
            { type: '', theory: '', practice: '' }
        ]
    });
    const [qrUrl, setQrUrl] = useState('');
    const [selectedFiles, setSelectedFiles] = useState([]);

    const navigate = useNavigate();
    const location = useLocation();
    const { passport: paramPassport } = useParams();


    const downloadQRCodePdf = async (qrUrl, certificateNumber, fullName , profession , rank , date) => {
        try {
            if (!qrUrl.startsWith('data:image')) {
                notify("QR-код ещё не сгенерирован", "error");
                return;
            }

            const templateBytes = await fetch('/templates/certificate_template.pdf').then(res => res.arrayBuffer());
            const pdfDoc = await PDFDocument.load(templateBytes);

            const [page] = pdfDoc.getPages();

            // Встраиваем QR-код
            const pngImageBytes = await fetch(qrUrl).then((res) => res.arrayBuffer());
            const pngImage = await pdfDoc.embedPng(pngImageBytes);

            page.drawImage(pngImage, {
                x: 130,
                y: 1090,
                width: 185,
                height: 185,
            });

            pdfDoc.registerFontkit(fontkit); // обязательно!

            const fontBytes = await fetch('/fonts/RobotoCondensed-Medium.ttf').then(res => res.arrayBuffer());
            const customFont = await pdfDoc.embedFont(fontBytes);

            page.drawText(`№ ${certificateNumber}/2025`, {
                x: 550,
                y: 1325,
                size: 22,
                font: customFont,
                color: rgb(8 / 255, 110 / 255, 182 / 255)
            });


            const fontBebasBytes = await fetch('/fonts/bebas.ttf').then(res => res.arrayBuffer());
            const customBebasFont = await pdfDoc.embedFont(fontBebasBytes);

            page.drawText(`${fullName}`, {
                x: 80,
                y: 750,
                size: 57,
                font: customBebasFont,
                color: rgb(8 / 255, 110 / 255, 182 / 255)
            });


            // Собираем две строки
            const line1 = `${profession}, прошёл проверку знаний`;
            const line2 = 'и соответствует требованиям по профессии.';

            // Вставляем в PDF
            page.drawText(line1, {
                x: 80,
                y: 700,
                font: customFont,
                size: 22,
                color: rgb(0, 0, 0),
            });

            page.drawText(line2, {
                x: 80,
                y: 680,
                font: customFont,
                size: 22,
                color: rgb(0, 0, 0),
            });


            const certLine1 = `Настоящий сертификат подтверждает что ${fullName} может`;
            const certLine2 = `осуществять профессиональную деятельность на строительных проектах Группы "Газстройпром"`;
            const certLine3 = `по профессии ${profession   }.`;

            page.drawText(certLine1, {
                x: 80,
                y: 520,
                font: customFont,
                size: 22,
                color: rgb(0, 0, 0),
            });

            page.drawText(certLine2, {
                x: 80,
                y: 500,
                font: customFont,
                size: 22,
                color: rgb(0, 0, 0),
            });

            page.drawText(certLine3, {
                x: 80,
                y: 480,
                font: customFont,
                size: 22,
                color: rgb(0, 0, 0),
            });

            const arialBytes = await fetch('/fonts/ArialMT.ttf').then(res => res.arrayBuffer());
            const arialFont = await pdfDoc.embedFont(arialBytes);

            page.drawText(`${profession}`, {
                x: 80,
                y: 435,
                font: arialFont,
                size: 22,
                color: rgb(8 / 255, 110 / 255, 182 / 255)
            });

            const rankText = `Разряд: ${rank || '-'}`;
            page.drawText(`Разряд: ${rankText}`, {
                x: 80,
                y: 405,
                font: arialFont,
                size: 22,
                color: rgb(8 / 255, 110 / 255, 182 / 255)
            });

            const dateObj = new Date(date);
            const formattedDate = dateObj.toLocaleDateString('ru-RU', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            }) + ' г.';
            const dateLine = `Дата проверки: ${formattedDate}`;
            const orgLine = 'Организация: АО «Газстройпром»';

            const calibriBytes = await fetch('/fonts/Calibri.ttf').then(res => res.arrayBuffer());
            const calibriFont = await pdfDoc.embedFont(calibriBytes);

            page.drawText(dateLine, {
                x: 80,
                y: 350,
                font: calibriFont,
                size: 18,
                color: rgb(0, 0, 0)
            });

            page.drawText(orgLine, {
                x: 80,
                y: 330,
                font: calibriFont,
                size: 18,
                color: rgb(0, 0, 0)
            });


            const certNumFormatted = certificateNumber.toString().padStart(2, '0');

            // формат года: последние 2 цифры, с ведущим нулём если нужно
            const year = dateObj.getFullYear();
            const yearShort = (year % 100).toString().padStart(3, '0');
            const protocolLine1 = `Сертификат выдан на основании`;
            const protocolLine2 = `протокола №${certificateNumber}/${yearShort} от ${formattedDate}`;

            page.drawText(protocolLine1, {
                x: 700,
                y: 350,
                font: calibriFont,
                size: 18,
                color: rgb(0, 0, 0),
            });

            page.drawText(protocolLine2, {
                x: 700,
                y: 330,
                font: calibriFont,
                size: 18,
                color: rgb(0, 0, 0),
            });

            const issueLine = `Дата выдачи: ${formattedDate}`;
            page.drawText(issueLine, {
                x: 830 ,
                y: 90,
                font: customFont,
                size: 16,
                color: rgb(8 / 255, 110 / 255, 182 / 255)
            });


            const pdfBytes = await pdfDoc.save();
            const blob = new Blob([pdfBytes], { type: 'application/pdf' });
            saveAs(blob, `certificate_${fullName.replace(/\s+/g, '_')}.pdf`);
        } catch (err) {
            console.error('Ошибка при скачивании PDF:', err);
        }
    };

    const removeAttestation = (index) => {
        if (formAttestat.attestations.length === 1) return;

        const updated = formAttestat.attestations.filter((_, i) => i !== index);
        setFormAttestat(prev => ({ ...prev, attestations: updated }));
    };

    const onChange = (e) => {
        const { name, value, files } = e.target;
        setForm({
            ...form,
            [name]: files ? files[0] : value,
        });
    };

    const clearForm = () => {
        setForm({
            fullName: '',
            passport: '',
            passportCountry: '',
            profession: '',
            visitDate: '',
            conviction: 'Нет',
            rfBan: 'Разрешено',
            photoUrls: [],
        });
        setFormAttestat({
            attestations: [{ type: '', theory: '', practice: '' }]
        });
        setOriginalPassport(null);
        setSelectedFiles([]);
        setQrUrl('');
        setCertificateNumber('');
        if (location.state) navigate('/', { replace: true });
    };
    const handleDeleteAttestation = async () => {
        if (!originalPassport) return;

        setOpenConfirm(false); // закрыть диалог

        try {
            await axios.delete(`${API}/attestation/delete`, {
                data: { passport: originalPassport }
            });

            notify('Анкета удалена', 'success');

            // Очистить всё
            setForm({
                fullName: '',
                passport: '',
                passportCountry: '',
                profession: '',
                visitDate: '',
                conviction: 'Нет',
                rfBan: 'Разрешено',
                photoUrls: [],
            });
            setCertificateNumber('');

            setFormAttestat({
                attestations: [{ type: '', theory: '', practice: '' }]
            });

            setSelectedFiles([]);
            setQrUrl('');
            setOriginalPassport(null);

            // Переход на главную
            navigate('/');
        } catch (err) {
            console.error('Ошибка при удалении анкеты:', err);
            notify('Ошибка при удалении', 'error');
        }
    };
    const handleSubmit = async () => {
        if (!form.passport?.trim()) {
            notify('введите номер паспорта', 'error');
            return;
        }

        if (!form.visitDate?.trim()) {
            notify('выберите дату проверки', 'error');
            return;
        }

        try {
            // --- Подготовка файлов к загрузке ---
            let newPhotoUrls = [];
            const formData = new FormData();

            selectedFiles.forEach(file => {
                // Отбираем только новые файлы (объекты File) для загрузки
                if (typeof file !== 'string') {
                    formData.append('files', file);
                }
            });

            // Если есть новые файлы, загружаем их
            if (formData.has('files')) {
                const uploadRes = await axios.post(`${API}/upload`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });

                const urls = uploadRes.data.urls || [];
                newPhotoUrls = urls.map((url) => {
                    const u = new URL(url);
                    return u.pathname.split('/').slice(2).join('/');
                });
            }

            // --- Формирование итогового списка файлов ---
            // Собираем уже существующие файлы (строки)
            const existingPhotoUrls = selectedFiles.filter(file => typeof file === 'string');
            // Объединяем старые и новые (уже в виде строк)
            const photoUrls = [...existingPhotoUrls, ...newPhotoUrls];

            const preparedForm = {
                ...form,
                photoUrls,
                attestations: formAttestat.attestations
            };

            if (form.rank?.toString().trim()) {
                preparedForm.rank = form.rank.toString();
            } else {
                preparedForm.rank = ''; // или можешь просто не добавлять, если пусто
            }

            if (form.visitDate?.trim()) {
                preparedForm.visitDate = new Date(form.visitDate);
            } else {
                delete preparedForm.visitDate;
            }

            // --- Логика сохранения (создание или редактирование) ---
            let response;
            // Редактируем, если есть originalPassport (анкета была загружена)
            if (originalPassport) {
                response = await axios.put(`${API}/attestation/edit/${originalPassport}`, preparedForm, {
                    headers: { 'Content-Type': 'application/json' }
                });
                notify("Успешно обновлено", "success");
                setCertificateNumber(response.data.certificateNumber.toString().padStart(6, '0'));
            } else {
                // Иначе создаем новую
                response = await axios.post(`${API}/attestation`, preparedForm, {
                    headers: { 'Content-Type': 'application/json' }
                });
                notify("Успешно создано", "success");
                setCertificateNumber(response.data.certificateNumber.toString().padStart(6, '0'));
                // ИСПРАВЛЕНИЕ 1: После создания новой анкеты,
                // ее паспорт становится "оригинальным" для последующих действий.
                setOriginalPassport(form.passport);
            }

            console.log('✅ Ответ:', response.data);

            // ИСПРАВЛЕНИЕ 2: Синхронизируем состояние. Теперь все файлы в selectedFiles
            // будут строками, и логика удаления будет работать корректно.
            setSelectedFiles(photoUrls);

            // Генерация QR-кода после сохранения
            const qrText = `${window.location.origin}/result/${form.passport}`;
            const url = await QRCode.toDataURL(qrText);
            setQrUrl(url);

        } catch (error) {
            console.error('Ошибка при отправке:', error);
            const errorMessage = error.response?.data?.message || 'Ошибка при сохранении анкеты';
            notify(errorMessage, 'error');
        }
    };
    const addAttestation = () => {
        setFormAttestat(prev => ({
            ...prev,
            attestations: [
                ...prev.attestations,
                { type: '', theory: '', practice: '' }
            ]
        }));
    };
    const handleAttestationChange = (index, field, value) => {
        const updated = [...formAttestat.attestations];
        updated[index][field] = value;
        setFormAttestat(prev => ({ ...prev, attestations: updated }));
    };

    const generateQRCode = async () => {
        try {
            if (!form.passport) {
                alert('Паспорт должен быть заполнен');
                return;
            }

            const qrText = `${window.location.origin}/result/${form.passport}`;
            const url = await QRCode.toDataURL(qrText);
            setQrUrl(url);
        } catch (err) {
            console.error('Ошибка генерации QR-кода', err);
        }
    };
    const handleUpload = async (event) => {
        const formData = new FormData();
        const files = event.target.files;

        for (let i = 0; i < files.length; i++) {
            formData.append('files', files[i]);
        }

        try {
            const response = await axios.post(`${API}/upload`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            const urls = response.data.urls;

            const keys = urls.map((fullUrl) => {
                const u = new URL(fullUrl);
                const pathParts = u.pathname.split('/');
                return pathParts.slice(2).join('/'); // убираем ['', 'attestationproject']
            });

            console.log('KEYS:', keys); // например: [ 'files/1751....png', ... ]
        } catch (err) {
            console.error('Ошибка при загрузке:', err);
        }
    };
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

    useEffect(() => {
        const loadData = async () => {
            const currentPassport = paramPassport || location.state?.passport;
            if (!currentPassport) return;

            try {
                const res = await axios.get(`${API}/attestation/search`, {
                    params: { passport: currentPassport }
                });

                setForm(res.data);
                if (Array.isArray(res.data.attestations)) {
                    setFormAttestat({ attestations: res.data.attestations });
                }

                const loadedData = { ...res.data };

                // ✅ Преобразуем дату к формату YYYY-MM-DD
                if (loadedData.visitDate) {
                    const dateObj = new Date(loadedData.visitDate);
                    if (!isNaN(dateObj.getTime())) {
                        loadedData.visitDate = dateObj.toISOString().split('T')[0];
                    } else {
                        console.warn('Некорректная дата:', loadedData.visitDate);
                        loadedData.visitDate = '';
                    }
                }

                setForm(loadedData);

                setOriginalPassport(res.data.passport);
                setSelectedFiles(res.data.photoUrls || []);
            } catch (err) {
                console.error('Ошибка при загрузке анкеты:', err);
            }
        };

        loadData();
    }, [paramPassport, location.state]);
    useEffect(() => {
        if (originalPassport && form.passport !== originalPassport) {
            setOriginalPassport(null);
        }
    }, [form.passport]);

    return (
        <Container maxWidth="sm" sx={{ mt: 4, mb: 6 }}>

            <Box
                sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', sm: 'row' },
                    justifyContent: 'space-between',
                    alignItems: { xs: 'stretch', sm: 'center' },
                    gap: 1,
                    mb: 2,
                }}
            >
                <Typography variant="h5">Анкета аттестации </Typography>
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: { xs: 'column', sm: 'row' },
                        gap: 1,
                    }}
                >
                    <Button
                        variant="outlined"
                        fullWidth={false}
                        sx={{ width: { xs: '100%', sm: 'auto' } }}
                        onClick={() => navigate('/search')}
                    >
                        Поиск анкеты по паспорту
                    </Button>
                    <Button
                        variant="contained"
                        sx={{ width: { xs: '100%', sm: 'auto' } }}
                        onClick={() => setOpenExport(true)}
                    >
                        Выгрузить в Excel
                    </Button>
                </Box>
            </Box>

            <Grid container spacing={2} direction="column">
                <Grid item>
                    <TextField
                        fullWidth
                        label="ФИО"
                        name="fullName"
                        value={form.fullName}
                        onChange={onChange}
                    />
                </Grid>

                <Grid item>
                    <SelectWithOther
                        label="страна паспорта"
                        name="passportCountry"
                        value={form.passportCountry}
                        options={countries}
                        onChange={onChange}
                    />

                </Grid>

                <Grid item>
                    <TextField
                        fullWidth
                        label="Паспорт"
                        name="passport"
                        value={form.passport}
                        onChange={onChange}
                    />
                </Grid>

                <Grid item>
                    <SelectWithOther
                        label="Профессия"
                        name="profession"
                        value={form.profession}
                        options={professions}
                        onChange={onChange}
                    />
                </Grid>

                <Grid item>
                    <FormControl fullWidth>
                        <InputLabel id="rank-label">Разряд</InputLabel>
                        <Select
                            labelId="rank-label"
                            id="rank"
                            name="rank"
                            value={form.rank}
                            label="Разряд"
                            onChange={onChange}
                        >
                            {[...Array(8)].map((_, i) => (
                                <MenuItem key={i + 1} value={i + 1}>
                                    {i + 1}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Grid>

                <Grid item>
                    <TextField
                        fullWidth
                        type="date"
                        label="Дата посещения аттестационного центра"
                        name="visitDate"
                        InputLabelProps={{ shrink: true }}
                        value={form.visitDate}
                        onChange={onChange}
                    />
                </Grid>

                <Grid item>
                    <FormControl fullWidth>
                        <InputLabel>Судимость</InputLabel>
                        <Select
                            name="conviction"
                            value={form.conviction}
                            onChange={onChange}
                            label="Судимость"
                        >
                            <MenuItem value="Нет">Нет</MenuItem>
                            <MenuItem value="Есть">Есть</MenuItem>
                            <MenuItem value="Информация отсутствует">Информация отсутствует</MenuItem>
                        </Select>
                    </FormControl>
                </Grid>

                <Grid item>
                    <FormControl fullWidth>
                        <InputLabel>Запрет на нахождение в РФ</InputLabel>
                        <Select
                            name="rfBan"
                            value={form.rfBan}
                            onChange={onChange}
                            label="Запрет на нахождение в РФ"
                        >
                            <MenuItem value="Разрешено">Разрешено</MenuItem>
                            <MenuItem value="Запрещено">Запрещено</MenuItem>
                            <MenuItem value="Информация отсутствует">Информация отсутствует</MenuItem>
                        </Select>
                    </FormControl>
                </Grid>
                <Button onClick={addAttestation} sx={{ mt: 2 }}>
                    + Добавить аттестацию
                </Button>
                {Array.isArray(formAttestat.attestations) &&
                    formAttestat.attestations.map((item, idx) => (
                        <div key={idx}>
                            <SelectWithOther
                                label="Вид аттестации"
                                name={`attestation-type-${idx}`}
                                value={item.type}
                                options={attestationTypes}
                                onChange={(e) => handleAttestationChange(idx, 'type', e.target.value)}
                            />


                            <FormControl fullWidth margin="normal">
                                <InputLabel>Теория</InputLabel>
                                <Select
                                    value={item.theory}
                                    onChange={(e) => handleAttestationChange(idx, 'theory', e.target.value)}
                                    label="Теория"
                                >
                                    <MenuItem value="Сдано">Сдано</MenuItem>
                                    <MenuItem value="Не сдано">Не сдано</MenuItem>
                                </Select>
                            </FormControl>

                            <FormControl fullWidth margin="normal">
                                <InputLabel>Практика</InputLabel>
                                <Select
                                    value={item.practice}
                                    onChange={(e) => handleAttestationChange(idx, 'practice', e.target.value)}
                                    label="Практика"
                                >
                                    <MenuItem value="Сдано">Сдано</MenuItem>
                                    <MenuItem value="Не сдано">Не сдано</MenuItem>
                                </Select>
                            </FormControl>

                            <Box mt={1} mb={2}>
                                <Button
                                    variant="outlined"
                                    color="error"
                                    onClick={() => removeAttestation(idx)}
                                    disabled={formAttestat.attestations.length === 1}
                                >
                                    Удалить аттестацию
                                </Button>
                            </Box>

                            {idx < formAttestat.attestations.length - 1 && <Divider sx={{ my: 3 }} />}
                        </div>
                    ))}


                {/*загрузка файлов */}

                <Grid item>
                    <Box width="100%" mx="auto" textAlign="center">
                        <Button
                            component="label"
                            variant="contained"
                            startIcon={<CloudUploadIcon />}
                            fullWidth
                        >
                            Загрузить файлы
                            <input
                                type="file"
                                multiple
                                hidden
                                onChange={(e) => {
                                    const newFiles = Array.from(e.target.files);
                                    setSelectedFiles((prev) => [...prev, ...newFiles]);
                                }}
                            />
                        </Button>
                        {selectedFiles.length > 0 && (
                            <Box mt={2} display="flex" flexDirection="column" gap={1}>
                                {selectedFiles.map((file, idx) => {
                                    const name = typeof file === 'string'
                                        ? file.split('/').pop()
                                        : (file && typeof file.name === 'string' ? file.name : 'Неизвестный файл');

                                    console.log('file:', file, 'name:', name);

                                    const isPdf = name.toLowerCase().endsWith('.pdf');
                                    const url = typeof file === 'string'
                                        ? `${API}/download/${encodeURIComponent(file)}`
                                        : URL.createObjectURL(file);


                                    return (
                                        <Box
                                            key={idx}
                                            display="flex"
                                            alignItems="center"
                                            justifyContent="space-between"
                                            border="1px solid #ccc"
                                            borderRadius={2}
                                            px={2}
                                            py={1}
                                            flexWrap="wrap"
                                        >
                                            <Box display="flex" alignItems="center" gap={2} maxWidth="70%" flex="1">
                                                {isPdf ? (
                                                    <Button href={url} target="_blank" size="small">
                                                        PDF
                                                    </Button>
                                                ) : (
                                                    <img
                                                        src={url}
                                                        alt={name}
                                                        style={{ width: 50, height: 50, objectFit: 'cover', borderRadius: 4 }}
                                                    />
                                                )}
                                                <Tooltip title={name}>
                                                    <Typography
                                                        variant="body2"
                                                        sx={{
                                                            whiteSpace: 'nowrap',
                                                            overflow: 'hidden',
                                                            textOverflow: 'ellipsis',
                                                            maxWidth: '180px'
                                                        }}
                                                    >
                                                        {typeof name === 'string' ? name : String(name)}
                                                    </Typography>

                                                </Tooltip>
                                            </Box>
                                            <Button
                                                color="error"
                                                size="small"
                                                onClick={async () => {
                                                    const fileToDelete = selectedFiles[idx];
                                                    console.log('👉 fileToDelete:', fileToDelete);

                                                    // --- НОВАЯ ЛОГИКА ---

                                                    // Сценарий 1: Файл новый (это объект File), удаляем только на фронте
                                                    if (typeof fileToDelete !== 'string') {
                                                        // Просто обновляем состояние, убрав этот файл
                                                        const updatedFiles = selectedFiles.filter((_, i) => i !== idx);
                                                        setSelectedFiles(updatedFiles);
                                                        notify('Файл удалён из списка', 'success');
                                                        return; // Запрос на сервер не нужен
                                                    }

                                                    // Сценарий 2: Файл уже был загружен (это строка), удаляем на сервере
                                                    const key = fileToDelete; // fileToDelete уже является нужным ключом

                                                    try {
                                                        await axios.put(`${API}/attestation/remove-file`, {
                                                            passport: form.passport,
                                                            key: key // Отправляем сам ключ
                                                        });

                                                        // Загружаем свежие данные
                                                        const res = await axios.get(`${API}/attestation/search`, {
                                                            params: { passport: form.passport }
                                                        });
                                                        setForm(res.data);
                                                        setSelectedFiles(res.data.photoUrls || []);

                                                        notify('Файл удалён с сервера', 'success');
                                                    } catch (err) {
                                                        console.error('Ошибка при удалении файла:', err);
                                                        notify('Ошибка при удалении файла', 'error');
                                                    }
                                                }}
                                            >
                                                Удалить
                                            </Button>


                                        </Box>
                                    );
                                })}
                            </Box>
                        )}
                    </Box>
                </Grid>



                <Grid item>
                    <Button variant="text" color="error" fullWidth onClick={clearForm}>
                        Очистить
                    </Button>
                </Grid>

                <Grid item>
                    <Button variant="contained" fullWidth onClick={handleSubmit}>
                        Сохранить анкету
                    </Button>
                </Grid>


            </Grid>
            <Button
                variant="outlined"
                color="error"
                onClick={() => setOpenConfirm(true)}
                sx={{ mt: 2 }}
            >
                Удалить анкету
            </Button>
            <ConfirmDialog
                open={openConfirm}
                onClose={() => setOpenConfirm(false)}
                onConfirm={handleDeleteAttestation}
                title="Удаление анкеты"
                message="Вы уверены, что хотите удалить эту анкету? Это действие нельзя отменить."
            />

            <ExportDialog open={openExport} onClose={() => setOpenExport(false)} />


            {qrUrl && (
                <Box mt={2} display="flex" flexDirection="column" alignItems="center">
                    <img src={qrUrl} alt="QR Code" style={{ width: 200, height: 200 }} />

                    <Button variant="outlined" onClick={() => downloadQRCodePdf(qrUrl, certificateNumber , form.fullName ,form.profession , form.rank , form.visitDate)}>
                        Скачать QR-код в PDF
                    </Button>
                </Box>
            )}




        </Container>
    );
};

export default AttestationForm;
