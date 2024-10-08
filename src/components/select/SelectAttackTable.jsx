import React from "react";
import { useTranslation } from 'react-i18next';

import Avatar from '@mui/material/Avatar';
import InputAdornment from '@mui/material/InputAdornment';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';

import { VARIANT } from '../../constants/ui';

const SelectAttackTable = ({ value, onChange }) => {

    const { t } = useTranslation();

    const availableTables = [
        "arming-sword@small",
        "arming-sword@medium",
        "arming-sword@big",
    ];

    const handleChange = (event) => {
        onChange(event.target.value);
    }

    return (
        <TextField
            select
            label={t('attack-table')}
            value={(value === undefined || value === null || availableTables.length === 0) ? '' : value}
            variant={VARIANT}
            fullWidth
            onChange={handleChange}
            slotProps={{
                input: {
                    startAdornment: (
                        <InputAdornment position="start">
                            <Avatar src='/static/images/generic/attack-table.png' sx={{ width: 25, height: 25 }} />
                        </InputAdornment>
                    ),
                },
            }}>
            {availableTables.map((option, index) => (<MenuItem key={index} value={option}>{t(option)}</MenuItem>))}
        </TextField>
    );
}

export default SelectAttackTable;