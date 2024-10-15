import React from 'react';

import Grid from '@mui/material/Grid2';

import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import { Typography } from '@mui/material';

const AttackResolutionAttributes = ({ attackKey, formData, character }) => {

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
        <>
            <Grid container spacing={2}>
                <Grid size={12}>

                </Grid>
                <Grid size={4}>
                    <List>
                        <ListItem key={-1}>
                            <Typography variant='body'>Attacker modifiers: {formData.attacks[attackKey].totalAttackerBonus}</Typography>
                        </ListItem>
                        {formData.attacks[attackKey].attackerBonusModifiers.map((key, index) => (
                            <ListItem key={index}>
                                <Typography variant='caption'>
                                    {key.type}: {key.value}
                                </Typography>
                            </ListItem>
                        ))}
                    </List>
                </Grid>
                <Grid size={4}>
                    <List>
                        <ListItem key={-1}>
                            <Typography variant='body'>Defender modifiers: {formData.attacks[attackKey].totalDefenderBonus}</Typography>
                        </ListItem>
                        {formData.attacks[attackKey].defenderBonusModifiers.map((key, index) => (
                            <ListItem key={index}>
                                <Typography variant='caption'>
                                    {key.type}: {key.value}
                                </Typography>
                            </ListItem>
                        ))}
                    </List>
                </Grid>
                <Grid size={4}>
                    <List>
                        <ListItem key={-1}>
                            <Typography variant='body'>Attack modifiers {formData.attacks[attackKey].totalAttackBonus}</Typography>
                        </ListItem>
                        {formData.attacks[attackKey].attackBonusModifiers.map((key, index) => (
                            <ListItem key={index}>
                                <Typography variant='caption'>
                                    {key.type}: {key.value}
                                </Typography>
                            </ListItem>
                        ))}
                    </List>
                </Grid>
                <Grid size={12}>
                    <Typography variant='body'>Total modifiers {formData.attacks[attackKey].totalBonus}</Typography>
                </Grid>
            </Grid>
            <pre>
                {JSON.stringify(formData.attacks[attackKey], null, 2)}
            </pre>
        </>
    );
};

export default AttackResolutionAttributes;