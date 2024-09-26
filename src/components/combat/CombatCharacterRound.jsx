import React, { useEffect, useState, useContext } from "react";

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid2';

import { CombatContext } from './CombatProvider';

const CombatCharacterRound = (characterRound) => {

    const [character, setCharacter] = useState();

    const { characters, setCharacters } = useContext(CombatContext);

    const loadCharacter = () => {
        const e = characters[0];
        setCharacter(e);
    };

    useEffect(() => {
        console.log(`CombatCharacter.useEffect[characterRound] triggered`);
        loadCharacter();
    }, []);

    if(!characterRound || !characters || !character) {
        return <p>Loading...</p>
    }

    return (
        <Box sx={{ flexGrow: 1 }}>
            <Grid container spacing={2}>
                <Grid size={4}>
                    <p>{character.name}</p>
                    <p>{character.hp.current}/{character.hp.max} HP</p>
                </Grid>
                <Grid size={2}>
                    Action 1
                </Grid>
                <Grid size={2}>
                    Action 2
                </Grid>
                <Grid size={2}>
                    Action 3
                </Grid>
                <Grid size={2}>
                    Action 4
                </Grid>
            </Grid>
        </Box>
    );
}

export default CombatCharacterRound;
