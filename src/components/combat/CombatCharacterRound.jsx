import React, { useContext, useEffect, useState } from "react";

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid2';

import CombatCharacterPhaseOptions from './CombatCharacterPhaseOptions';
import CombatCharacterRoundInfo from "./CombatCharacterRoundInfo";
import { CombatContext } from './CombatProvider';

const CombatCharacterRound = ({ characterRound }) => {

    const [character, setCharacter] = useState();

    const { characters, setCharacters } = useContext(CombatContext);
    const { tacticalGame, setTacticalGame } = useContext(CombatContext);
    const { roundActions, setRoundActions } = useContext(CombatContext);

    const loadCharacter = () => {
        setCharacter(characters.find(item => item.id === characterRound.tacticalCharacterId));
    };

    const getActiveAction = (phase) => {
        const characterActions = roundActions.filter(e => e.tacticalCharacterId == characterRound.tacticalCharacterId);
        for (let action of characterActions) {
            console.log("check phase " + action.phaseStart + " vs " + phase);
            if (action.phaseStart == phase) {
                return action;
            }
        };
        return null;
    };

    useEffect(() => {
        console.log(`CombatCharacter.useEffect[characterRound] triggered`);
        loadCharacter();
    }, []);

    if (!characterRound || !characters || !character || !roundActions) {
        return <p>Loading...</p>
    }

    return (
        <Box sx={{ flexGrow: 1, margin: 1 }}>
            <Grid container spacing={5}>
                <Grid size={4}>
                    <CombatCharacterRoundInfo character={character} characterRound={characterRound} />
                </Grid>
                <Grid size={2}>
                    <CombatCharacterPhaseOptions character={character} phase={1} />
                </Grid>
                <Grid size={2}>
                    <CombatCharacterPhaseOptions character={character} phase={2} />
                </Grid>
                <Grid size={2}>
                    <CombatCharacterPhaseOptions character={character} phase={3} />
                </Grid>
                <Grid size={2}>
                    <CombatCharacterPhaseOptions character={character} phase={4} />
                </Grid>
            </Grid>
        </Box>
    );
}

export default CombatCharacterRound;
