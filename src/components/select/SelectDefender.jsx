import React from "react";
import { useTranslation } from 'react-i18next';

import Avatar from '@mui/material/Avatar';
import InputAdornment from '@mui/material/InputAdornment';
import MenuItem from '@mui/material/MenuItem';
import TextField from "@mui/material/TextField";

import { VARIANT } from '../../constants/ui';

const SelectDefender = ({ value, onChange, sourceId, targets }) => {

    const { t } = useTranslation();

    const handleChange = (event) => {
        const targetId = event.target.value;
        onChange(targetId);
    };

    return (
        <TextField
            select
            id="select-attack-target"
            label={t('defender')}
            fullWidth
            value={(value === undefined || value === null || targets.length === 0) ? '' : value}
            variant={VARIANT}
            onChange={handleChange}
            slotProps={{
                input: {
                    startAdornment: (
                        <InputAdornment position="start">
                            <Avatar src='/static/images/generic/shield.png' sx={{ width: 25, height: 25 }} />
                        </InputAdornment>
                    ),
                },
            }}>
            {targets.filter(e => e.id != sourceId).map((option, index) => (<MenuItem key={index} value={option.id}>{option.name}</MenuItem>))}
        </TextField>
    );
}

export default SelectDefender;