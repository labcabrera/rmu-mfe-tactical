import React from 'react';
import { useTranslation } from 'react-i18next';

import Avatar from '@mui/material/Avatar';
import InputAdornment from '@mui/material/InputAdornment';
import TextField from '@mui/material/TextField';

import { VARIANT } from '../../constants/ui';

const DefenseTextField = ({ value, onChange, i18nLabel = 'defensive-bonus' }) => {

    const { t } = useTranslation();

    return (
        <TextField
            label={t(i18nLabel)}
            variant={VARIANT}
            fullWidth
            value={value}
            onChange={onChange}
            slotProps={{
                input: {
                    startAdornment: (
                        <InputAdornment position="start">
                            <Avatar src='/static/images/generic/shield.png' sx={{ width: 25, height: 25 }} />
                        </InputAdornment>
                    ),
                },
            }}
        />
    );
};

export default DefenseTextField;