import React, { useState } from 'react';

import Grid from '@mui/material/Grid';

import { Typography } from '@mui/material';
import DefenseTextField from '../../input/DefenseTextField';
import SelectAttackMode from '../../select/SelectAttackMode';
import SelectChargeSpeed from '../../select/SelectChargeSpeed';
import SelectDefender from '../../select/SelectDefender';
import SelectRestrictedQuarters from '../../select/SelectRestrictedQuarters';
import ActionPointSelector from '../../shared/ActionPointSelector';

const AttackDeclarationAttributes = ({ formData, setFormData, character, characters }) => {

    const [attackMode, setAttackMode] = useState('mainHand');
    const [actionPointsPenalty, setActionPointsPenalty] = useState(0);

    const handleMainHandTargetChange = (targetCharacterId) => {
        setFormData((prevState) => ({
            ...prevState,
            attackInfo: {
                ...prevState.attackInfo,
                attacks: {
                    ...prevState.attackInfo.attacks,
                    mainHand: {
                        ...prevState.attackInfo.attacks.mainHand,
                        targetId: targetCharacterId
                    }
                }
            }
        }));
    };

    const handleOffHandTargetChange = (targetCharacterId) => {
        setFormData((prevState) => ({
            ...prevState,
            attackInfo: {
                ...prevState.attackInfo,
                attacks: {
                    ...prevState.attackInfo.attacks,
                    offHand: {
                        ...prevState.attackInfo.attacks.offHand,
                        targetId: targetCharacterId
                    }
                }
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
        }));
        setActionPointsPenalty((4 - actionPoints) * -25);
    };

    const handleSelectedAttackModeChange = (mode) => {
        setAttackMode(mode);
        switch (mode) {
            case 'mainHand':
                setFormData((prevState) => ({
                    ...formData,
                    attackInfo: {
                        ...formData.attackInfo,
                        attacks: {
                            mainHand: {
                                targetId: ''
                            }
                        }
                    }
                }));
                break;
            case 'offHand':
                setFormData((prevState) => ({
                    ...formData,
                    attackInfo: {
                        ...formData.attackInfo,
                        attacks: {
                            offHand: {
                                targetId: ''
                            }
                        }
                    }
                }));
                break;
            case 'dual':
                setFormData((prevState) => ({
                    ...formData,
                    attackInfo: {
                        ...formData.attackInfo,
                        attacks: {
                            mainHand: {
                                targetId: ''
                            },
                            offHand: {
                                targetId: ''
                            }
                        }
                    }
                }));
                break;
        }
    };

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

    if (!formData || !character || !characters) {
        return <p>Loading...</p>
    }

    return (
        <>
            <div className="generic-main-content">
                attackdeclarationattributes.jsx
                <Grid container spacing={2}>

                    <Grid item size={6}>
                        <ActionPointSelector value={formData.actionPoints} min={2} max={4} defaultValue={2} onChange={handleActionPointsChange} />
                    </Grid>
                    <Grid item size={6}>
                        <Typography>
                            Actions points penalty: {actionPointsPenalty}
                        </Typography>
                    </Grid>

                    <Grid item size={12}>
                        <SelectAttackMode character={character} value={attackMode} onChange={handleSelectedAttackModeChange} />
                    </Grid>

                    {formData.attackInfo.attacks.mainHand ? (
                        <>
                            <Grid item size={12}>
                                <SelectDefender
                                    i18nLabel='main-hand-target'
                                    value={formData.attackInfo.attacks.mainHand.targetId}
                                    onChange={handleMainHandTargetChange}
                                    sourceId={character.id}
                                    targets={characters} />
                            </Grid>
                        </>
                    ) : null}

                    {formData.attackInfo.attacks.offHand ? (
                        <>
                            <Grid item size={12}>
                                <SelectDefender
                                    i18nLabel='off-hand-target'
                                    value={formData.attackInfo.attacks.offHand.targetId}
                                    onChange={handleOffHandTargetChange}
                                    sourceId={character.id}
                                    targets={characters} />
                            </Grid>
                        </>
                    ) : null}

                    <Grid item size={12}>
                        <DefenseTextField i18nLabel='parry' value={formData.attackInfo.parry} onChange={handleParryChange} />
                    </Grid>
                </Grid>
            </div>
        </>
    );s
}

export default AttackDeclarationAttributes;