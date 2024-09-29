import { Box } from "@mui/material";
import React from "react";
import { useDrag } from "react-dnd";

const DraggableImage = ({ image, index, moveImage }) => {

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
                    width: "100px",
                    height: "100px",
                    borderRadius: "8px",
                }}
            />
        </Box>
    );
};

export default DraggableImage;