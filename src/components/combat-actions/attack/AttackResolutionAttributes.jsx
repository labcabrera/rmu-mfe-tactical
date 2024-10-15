import React from 'react';

import Grid from '@mui/material/Grid2';

import ActionPointSelector from '../../shared/ActionPointSelector';
import PenaltyTextField from '../../input/PenaltyTextField';
import ArmorTextField from '../../input/ArmorTextField';
import AttackTextField from '../../input/AttackTextField';
import DefenseTextField from '../../input/DefenseTextField';
import SizeTextField from '../../input/SizeTextField';
import SelectAttackMode from '../../select/SelectAttackMode';


const AttackResolutionAttributes = ({ formData, character }) => {

    const handleTargetChange = (targetCharacterId) => {
        const targetCharacter = characters.find(e => e.id == targetCharacterId);
        setTargetCharacter(targetCharacter);
        setFormData((prevState) => ({
            ...prevState,
            tacticalCharacterTargetId: targetCharacterId,
            transient: {
                ...prevState.transient,
                armorType: targetCharacter.defense.armorType,
                defenderSizeId: targetCharacter.info.sizeId,
                defensiveBonus: targetCharacter.defense.defensiveBonus
            }
        }));
    };

    const handleActionPointsChange = (actionPoints) => {
        if (actionPoints < 2) {
            actionPoints == 2;
        }
        setFormData((prevState) => ({
            ...formData,
            actionPoints: actionPoints,
            transient: {
                ...formData.transient,
                actionPointPenalty: (4 - actionPoints) * -25
            }
        }));
    };

    const handleSelectedWeaponChange = (e) => { updateFormData('attackInfo', 'selectedWeapon', e) };
    const handleRestrictedQuarterChange = (e) => { updateFormData('attackInfo', 'restrictedQuarters', e) };
    const handleChargeSpeedChange = (e) => { updateFormData('attackInfo', 'chargeSpeed', e) };
    const handleParryChange = (e) => { updateFormData('attackInfo', 'parry', parseInt(e.target.value)) };

    const updateFormData = (field1, field2, value) => {
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
            <Grid size={2}>
                <ActionPointSelector value={formData.actionPoints} min={2} max={4} defaultValue={2} onChange={handleActionPointsChange} />
            </Grid>
            <Grid size={2}>
                <PenaltyTextField i18nLabel='action-points-penalty' value={-1} disabled />
            </Grid>
            <Grid size={8}></Grid>

            <Grid size={2}>
                <AttackTextField i18Label='attacker' value={character.name} disabled required={false} />
            </Grid>
            <Grid size={2}>
                <SelectAttackMode character={character} value={formData.attackInfo.selectedWeapon} onChange={handleSelectedWeaponChange} />
            </Grid>
            <Grid size={2}></Grid>
            <Grid size={2}>
                <SelectDefender value={formData.tacticalCharacterTargetId} onChange={handleTargetChange} sourceId={character.id} targets={characters} />
            </Grid>
            <Grid size={2}>
                <ArmorTextField value={formData.transient.armorType} disabled />
            </Grid>
            <Grid size={2}></Grid>

            <Grid size={2}>
                <AttackTextField i18Label='base-offensive-bonus' value={-1} disabled />
            </Grid>
            <Grid size={2}>
                <SizeTextField i18nLabel='attacker-size' value={-1} disabled />
            </Grid>
            <Grid size={2}>
            </Grid>
            <Grid size={2}>
                <DefenseTextField i18nLabel='base-defensive-bonus' value={-1} disabled />
            </Grid>
            <Grid size={2}>
                <SizeTextField i18nLabel='defender-size' value={-1} disabled />
            </Grid>
            <Grid size={2}></Grid>

            <Grid size={2}>
                <DefenseTextField i18nLabel='parry' value={formData.attackInfo.parry} onChange={handleParryChange} />
            </Grid>
            <Grid size={10}></Grid>

            <Grid size={2}>
                <SelectRestrictedQuarters value={formData.attackInfo.restrictedQuarters} onChange={handleRestrictedQuarterChange} />
            </Grid>
            <Grid size={2}>
                <SelectChargeSpeed value={formData.attackInfo.chargeSpeed} onChange={handleChargeSpeedChange} />
            </Grid>
            <Grid size={8}></Grid>

            <Grid size={12}></Grid>

        </Grid>
    );
};

export default AttackResolutionAttributes;