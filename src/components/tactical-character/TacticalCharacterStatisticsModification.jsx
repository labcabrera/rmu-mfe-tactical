import React from 'react';
import { useTranslation } from 'react-i18next';

import Grid from '@mui/material/Grid2';
import TextField from '@mui/material/TextField';

const StatItemList = ({ formData, setFormData, statName, values }) => {

    const { t, i18n } = useTranslation();

    const handleBonusChange = (e) => {
        handleStatChange('bonus', e.target.value);
    };

    const handleCustomChange = (e) => {
        handleStatChange('custom', e.target.value);
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

    const capitalize = (value) => {
        return value.charAt(0).toUpperCase() + value.slice(1);
    };

    return (
        <React.Fragment>
            <Grid size={3}>
                <TextField label={`${capitalize(statName)} Base`} variant='outlined' type='text' fullWidth size='small' sx={{ input: { textAlign: 'right' } }}
                    onChange={handleBonusChange} value={values.bonus}
                />
            </Grid>
            <Grid size={3}>
                <TextField label={`${capitalize(statName)} Custom`} variant='outlined' type='text' fullWidth size='small' sx={{ input: { textAlign: 'right' } }}
                    value={values.custom} onChange={handleCustomChange} />
            </Grid>
            <Grid size={3}>
                <TextField label={`${capitalize(statName)} Racial`} variant='outlined' type='text' fullWidth disabled size='small' sx={{ input: { textAlign: 'right' } }}
                    value={values.racial} />
            </Grid>
            <Grid size={3}>
                <TextField label={`${capitalize(statName)} Total`} variant='outlined' type='text' fullWidth disabled size='small' sx={{ input: { textAlign: 'right' } }}
                    value={values.totalBonus} />
            </Grid>
        </React.Fragment>
    );

}

const TacticalCharacterStatisticsModification = ({ formData, setFormData }) => {

    const statistics = ['ag', 'co', 'em', 'in', 'me', 'pr', 'qu', 're', 'sd', 'st'];

    if (!formData) {
        return <p>Loading...</p>
    }

    return (
        <div className='tactical-character-add-item'>
            <Grid container spacing={2}>
                {statistics.map((e, index) => (
                    <StatItemList key={index} formData={formData} setFormData={setFormData} statName={e} values={formData.statistics[e]} />
                ))}
            </Grid>
        </div>
    );
}

export default TacticalCharacterStatisticsModification;