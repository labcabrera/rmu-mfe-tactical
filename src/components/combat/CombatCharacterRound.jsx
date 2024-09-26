import React, { useContext, useEffect, useState } from "react";

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid2';

import CombatPhaseActionButtons from "./ComabatPhaseActionButtons";
import CombatCharacterRoundInfo from "./CombatCharacterRoundInfo";
import { CombatContext } from './CombatProvider';

const CombatCharacterRound = ({ characterRound }) => {

    const [character, setCharacter] = useState();

    const { characters, setCharacters } = useContext(CombatContext);
    const { tacticalGame, setTacticalGame } = useContext(CombatContext);

    const loadCharacter = () => {
        setCharacter(characters.find(item => item.id === characterRound.tacticalCharacterId));
    };

    useEffect(() => {
        console.log(`CombatCharacter.useEffect[characterRound] triggered`);
        loadCharacter();
    }, []);

    if (!characterRound || !characters || !character) {
        return <p>Loading...</p>
    }

    return (
        <Box sx={{ flexGrow: 1, margin: 1 }}>
            <Grid container spacing={5}>
                <Grid size={4}>
                    <CombatCharacterRoundInfo character={character} characterRound={characterRound} />
                </Grid>
                <Grid size={2}>
                    <CombatPhaseActionButtons character={character} tacticalGame={tacticalGame} phaseNumber={1} />
                </Grid>
                <Grid size={2}>
                    <CombatPhaseActionButtons character={character} tacticalGame={tacticalGame} phaseNumber={2} />
                </Grid>
                <Grid size={2}>
                    {/* <CombatPhaseActionButtons /> */}
                </Grid>
                <Grid size={2}>
                    {/* <CombatPhaseActionButtons /> */}
                </Grid>
            </Grid>
        </Box>
    );
}

export default CombatCharacterRound;
