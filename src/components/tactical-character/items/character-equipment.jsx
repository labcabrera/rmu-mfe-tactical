import React from "react";

import Grid from '@mui/material/Grid';

import CharacterInventory from "./CharacterInventory";
import CharacterItemSlot from "./character-equipment-slot";

const CharacterEquipment = ({ game, character, setCharacter }) => {

    return (
        <>
            <Grid container spacing={2}>
                <Grid item size={3}>
                    <CharacterItemSlot character={character} setCharacter={setCharacter} slot="mainHand" />
                </Grid>
                <Grid item size={3}>
                    <CharacterItemSlot character={character} setCharacter={setCharacter} slot="offHand" />
                </Grid>
                <Grid item size={3}>
                    <CharacterItemSlot character={character} setCharacter={setCharacter} slot="body" />
                </Grid>
            </Grid>
            <CharacterInventory game={game} character={character} setCharacter={setCharacter} />
        </>
    );
}

export default CharacterEquipment;