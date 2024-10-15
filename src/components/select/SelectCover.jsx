import React, { useEffect, useState } from "react";
import { useTranslation } from 'react-i18next';

import MenuItem from '@mui/material/MenuItem';

const SelectCover = ({ value, onChange }) => {

    const { t } = useTranslation();
    const options = [
        "partial-light",
        "half-light",
        "full-light",
        "partial-hard",
        "half-hard",
        "full-hard"];

    const handleChange = (event) => {
        onChange(event.target.value);
    }

    return (
        <TextField
            select
            label={t('attack-weapon')}
            value={(value === undefined || value === null || sizes.length === 0) ? '' : value}
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
            {options.map((option, index) => (<MenuItem key={index} value={option}>{t(`cover-${option}`)}</MenuItem>))}
        </TextField>
    );
}

export default SelectCover;