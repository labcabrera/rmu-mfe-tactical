import React, { useEffect, useState } from 'react';
import { useLocation, useSearchParams } from "react-router-dom";

import Grid from '@mui/material/Grid2';

import ArmorTextField from '../../input/ArmorTextField';
import AttackTextField from '../../input/AttackTextField';
import DefenseTextField from '../../input/DefenseTextField';
import PenaltyTextField from '../../input/PenaltyTextField';
import SizeTextField from '../../input/SizeTextField';
import SelectAttackWeapon from '../../select/SelectAttackWeapon';
import SelectChargeSpeed from '../../select/SelectChargeSpeed';
import SelectDefender from '../../select/SelectDefender';
import SelectRestrictedQuarters from '../../select/SelectRestrictedQuarters';
import ActionPointSelector from '../../shared/ActionPointSelector';
import TacticalActionCreationActions from '../TacticalActionCreationActions';

const TacticalAttackDeclaration = () => {

    const debugMode = true;
    const noSkillValue = -25;

    const location = useLocation();

    const [searchParams] = useSearchParams();
    const [targetCharacter, setTargetCharacter] = useState();
    const [isValid, setIsValid] = useState(false);

    const phaseStart = searchParams.get('phaseStart');
    const tacticalGame = location.state?.tacticalGame;
    const character = location.state?.character;
    const characters = location.state?.characters;

    const calculateOffensiveBonus = (weaponType) => {
        try {
            var itemId = '';
            switch (weaponType) {
                case 'main-hand':
                    itemId = character.equipment.mainHand;
                    break;
                case 'off-hand':
                    itemId = character.equipment.offhand;
                    break;
                default:
                    throw `Invalid weapon type ${weaponType}`;
            }
            const item = character.items.find(e => e.id == itemId);
            if (!item) {
                return noSkillValue;
            }
            const skillId = item.weapon.skillId;
            console.log("skillId " + skillId);
            const skill = character.skills.find(e => e.skillId == skillId);
            console.log("skill " + skill);
            return skill ? skill.totalBonus : noSkillValue;
        } catch (error) {
            console.error(`Error reading offensive bonus ${error}`);
            return noSkillValue;
        }
    };

    const [formData, setFormData] = useState({
        tacticalGameId: tacticalGame.id,
        round: tacticalGame.round,
        tacticalCharacterId: character.id,
        type: 'attack',
        phaseStart: phaseStart,
        actionPoints: 4,
        tacticalCharacterTargetId: '',
        attackInfo: {
            selectedWeapon: 'main-hand',
            parry: 0,
            restrictedQuarters: 'none',
            chargeSpeed: 'none'
        },
        transient: {
            actionPointPenalty: 0,
            offensiveBonus: calculateOffensiveBonus('main-hand'),
            defensiveBonus: 0,
            attackerSizeId: character.info.sizeId,
            defenderSizeId: '',
        }
    });

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

    useEffect(() => {
        console.log("");
        var isValidForm = true;
        if (!formData.tacticalCharacterTargetId) {
            isValidForm = false;
        }
        setIsValid(isValidForm);
    }, [formData]);

    if (!tacticalGame || !character || !characters) {
        return <p>Loading...</p>
    }

    return (
        <>
            <TacticalActionCreationActions game={tacticalGame} character={character} formData={formData} isValid={isValid} />
            <div className="tactical-game-creation">

                <Grid container spacing={2}>

                    <Grid size={2}>
                        <ActionPointSelector value={formData.actionPoints} min={2} max={4} defaultValue={2} onChange={handleActionPointsChange} />
                    </Grid>
                    <Grid size={2}>
                        <PenaltyTextField i18nLabel='action-points-penalty' value={formData.transient.actionPointPenalty} disabled />
                    </Grid>
                    <Grid size={8}></Grid>

                    <Grid size={2}>
                        <AttackTextField i18Label='attacker' value={character.name} disabled required={false} />
                    </Grid>
                    <Grid size={2}>
                        <SelectAttackWeapon character={character} value={formData.attackInfo.selectedWeapon} onChange={handleSelectedWeaponChange} />
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
                        <AttackTextField i18Label='base-offensive-bonus' value={formData.transient.offensiveBonus} disabled />
                    </Grid>
                    <Grid size={2}>
                        <SizeTextField i18nLabel='attacker-size' value={formData.transient.attackerSizeId} disabled />
                    </Grid>
                    <Grid size={2}>
                    </Grid>
                    <Grid size={2}>
                        <DefenseTextField i18nLabel='base-defensive-bonus' value={formData.transient.defensiveBonus} disabled />
                    </Grid>
                    <Grid size={2}>
                        <SizeTextField i18nLabel='defender-size' value={formData.transient.defenderSizeId} disabled />
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
                {debugMode ? (
                    <div>
                        <h2>formData</h2>
                        <pre>
                            {JSON.stringify(formData, null, 2)}
                        </pre>
                        <h2>character</h2>
                        <pre>
                            {JSON.stringify(character, null, 2)}
                        </pre>
                        <h2>characters</h2>
                        <pre>
                            {JSON.stringify(characters, null, 2)}
                        </pre>
                    </div>
                ) : null}
            </div>
        </>
    );
}

export default TacticalAttackDeclaration;