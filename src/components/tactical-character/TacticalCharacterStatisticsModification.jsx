import React from 'react';
import { useTranslation } from 'react-i18next';


import Grid from '@mui/material/Grid2';
import TextField from '@mui/material/TextField';
import { toolbarClasses } from '@mui/material';

const StatItemList = ({ formData, setFormData, statName, values }) => {

    const variant = "standard";
    const { t, i18n } = useTranslation();

    const handleBonusChange = (e) => {
        handleStatChange("bonus", e.target.value);
    };

    const handleCustomChange = (e) => {
        handleStatChange("custom", e.target.value);
    };

    const handleStatChange = (type, value) => {
        const intValue = value ? parseInt(value) : 0;
        const bonus = type === 'bonus' ? intValue : formData.statistics[statName].bonus;
        const racial = formData.statistics[statName].racial;
        const custom = type === 'custom' ? intValue : formData.statistics[statName].custom;
        const totalBonus = bonus + racial + custom;
        setFormData((prevState) => ({
            ...prevState,
            statistics: {
                ...prevState.statistics,
                [statName]: {
                    bonus: bonus,
                    racial: racial,
                    custom: custom,
                    totalBonus: totalBonus
                }
            }
        }));
    };

    return (
        <Grid container spacing={2}>
            <Grid size={4}>
                {t(statName)}
            </Grid>
            <Grid size={2}>
                <TextField label="Base" variant={variant} type="text" value={values.bonus} onChange={handleBonusChange} fullWidth />
            </Grid>
            <Grid size={2}>
                <TextField label="Custom" variant={variant} type="text" value={values.custom} onChange={handleCustomChange} fullWidth />
            </Grid>
            <Grid size={2}>
                <TextField label="Racial" variant={variant} type="text" value={values.racial} fullWidth disabled />
            </Grid>
            <Grid size={2}>
                <TextField label="Total" variant={variant} type="text" value={values.totalBonus} fullWidth disabled />
            </Grid>
            <Grid size={2}></Grid>
        </Grid>
    );

}

const TacticalCharacterStatisticsModification = ({ formData, setFormData }) => {

    const statistics = ['ag', 'co', 'em', 'in', 'me', 'pr', 'qu', 're', 'sd', 'st'];

    if (!formData) {
        return <p>Loading...</p>
    }

    return (
        <div className="tactical-character-add-item">
            {statistics.map(e => (
                <StatItemList formData={formData} setFormData={setFormData} statName={e} values={formData.statistics[e]} />
            ))}
        </div>
    );
}

export default TacticalCharacterStatisticsModification;