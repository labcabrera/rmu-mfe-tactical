import React from 'react';
import { useTranslation } from 'react-i18next';

import Avatar from '@mui/material/Avatar';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import TextField from '@mui/material/TextField';

import { API_NPC_NAMES_URL } from '../../constants/environment';
import { VARIANT } from '../../constants/ui';

const NameTextField = ({ value, onChange, required = false, generateRandom, generateRandomRaceValue }) => {

    const { t } = useTranslation();

    const handleRandomNameClick = async (e) => {
        var race = 'generic';
        if (generateRandomRaceValue) {
            race = generateRandomRaceValue;
        }
        const response = await fetch(`${API_NPC_NAMES_URL}/random-names/${race}`);
        const json = await response.json()
        console.log("readed name " + json + " (" + race + ")");
        onChange({
            target: {
                name: 'name',
                value: json.name
            }
        });
    };

    return (
        <TextField
            label={t('name')}
            variant={VARIANT}
            value={value}
            onChange={onChange}
            required={required}
            fullWidth
            slotProps={{
                input: {
                    startAdornment: (
                        <InputAdornment position="start">
                            <div className='dark-avatar-container'>
                                <Avatar src='/static/images/generic/avatar.png' sx={{ width: 25, height: 25 }} />
                            </div>
                        </InputAdornment>
                    ),
                    endAdornment: (
                        <InputAdornment position="start">
                            <IconButton onClick={handleRandomNameClick}>
                                <Avatar src='/static/images/generic/refresh.png' sx={{ width: 25, height: 25 }} />
                            </IconButton>
                        </InputAdornment>
                    ),
                },
            }}
        />
    );
};

export default NameTextField;