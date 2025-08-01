import React from 'react';
import { useTranslation } from 'react-i18next';

import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';

import { VARIANT, VARIANT_DISABLED, SIZE } from '../../constants/ui';

const StatItemList = ({ formData, setFormData, statName, values, size, variant }) => {

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
            <Grid item xs={3}>
                <TextField label={`${capitalize(statName)} Base`} variant={VARIANT} type='text' fullWidth size={SIZE} sx={{ input: { textAlign: 'right' } }}
                    onChange={handleBonusChange} value={values.bonus}
                />
            </Grid>
            <Grid item xs={3}>
                <TextField label={`${capitalize(statName)} Custom`} variant={VARIANT} type='text' fullWidth size={SIZE} sx={{ input: { textAlign: 'right' } }}
                    value={values.custom} onChange={handleCustomChange} />
            </Grid>
            <Grid item xs={3}>
                <TextField label={`${capitalize(statName)} Racial`} variant={VARIANT_DISABLED} type='text' fullWidth disabled size={SIZE} sx={{ input: { textAlign: 'right' } }}
                    value={values.racial} />
            </Grid>
            <Grid item xs={3}>
                <TextField label={`${capitalize(statName)} Total`} variant={VARIANT_DISABLED} type='text' fullWidth disabled size={SIZE} sx={{ input: { textAlign: 'right' } }}
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