import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Typography,
    Button
} from '@mui/material';

const ConfirmDialog = ({ open, onClose, onConfirm, title, message }) => {
    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>{title || 'Подтверждение действия'}</DialogTitle>
            <DialogContent>
                <Typography>{message || 'Вы уверены, что хотите продолжить?'}</Typography>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Отмена</Button>
                <Button onClick={onConfirm} color="error">
                    Удалить
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ConfirmDialog;
