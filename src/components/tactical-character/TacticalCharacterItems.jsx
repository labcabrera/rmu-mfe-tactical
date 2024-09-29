import React, { useState } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

import Grid from '@mui/material/Grid2';

import DropZone from '../shared/DropZone';

const TacticalCharacterItems = ({ tacticalCharacter }) => {

    const [availableImages, setAvailableImages] = useState([
        { id: 1, src: "/static/images/items/scimitar.png", alt: "Image 1" },
        { id: 2, src: "/static/images/items/leather-armor.png", alt: "Image 2" },
        { id: 3, src: "/static/images/items/scimitar.png", alt: "Image 3" },
    ]);

    const [selectedImages, setSelectedImages] = useState([]);

    // Mover imagen de disponibles a seleccionadas
    const handleDropToSelected = (index) => {
        console.log("TacticalCharacterItems.handleDropToSelected " + index);
        try {
            const image = availableImages[index];
            setSelectedImages([...selectedImages, image]);
            setAvailableImages(availableImages.filter((_, i) => i !== index));
        } catch (error) {
            console.error("TacticalCharacterItems.handleDropToSelected error " + error);
        }
    };

    // Mover imagen de seleccionadas a disponibles
    const handleDropToAvailable = (index) => {
        console.log("TacticalCharacterItems.handleDropToAvailable " + index);
        try {
            const image = selectedImages[index];
            setAvailableImages([...availableImages, image]);
            setSelectedImages(selectedImages.filter((_, i) => i !== index));
        } catch (error) {
            console.error("TacticalCharacterItems.handleDropToAvailable error " + error);
        }
    };

    return (
        <div className="tactical-character-items">
            WIP tactical character items

            <DndProvider backend={HTML5Backend}>
                <Grid container spacing={4}>
                    <Grid item xs={6}>
                        <DropZone images={availableImages} onDrop={handleDropToSelected} title="Available Images" />
                    </Grid>
                    <Grid item xs={6}>
                        <DropZone images={selectedImages} onDrop={handleDropToAvailable} title="Selected Images" />
                    </Grid>
                </Grid>
            </DndProvider>
        </div>
    );
}

export default TacticalCharacterItems;