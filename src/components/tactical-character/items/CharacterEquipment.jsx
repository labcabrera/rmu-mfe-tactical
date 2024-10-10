import React, { useEffect, useState } from "react";

import Grid from '@mui/material/Grid2';

import CharacterItemSlot from "./CharacterItemSlot";

import CharacterInventory from "./CharacterInventory";

const CharacterEquipment = ({ game, character, setCharacter }) => {

    const [availableItems, setAvailableItems] = useState([]);
    const [selectedImages, setSelectedImages] = useState([]);

    const [imagesMainHand, setImagesMainHand] = useState([]);
    const [imagesOffHand, setImagesOffHand] = useState([]);
    const [imagesBody, setImagesBody] = useState([]);

    const mapImage = (item) => {
        return {
            id: item.id,
            src: `/static/images/items/${item.itemTypeId}.png`,
            alt: item.id
        };
    };

    const loadAvailableImageItems = (tacticalCharacter) => {
        var images = tacticalCharacter.items.map(mapImage);
        if (tacticalCharacter.equipment.mainHand) {
            setImagesMainHand(tacticalCharacter.items.filter(e => e.id == tacticalCharacter.equipment.mainHand).map(mapImage));
            images = images.filter(e => e.id != tacticalCharacter.equipment.mainHand);
        } else {
            setImagesMainHand([]);
        }
        if (tacticalCharacter.equipment.offHand) {
            setImagesOffHand(tacticalCharacter.items.filter(e => e.id == tacticalCharacter.equipment.offHand).map(mapImage));
            images = images.filter(e => e.id != tacticalCharacter.equipment.offHand);
        } else {
            setImagesOffHand([]);
        }
        if (tacticalCharacter.equipment.body) {
            setImagesBody(tacticalCharacter.items.filter(e => e.id == tacticalCharacter.equipment.body).map(mapImage));
            images = images.filter(e => e.id != tacticalCharacter.equipment.body);
        } else {
            setImagesBody([]);
        }
        setAvailableItems(images);
    };

    useEffect(() => {
        console.log(`TacticalCharacterEquipment useEffect ${character}`);
        if (!character || !character.items) {
            return;
        }
        loadAvailableImageItems(character);
    }, [character]);

    if (!character || !character.items) {
        return <p>Loading...</p>
    }

    return (
        <>
            <Grid container spacing={2}>
                <Grid size={3}>
                    <CharacterItemSlot character={character} setCharacter={setCharacter} slot="mainHand" />
                </Grid>
                <Grid size={3}>
                    <CharacterItemSlot character={character} setCharacter={setCharacter} slot="offHand" />
                </Grid>
                <Grid size={3}>
                    <CharacterItemSlot character={character} setCharacter={setCharacter} slot="body" />
                </Grid>
            </Grid>
            <CharacterInventory game={game} character={character} setCharacter={setCharacter} />
        </>
    );
}

export default CharacterEquipment;