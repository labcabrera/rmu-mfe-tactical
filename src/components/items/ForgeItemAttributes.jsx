import React from "react";

import Grid from '@mui/material/Grid2';

import ArmorTextField from "../input/ArmorTextField";
import HeightTextField from "../input/HeightTextField";
import ItemStrengthTextField from "../input/ItemStrengthTextField";
import WeightTextField from "../input/WeightTextField";
import SelectAttackTable from "../select/SelectAttackTable";
import SelectSizeAdjustment from "../select/SelectSizeAdjustment";
import SelectWeaponSkill from "../select/SelectWeaponSkill";

const ForgeItemAttributes = ({ formData, setFormData }) => {

    if (!formData || !setFormData || formData.itemTypeId === '') {
        return null;
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

    const handleBonusChange = (e) => {
        handleFormDataChange('info', 'bonus', parseInt(e.target.value));
    };

    const handleFumbleChange = (e) => {
        handleFormDataChange('weapon', 'fumble', parseInt(e.target.value));
    };

    const handleSizeAdjustmentChange = (e) => {
        handleFormDataChange('weapon', 'sizeAdjustment', e);
    };

    const handleSkillChange = (e) => {
        handleFormDataChange('weapon', 'skillId', e);
    };


    const handleChangeAttackTable = (e) => {
        handleFormDataChange('weapon', 'attackTable', e);
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
            <Grid size={12}>
                <ItemStrengthTextField i18nLabel="name" value={formData.name} onChange={handleNameChange} />
            </Grid>
            <Grid size={6}>
                <ItemStrengthTextField i18nLabel="item-type" value={formData.itemTypeId} disabled />
            </Grid>
            <Grid size={6}>
                <ItemStrengthTextField i18nLabel="category" value={formData.category} disabled />
            </Grid>
            {formData.weapon ? (
                <>
                    <Grid size={6}>
                        <SelectAttackTable value={formData.weapon?.attackTable} onChange={handleChangeAttackTable} />
                    </Grid>
                    <Grid size={6}>
                        <SelectSizeAdjustment value={formData.weapon.sizeAdjustment} onChange={handleSizeAdjustmentChange} />
                    </Grid>
                    <Grid size={6}>
                        <SelectWeaponSkill value={formData.weapon?.skillId} onChange={handleSkillChange} />
                    </Grid>
                    <Grid size={6}>
                        <ItemStrengthTextField i18nLabel="fumble" value={formData.weapon.fumble} onChange={handleFumbleChange} />
                    </Grid>
                </>
            ) : null}
            {formData.shield ? (
                <>
                    <Grid size={6}>
                        <ItemStrengthTextField i18nLabel="defensive-bonus" value={formData.shield.defensiveBonus} onChange={handleWeightChange} />
                    </Grid>
                    <Grid size={6}>
                        <ItemStrengthTextField i18nLabel="max-blocks" value={formData.shield.maxAttacksBlocked} onChange={handleWeightChange} />
                    </Grid>
                </>
            ) : null}
            {formData.armor ? (
                <>
                    <Grid size={6}>
                        <ArmorTextField i18nLabel="armor-type" value={formData.armor.armorType} disabled />
                    </Grid>
                    <Grid size={6}>
                        <ItemStrengthTextField i18nLabel="enc" value={formData.armor.enc} />
                    </Grid>
                    <Grid size={6}>
                        <ItemStrengthTextField i18nLabel="maneuver-penalty" value={formData.armor.maneuver} />
                    </Grid>
                    <Grid size={6}>
                        <ItemStrengthTextField i18nLabel="ranged-penalty" value={formData.armor.rangedPenalty} />
                    </Grid>
                    <Grid size={6}>
                        <ItemStrengthTextField i18nLabel="perception-penalty" value={formData.armor.perception} />
                    </Grid>
                    <Grid size={6}></Grid>
                </>
            ) : null}
            {formData.info ? (
                <>
                    <Grid size={6}>
                        <ItemStrengthTextField i18nLabel="bonus" value={formData.info.bonus} onChange={handleBonusChange} />
                    </Grid>

                    <Grid size={6}>
                        <HeightTextField value={formData.info.length} onChange={handleLengthChange} />
                    </Grid>
                    <Grid size={6}>
                        <WeightTextField value={formData.info.weight} onChange={handleWeightChange} />
                    </Grid>
                    <Grid size={6}>
                        <ItemStrengthTextField i18nLabel="item-strength" value={formData.info.strength} />
                    </Grid>
                </>
            ) : null}
        </Grid>
    );
}

export default ForgeItemAttributes;
