import React from "react";
import { useTranslation } from 'react-i18next';

import Avatar from '@mui/material/Avatar';
import InputAdornment from '@mui/material/InputAdornment';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';

import { VARIANT } from '../../constants/ui';

const SelectItem = ({ options, onChange, i18nLabel = 'select-item' }) => {

    const { t } = useTranslation();

    const handleChange = (event) => {
        onChange(event.target.value);
    }

    return (
        <TextField
            select
            label={t(i18nLabel)}
            variant={VARIANT}
            fullWidth
            onChange={handleChange}
            slotProps={{
                input: {
                    startAdornment: (
                        <InputAdornment position="start">
                            <Avatar src='/static/images/generic/select-weapon.png' sx={{ width: 25, height: 25 }} />
                        </InputAdornment>
                    ),
                },
            }}>
            {options.map((option, index) => (<MenuItem key={index} value={option.id}>{option.name}</MenuItem>))}
        </TextField>
    );
}

export default SelectItem;