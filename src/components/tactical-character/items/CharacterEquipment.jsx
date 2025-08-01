import React from "react";

import Grid from '@mui/material/Grid';

import CharacterInventory from "./CharacterInventory";
import CharacterItemSlot from "./CharacterItemSlot";

const CharacterEquipment = ({ game, character, setCharacter }) => {

    return (
        <>
            <Grid container spacing={2}>
                <Grid item xs={3}>
                    <CharacterItemSlot character={character} setCharacter={setCharacter} slot="mainHand" />
                </Grid>
                <Grid item xs={3}>
                    <CharacterItemSlot character={character} setCharacter={setCharacter} slot="offHand" />
                </Grid>
                <Grid item xs={3}>
                    <CharacterItemSlot character={character} setCharacter={setCharacter} slot="body" />
                </Grid>
            </Grid>
            <CharacterInventory game={game} character={character} setCharacter={setCharacter} />
        </>
    );
}

export default CharacterEquipment;