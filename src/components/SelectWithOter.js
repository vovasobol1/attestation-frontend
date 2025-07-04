import React, { useState } from 'react';
import { FormControl, InputLabel, Select, MenuItem, TextField } from '@mui/material';

const SelectWithOther = ({ label, name, value, options, onChange }) => {
    const [isOther, setIsOther] = useState(false);

    const handleSelectChange = (e) => {
        const selected = e.target.value;
        if (selected === '__OTHER__') {
            setIsOther(true);
            onChange({ target: { name, value: '' } });
        } else {
            setIsOther(false);
            onChange({ target: { name, value: selected } });
        }
    };

    const handleTextChange = (e) => {
        onChange(e);
    };

    return (
        <>
            {!isOther ? (
                <FormControl fullWidth>
                    <InputLabel>{label}</InputLabel>
                    <Select
                        label={label}
                        name={name}
                        value={options.includes(value) ? value : ''}
                        onChange={handleSelectChange}
                    >
                        {options.map((option) => (
                            <MenuItem key={option} value={option}>
                                {option}
                            </MenuItem>
                        ))}
                        <MenuItem value="__OTHER__">Другое</MenuItem>
                    </Select>
                </FormControl>
            ) : (
                <TextField
                    fullWidth
                    name={name}
                    value={value}
                    onChange={handleTextChange}
                    label={label}
                    placeholder="Введите свой вариант"
                />
            )}
        </>
    );
};

export default SelectWithOther;