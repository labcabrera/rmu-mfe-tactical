import React, { useState } from 'react';
import { useLocation, useSearchParams } from "react-router-dom";

import Grid from '@mui/material/Grid2';

import ArmorTextField from '../input/ArmorTextField';
import AttackTextField from '../input/AttackTextField';
import DefenseTextField from '../input/DefenseTextField';
import SizeTextField from '../input/SizeTextField';
import SelectAttackWeapon from '../select/SelectAttackWeapon';
import SelectDefender from '../select/SelectDefender';
import SelectRestrictedQuarters from '../select/SelectRestrictedQuarters';
import ActionPointSelector from '../shared/ActionPointSelector';
import TacticalActionCreationActions from './TacticalActionCreationActions';

import { API_CORE_URL } from "../../constants/environment";

const TacticalAttackCreation = () => {

    const debugMode = true;

    const location = useLocation();
    const [searchParams] = useSearchParams();
    const [targetCharacter, setTargetCharacter] = useState();

    const phaseStart = searchParams.get('phaseStart');
    const tacticalGame = location.state?.tacticalGame;
    const character = location.state?.character;
    const characters = location.state?.characters;

    const [formData, setFormData] = useState({
        tacticalGameId: tacticalGame.id,
        round: tacticalGame.round,
        tacticalCharacterId: character.id,
        type: 'attack',
        phaseStart: phaseStart,
        actionPoints: 2,
        tacticalCharacterTargetId: '',
        attackInfo: {
            selectedWeapon: 'main-hand',
            armorType: '',
            offensiveBonus: '',
            defensiveBonus: '',
            attackerParry: '',
            basePenalties: '',
            restrictedQuarters: 'none'
        }
    });

    const fetchCharacterSizeAttackEffects = async (attackerSizeId, defenderSizeId) => {
        try {
            const response = await fetch(`${API_CORE_URL}/character-sizes/attack-effects/${attackerSizeId}/${defenderSizeId}`);
            if (response.status == 200) {
                const data = await response.json();
                updateFormData('attackInfo', 'sizeHpMultiplier', data.hitMultiplier);
                updateFormData('attackInfo', 'sizeCriticalTypeModifier', data.criticalTypeModifier);
            }
        }
        catch (error) {
            console.error("fetchCharacterSizeAttackEffects error: " + error);
        }
    };

    const handleTargetChange = async (targetCharacterId) => {
        const targetCharacter = characters.find(e => e.id == targetCharacterId);
        console.log("target: " + JSON.stringify(targetCharacter, null, 2));
        setTargetCharacter(targetCharacter);
        setFormData({ ...formData, tacticalCharacterTargetId: targetCharacterId });
        updateFormData('attackInfo', 'armorType', targetCharacter.defense.armorType);
        updateFormData('attackInfo', 'defenderSizeId', targetCharacter.info.sizeId);
        await fetchCharacterSizeAttackEffects(formData.attackInfo.attackerSizeId, targetCharacter.info.sizeId);
    };

    const handleActionPointsChange = (actionPoints) => {
        setFormData({ ...formData, actionPoints: actionPoints });
    };

    const handleSelectedWeaponChange = (e) => { updateFormData('attackInfo', 'selectedWeapon', e) };
    const handleRestrictedQuarterChange = (e) => { updateFormData('attackInfo', 'restrictedQuarters', e) };

    const updateFormData = (field1, field2, value) => {
        setFormData((prevState) => ({
            ...prevState,
            [field1]: {
                ...prevState[field1],
                [field2]: value
            }
        }));
    };

    if (!tacticalGame || !character || !characters) {
        return <p>Loading...</p>
    }

    return (
        <>
            <TacticalActionCreationActions tacticalGame={tacticalGame} formData={formData} />
            <div className="tactical-game-creation">

                <Grid container spacing={2}>

                    <Grid size={4}>
                        <ActionPointSelector value={formData.actionsPoints} min={2} max={4} defaultValue={2} onChange={handleActionPointsChange} />
                    </Grid>
                    <Grid size={8}></Grid>

                    <Grid size={2}>
                        <AttackTextField value={character.name} i18LabelKey='attacker' disabled required={false} />
                    </Grid>
                    <Grid size={2}>
                        <SelectAttackWeapon character={character} value={formData.attackInfo.selectedWeapon} onChange={handleSelectedWeaponChange} />
                    </Grid>
                    <Grid size={2}></Grid>
                    <Grid size={2}>
                        <SelectDefender value={formData.tacticalCharacterTargetId} onChange={handleTargetChange} targets={characters} />
                    </Grid>
                    <Grid size={2}>
                        <ArmorTextField value={formData.attackInfo.armorType} disabled />
                    </Grid>
                    <Grid size={2}></Grid>

                    <Grid size={2}>
                        <AttackTextField i18LabelKey='offensive-bonus' value={formData.attackInfo.offensiveBonus} disabled />
                    </Grid>
                    <Grid size={2}>
                        <SizeTextField i18nLabel='attacker-size' value={formData.attackInfo.attackerSizeId} disabled />
                    </Grid>
                    <Grid size={2}>
                    </Grid>
                    <Grid size={2}>
                        <DefenseTextField value={formData.attackInfo.defensiveBonus} disabled />
                    </Grid>
                    <Grid size={2}>
                        <SizeTextField i18nLabel='defender-size' value={formData.attackInfo.defenderSizeId} disabled />
                    </Grid>
                    <Grid size={2}></Grid>

                    <Grid size={2}>
                        <DefenseTextField i18nLabel='parry' value={formData.attackInfo.parry} disabled />
                    </Grid>
                    <Grid size={10}></Grid>

                    <Grid size={2}>
                        <SelectRestrictedQuarters value={formData.attackInfo.restrictedQuarters} onChange={handleRestrictedQuarterChange} />
                    </Grid>

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

export default TacticalAttackCreation;