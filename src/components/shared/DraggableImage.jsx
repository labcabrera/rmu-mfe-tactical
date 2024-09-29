import React from "react";
import { useDrag } from "react-dnd";

import { Box } from "@mui/material";

const DraggableImage = ({ image, index }) => {

    const [{ isDragging }, drag] = useDrag({
        type: 'image',
        item: { index },
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
    });

    return (
        <Box
            ref={drag}
            sx={{
                opacity: isDragging ? 0.5 : 1,
                cursor: "move",
                display: "flex",
                justifyContent: "center",
            }}>
            <img
                src={image.src}
                alt={image.alt}
                style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "2px",
                }}
            />
        </Box>
    );
};

export default DraggableImage;