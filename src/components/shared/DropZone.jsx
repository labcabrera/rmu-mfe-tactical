import React from "react";
import { useDrop } from "react-dnd";

import { Paper, Typography } from "@mui/material";
import Grid from '@mui/material/Grid2';

import DraggableImage from './DraggableImage';

const DropZone = ({ images, onDrop, title }) => {

    const [, drop] = useDrop({
        accept: 'image',
        drop: (item) => {
            console.log("drop " + item);
            onDrop(item.index);
        },
    });

    if (!images || !onDrop || !title) {
        return <p>Loading...</p>
    }

    return (
        <Paper
            ref={drop}
            sx={{
                padding: "16px",
                minHeight: "150px",
                //backgroundColor: "#f0f0f0",
            }}
            variant="outlined">
            <Typography variant="h6" gutterBottom>
                {title}
            </Typography>
            <Grid container spacing={2}>
                {images.map((image, index) => (
                    <Grid item key={image.id}>
                        <DraggableImage image={image} index={index} />
                    </Grid>
                ))}
            </Grid>
            {/* <pre>
                <h3>images</h3>
                <pre>
                    {JSON.stringify(images, null, 2)}
                </pre>
            </pre> */}
        </Paper>
    );
};

export default DropZone;