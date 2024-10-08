import React from "react";

import Grid from '@mui/material/Grid2';

import HeightTextField from "../input/HeightTextField";
import WeightTextField from "../input/WeightTextField";
import ItemStrengthTextField from "../input/ItemStrengthTextField";
import SelectAttackTable from "../select/SelectAttackTable";
import SelectWeaponSkill from "../select/SelectWeaponSkill";

const ForgeItemAttributes = ({ formData, setFormData }) => {

    if (!formData || !setFormData) {
        return <p>Loading...</p>
    }

    const handleNameChange = (e) => {
        setFormData((prevState) => ({ ...prevState, name: e.target.value }));
    };

    const handleLengthChange = (e) => {
        handleFormDataChange('info', 'length', parseFloat(e.target.value));
    };

    const handleWeightChange = (e) => {
        handleFormDataChange('info', 'weight', parseFloat(e.target.value));
    };

    const handleFormDataChange = (field1, field2, value) => {
        setFormData((prevState) => ({
            ...prevState,
            [field1]: {
                ...prevState[field1],
                [field2]: value
            }
        }));
    };

    return (
        <Grid container spacing={2}>
            <Grid size={6}>
                <ItemStrengthTextField i18nLabel="category" value={formData.category} readonly />
            </Grid>
            <Grid size={6}>
                <ItemStrengthTextField i18nLabel="name" value={formData.name} onChange={handleNameChange} />
            </Grid>
            <Grid size={6}>
                <SelectAttackTable value={formData.weapon?.attackTable} />
            </Grid>
            <Grid size={6}>
                <SelectWeaponSkill value={formData.weapon?.skillId} />
            </Grid>
            <Grid size={6}>
                <ItemStrengthTextField i18nLabel="item-strength" value={formData.info.strength} />
            </Grid>
            <Grid size={6}>
                <ItemStrengthTextField i18nLabel="fumble" value={formData.weapon.fumble} onChange={handleWeightChange} />
            </Grid>
            <Grid size={6}>
                <HeightTextField value={formData.info.length} onChange={handleLengthChange} />
            </Grid>
            <Grid size={6}>
                <WeightTextField value={formData.info.weight} onChange={handleWeightChange} />
            </Grid>
        </Grid>
    );
}

export default ForgeItemAttributes;
