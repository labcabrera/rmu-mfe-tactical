import React from 'react';
import { useTranslation } from 'react-i18next';

import Avatar from '@mui/material/Avatar';
import InputAdornment from '@mui/material/InputAdornment';
import TextField from '@mui/material/TextField';

import { VARIANT } from '../../constants/ui';

const NameTextField = ({ value, onChange }) => {

    const { t } = useTranslation();

    return (
        <TextField
            label={t('name')}
            variant={VARIANT}
            fullWidth
            name="name"
            value={value}
            onChange={onChange}
            required
            slotProps={{
                input: {
                    startAdornment: (
                        <InputAdornment position="start">
                            <Avatar src='/static/images/generic/avatar.png' sx={{ width: 25, height: 25 }} />
                        </InputAdornment>
                    ),
                },
            }}
        />
    );
};

export default NameTextField;