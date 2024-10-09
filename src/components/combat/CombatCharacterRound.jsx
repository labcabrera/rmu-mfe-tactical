import React, { useContext, useEffect, useState } from "react";

import { Box } from "@mui/material";
import Grid from '@mui/material/Grid2';

import { CombatContext } from './CombatProvider';

import CombatCharacterPhaseOptions from './CombatCharacterPhaseOptions';
import CombatCharacterRoundInfo from "./CombatCharacterRoundInfo";
import CombatCharacterRoundInitiative from "./CombatCharacterRoundInitiative";
import CombatFreeActionButtons from "./CombatFreeActionButtons";

const CombatCharacterRound = ({ characterRound }) => {

    const [character, setCharacter] = useState();

    const { tacticalGame, setTacticalGame } = useContext(CombatContext);
    const { characters, setCharacters } = useContext(CombatContext);
    const { roundActions, setRoundActions } = useContext(CombatContext);

    const loadCharacter = () => {
        setCharacter(characters.find(item => item.id === characterRound.tacticalCharacterId));
    };

    useEffect(() => {
        loadCharacter();
    }, []);

    if (!characterRound || !characters || !character || !roundActions) {
        return <p>Loading...</p>
    }

    return (
        <Box sx={{ flexGrow: 1 }}>
            <Grid container spacing={2} columns={24} alignItems="center" >
                <Grid size={6}>
                    <CombatCharacterRoundInfo character={character} characterRound={characterRound} />
                </Grid>
                <Grid size={3} display='flex' justifyContent="center">
                    <CombatCharacterRoundInitiative />
                </Grid>
                <Grid size={3} display='flex' justifyContent="center" >
                    <CombatFreeActionButtons tacticalGame={tacticalGame} character={character} />
                </Grid>
                <Grid size={3} display='flex' justifyContent="center">
                    <CombatCharacterPhaseOptions character={character} phase={1} />
                </Grid>
                <Grid size={3} display='flex' justifyContent="center">
                    <CombatCharacterPhaseOptions character={character} phase={2} />
                </Grid>
                <Grid size={3} display='flex' justifyContent="center">
                    <CombatCharacterPhaseOptions character={character} phase={3} />
                </Grid>
                <Grid size={3} display='flex' justifyContent="center">
                    <CombatCharacterPhaseOptions character={character} phase={4} />
                </Grid>
            </Grid>
        </Box>
    );
}

export default CombatCharacterRound;
