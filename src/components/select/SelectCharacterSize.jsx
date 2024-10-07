import React, { useEffect, useState } from "react";
import { useTranslation } from 'react-i18next';

import Avatar from '@mui/material/Avatar';
import InputAdornment from '@mui/material/InputAdornment';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';

import { API_CORE_URL } from '../../constants/environment';

const SelectCharacterSize = ({ value, onChange }) => {

    const { t } = useTranslation();

    const label = t('size');

    const [sizes, setSizes] = useState([]);

    const handleChange = (event) => {
        const value = event.target.value;
        const size = sizes.find(e => e.id === value);
        onChange(value, size);
    }

    useEffect(() => {
        const fetchSizes = async () => {
            const response = await fetch(`${API_CORE_URL}/character-sizes`);
            const responseBody = await response.json();
            setSizes(responseBody);
        };
        fetchSizes();
    }, []);

    return (
        <TextField
            select
            label={label}
            value={(value === undefined || value === null || sizes.length === 0) ? '' : value}
            variant='outlined'
            fullWidth
            onChange={handleChange}
            slotProps={{
                input: {
                    startAdornment: (
                        <InputAdornment position="start">
                            <Avatar src='/static/images/generic/size.png' sx={{ width: 25, height: 25 }} />
                        </InputAdornment>
                    ),
                },
            }}>
            {sizes.map((option, index) => (<MenuItem key={index} value={option.id}>{option.name}</MenuItem>))}
        </TextField>
    );
}

export default SelectCharacterSize;