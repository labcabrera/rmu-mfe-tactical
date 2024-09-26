import React, { useContext, useEffect, useState } from "react";

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid2';
import Paper from '@mui/material/Paper';

import CombatCharacterRoundInfo from "./CombatCharacterRoundInfo";
import { CombatContext } from './CombatProvider';
import ImageButton from "../shared/ImageButton";

const CombatCharacterRound = ({ characterRound }) => {

    const [character, setCharacter] = useState();

    const { characters, setCharacters } = useContext(CombatContext);

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
                    <ImageButton
                        imagenSrc='/static/images/actions/movement.jpg'
                        altText='Movement'
                        width={50}
                        height={50}
                        disabled={false} />
                    <ImageButton
                        imagenSrc='/static/images/actions/attack.png'
                        altText='Attack'
                        width={50}
                        height={50}
                        disabled={false} />
                    <ImageButton
                        imagenSrc='/static/images/actions/movement-maneuver.webp'
                        altText='Movement maneuver'
                        width={50}
                        height={50}
                        disabled={false} />
                    <ImageButton
                        imagenSrc='/static/images/actions/static-maneuver.png'
                        altText='Static maneuver'
                        width={50}
                        height={50}
                        disabled={false} />
                </Grid>
                <Grid size={2}>
                    <ImageButton
                        imagenSrc='/static/images/actions/attack.png'
                        altText='Attack'
                        width={50}
                        height={50}
                        disabled={true} />
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
