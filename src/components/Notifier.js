import React, { createContext, useContext, useState, useCallback } from 'react';
import { Snackbar, Alert } from '@mui/material';

const NotifierContext = createContext();

export const useNotifier = () => useContext(NotifierContext);

export const NotifierProvider = ({ children }) => {
    const [open, setOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [severity, setSeverity] = useState('info');

    const notify = useCallback((msg, type = 'info') => {
        setMessage(msg);
        setSeverity(type);
        setOpen(true);
    }, []);

    const handleClose = () => setOpen(false);

    return (
        <NotifierContext.Provider value={notify}>
            {children}
            <Snackbar
                open={open}
                autoHideDuration={4000}
                onClose={handleClose}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
                <Alert severity={severity} onClose={handleClose} sx={{ width: '100%' }}>
                    {message}
                </Alert>
            </Snackbar>
        </NotifierContext.Provider>
    );
};
