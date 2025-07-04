import React, {useEffect, useState} from 'react';
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
    Box,
} from '@mui/material';
import {useLocation, useNavigate} from "react-router-dom";
import axios from "axios";
import {API} from "../config";
import QRCode from "qrcode";
import AttestationForm from "./AttestationForm";


const professions = [
    'Сварщик ручной дуговой сварки',
    'Сварщик-аргонщик',
    'Монтажник',
    'Арматурщик',
    'Плотник',
    'Бетонщик',
    'Другое',
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

const EditAttestation = () => {
    return <AttestationForm isEdit />;
};

export default EditAttestation;
