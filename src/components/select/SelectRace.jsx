import React, { useState, useEffect } from "react";
import { useTranslation } from 'react-i18next';

import Avatar from '@mui/material/Avatar';
import InputAdornment from '@mui/material/InputAdornment';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';

import { API_CORE_URL } from '../../constants/environment';

import { VARIANT } from '../../constants/ui';

const SelectRace = ({ value, onChange }) => {

    const { t } = useTranslation();

    const [races, setRaces] = useState([]);

    const handleChange = (event) => {
        const value = event.target.value;
        const race = races.find(e => e.id === value);
        onChange(value, race);
    }

    useEffect(() => {
        const fetchRaces = async () => {
            const response = await fetch(`${API_CORE_URL}/races`);
            const responseBody = await response.json();
            setRaces(responseBody.content);
        };
        fetchRaces();
    }, []);

    if (!races || typeof value === 'undefined') {
        return <p>Loading...</p>
    }

    return (
        <TextField
            select
            label={t('race')}
            value={(value === undefined || value === null || races.length === 0) ? '' : value}
            variant={VARIANT}
            fullWidth
            onChange={handleChange}
            slotProps={{
                input: {
                    startAdornment: (
                        <InputAdornment position="start">
                            <div className='dark-avatar-container'>
                                <Avatar src='/static/images/generic/races.png' sx={{ width: 25, height: 25 }} />
                            </div>
                        </InputAdornment>
                    ),
                },
            }}>
            {races.map((option, index) => (<MenuItem key={index} value={option.id}>{option.name}</MenuItem>))}
        </TextField>
    );
}

export default SelectRace;