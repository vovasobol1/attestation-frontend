import React, {useEffect, useState} from 'react';
import { FormControl, InputLabel, Select, MenuItem, TextField } from '@mui/material';

const SelectWithOther = ({ label, name, value, options, onChange }) => {
    const [isOther, setIsOther] = useState(false);

    // 💡 Переключение между режимами при изменении value
    useEffect(() => {
        if (!value) {
            setIsOther(false); // при пустом значении — всегда обычный <Select>
        } else if (!options.includes(value)) {
            setIsOther(true); // если значение кастомное — <TextField>
        } else {
            setIsOther(false); // если значение из списка — <Select>
        }
    }, [value, options]);

    const handleSelectChange = (e) => {
        const selected = e.target.value;
        if (selected === '__OTHER__') {
            setIsOther(true);
            onChange({ target: { name, value: '' } }); // сбрасываем поле
        } else {
            onChange({ target: { name, value: selected } });
        }
    };

    const handleTextChange = (e) => {
        onChange(e);
    };

    return isOther ? (
        <TextField
            fullWidth
            name={name}
            label={label}
            value={value}
            onChange={handleTextChange}
            placeholder="Введите свой вариант"
        />
    ) : (
        <FormControl fullWidth>
            <InputLabel>{label}</InputLabel>
            <Select
                name={name}
                label={label}
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
    );
};



export default SelectWithOther;