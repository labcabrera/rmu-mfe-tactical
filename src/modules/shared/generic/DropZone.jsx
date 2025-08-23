import React from "react";
import { useDrop } from "react-dnd";

import { Paper, Typography } from "@mui/material";
import Grid from '@mui/material/Grid';

import DraggableImage from './DraggableImage';

const DropZone = ({ images, onDrop, title }) => {

    const [{ isOver }, drop] = useDrop({
        accept: "image",
        drop: (item) => {
            console.log("drop -> " + item);
          onDrop(item);
        },
        collect: (monitor) => ({
          isOver: monitor.isOver(),
        }),
      });

    if (!images || !onDrop || !title) {
        return <p>Loading...</p>
    }

    return (
        <Paper
            ref={drop}
            sx={{
                padding: "10px",
                minHeight: "100px"
            }}
            variant="outlined">
            <Typography variant="caption" component='div' gutterBottom>{title}</Typography>
            <Grid container spacing={2}>
                {images.map((image, index) => (
                    // <Grid item key={image.id}>
                    <Grid>
                        <DraggableImage image={image} />
                    </Grid>
                ))}
            </Grid>
        </Paper>
    );
};

export default DropZone;