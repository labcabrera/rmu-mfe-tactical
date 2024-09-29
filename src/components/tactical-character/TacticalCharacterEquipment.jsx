import React, { useEffect, useState } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

import Grid from '@mui/material/Grid2';

import DropZone from '../shared/DropZone';

import { API_TACTICAL_URL } from "../../constants/environment";

const TacticalCharacterEquipment = ({ tacticalCharacter }) => {

    const [availableItems, setAvailableItems] = useState([]);
    const [selectedImages, setSelectedImages] = useState([]);

    // Mover imagen de disponibles a seleccionadas
    const handleDropToSelected = (index) => {
        console.log("TacticalCharacterItems.handleDropToSelected " + index);
        try {
            const image = availableItems[index];
            setSelectedImages([...selectedImages, image]);
            setAvailableItems(availableItems.filter((_, i) => i !== index));
        } catch (error) {
            console.error("TacticalCharacterItems.handleDropToSelected error " + error);
        }
    };

    // Mover imagen de seleccionadas a disponibles
    const handleDropToAvailable = (index) => {
        console.log("TacticalCharacterItems.handleDropToAvailable " + index);
        try {
            const image = selectedImages[index];
            setAvailableItems([...availableItems, image]);
            setSelectedImages(selectedImages.filter((_, i) => i !== index));
        } catch (error) {
            console.error("TacticalCharacterItems.handleDropToAvailable error " + error);
        }
    };

    const handleDropToDelete = async (item) => {
        console.log(`TacticalCharacterItems.handleDropToDelete ${JSON.stringify(item, null, 2)}`);
        try {
            const response = await fetch(`${API_TACTICAL_URL}/characters/${tacticalCharacter.id}/items/${item.image.id}`, { method: 'DELETE' });
            if (response.status == 200) {
                setAvailableItems(availableItems.filter(e => e.id != item.image.id));
                //TODO REFRESH
            } else {
                console.log(`TacticalCharacterItems.handleDropToDelete  error ${response.status}`);
            }
        } catch (error) {
            console.log(`TacticalCharacterItems.handleDropToDelete  error ${error}`);
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
        const images = tacticalCharacter.items.map(mapImage);
        setAvailableItems(images);
    }, [tacticalCharacter]);

    return (
        <div className="tactical-character-items">
            <DndProvider backend={HTML5Backend}>
                <Grid container spacing={4}>
                    <Grid item xs={6}>
                        <DropZone images={availableItems} onDrop={handleDropToSelected} title="Items" />
                    </Grid>
                    <Grid item xs={6}>
                        <DropZone images={selectedImages} onDrop={handleDropToAvailable} title="Main weapon" />
                    </Grid>
                    <Grid item xs={6}>
                        <DropZone images={selectedImages} onDrop={handleDropToDelete} title="Delete" />
                    </Grid>
                </Grid>
            </DndProvider>
        </div>
    );
}

export default TacticalCharacterEquipment;