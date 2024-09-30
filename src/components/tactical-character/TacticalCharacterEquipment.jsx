import React, { useEffect, useState } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

import Grid from '@mui/material/Grid2';
import Typography from '@mui/material/Typography';

import DropZone from '../shared/DropZone';

import { API_TACTICAL_URL } from "../../constants/environment";

const TacticalCharacterEquipment = ({ tacticalCharacter, setTacticalCharacter }) => {

    const [availableItems, setAvailableItems] = useState([]);
    const [selectedImages, setSelectedImages] = useState([]);

    const handleDropToSelected = (index) => {
        console.log("TacticalCharacterEquipment.handleDropToSelected " + index);
        try {
            const image = availableItems[index];
            setSelectedImages([...selectedImages, image]);
            setAvailableItems(availableItems.filter((_, i) => i !== index));
        } catch (error) {
            console.error("TacticalCharacterEquipment.handleDropToSelected error " + error);
        }
    };

    const handleDropToAvailable = (index) => {
        console.log("TacticalCharacterEquipment.handleDropToAvailable " + index);
        try {
            const image = selectedImages[index];
            setAvailableItems([...availableItems, image]);
            setSelectedImages(selectedImages.filter((_, i) => i !== index));
        } catch (error) {
            console.error("TacticalCharacterEquipment.handleDropToAvailable error " + error);
        }
    };

    const handleDropToDelete = async (item) => {
        console.log(`TacticalCharacterEquipment.handleDropToDelete ${JSON.stringify(item, null, 2)}`);
        try {
            const response = await fetch(`${API_TACTICAL_URL}/characters/${tacticalCharacter.id}/items/${item.image.id}`, { method: 'DELETE' });
            if (response.status == 200) {
                const responseBody = await response.json();
                setAvailableItems(availableItems.filter(e => e.id != item.image.id));
                setTacticalCharacter(responseBody);
            } else {
                console.error(`TacticalCharacterEquipment.handleDropToDelete  error ${response.status}`);
            }
        } catch (error) {
            console.error(`TacticalCharacterEquipment.handleDropToDelete  error ${error}`);
        }
    }

    const mapImage = (item) => {
        return {
            id: item.id,
            src: `/static/images/items/${item.itemTypeId}.png`,
            alt: item.id
        };
    };

    useEffect(() => {
        console.log(`TacticalCharacterEquipment useEffect ${tacticalCharacter}`);
        if (!tacticalCharacter || !tacticalCharacter.items) {
            return;
        }
        const images = tacticalCharacter.items.map(mapImage);
        setAvailableItems(images);
    }, [tacticalCharacter]);

    if (!tacticalCharacter || !tacticalCharacter.items) {
        return <p>Loading...</p>
    }

    return (
        <div className="tactical-character-items">
            <DndProvider backend={HTML5Backend}>
                <Grid container spacing={1}>

                    <Grid size={2}>
                        <DropZone images={selectedImages} onDrop={handleDropToAvailable} title="Main hand" />
                    </Grid>
                    <Grid size={2}>
                        <DropZone images={selectedImages} onDrop={handleDropToAvailable} title="Off hand" />
                    </Grid>
                    <Grid size={2}>
                    </Grid>
                    <Grid size={2}>
                        <DropZone images={selectedImages} onDrop={handleDropToDelete} title="Delete item" />
                    </Grid>
                    <Grid size={4}>
                    </Grid>

                    <Grid size={2}>
                        <DropZone images={selectedImages} onDrop={handleDropToAvailable} title="Body" />
                    </Grid>
                    <Grid size={2}>
                        <DropZone images={selectedImages} onDrop={handleDropToAvailable} title="Head" />
                    </Grid>
                    <Grid size={2}>
                        <DropZone images={selectedImages} onDrop={handleDropToAvailable} title="Arms" />
                    </Grid>
                    <Grid size={2}>
                        <DropZone images={selectedImages} onDrop={handleDropToAvailable} title="Legs" />
                    </Grid>
                    <Grid size={4}>
                    </Grid>

                    <Grid size={8}>
                        <DropZone images={availableItems} onDrop={handleDropToSelected} title="Inventory" />
                    </Grid>
                    <Grid size={4}>

                    </Grid>

                    <Grid size={12}>
                        <Typography variant="subtitle2" component="div">Character weight: {tacticalCharacter.info.weight} lbs</Typography>
                    </Grid>
                    <Grid size={12}>
                        <Typography variant="subtitle2" component="div">Equipment weight: {tacticalCharacter.equipment.weight} lbs</Typography>
                    </Grid>

                </Grid>
            </DndProvider>
        </div>
    );
}

export default TacticalCharacterEquipment;