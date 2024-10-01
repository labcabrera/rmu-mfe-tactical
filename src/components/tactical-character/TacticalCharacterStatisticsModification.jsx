import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

import AddIcon from '@mui/icons-material/Add';
import Grid from '@mui/material/Grid2';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';

import { API_ITEMS_URL, API_TACTICAL_URL } from '../../constants/environment';

const TacticalCharacterStatisticsModification = ({ formData, setFormData }) => {

    const variant = "standard";
    const { t, i18n } = useTranslation();

    const statistics = ['ag', 'co', 'em', 'in', 'me', 'pr', 'qu', 're', 'sd', 'st'];

    if (!formData) {
        return <p>Loading...</p>
    }

    const handleCustomChange = (e) => {
        console.log(e.target.name + " > " + e.target.value);
        const stat = e.target.name;
        const value = e.target.value ? parseInt(e.target.value) : 0;
        setFormData((prevState) => ({
            ...prevState,
            statistics: {
                ...prevState.statistics,
                [stat]: {
                    ...prevState.statistics[stat],
                    custom: value
                }
            }
        }));
    };

    return (
        <div className="tactical-character-add-item">
            {statistics.map(e => (
                <Grid container spacing={2}>
                    <Grid size={4}>
                        {t(e)}
                    </Grid>
                    <Grid size={2}>
                        <TextField label="Custom" name={e} variant={variant} type="text" value={formData.statistics[e].custom} onChange={handleCustomChange} fullWidth />
                    </Grid>
                    <Grid size={2}>
                        <TextField label="Racial" variant={variant} type="text" value={formData.statistics[e].racial} fullWidth disabled />
                    </Grid>
                    <Grid size={6}></Grid>
                </Grid>
            ))}
        </div>
    );
}

export default TacticalCharacterStatisticsModification;