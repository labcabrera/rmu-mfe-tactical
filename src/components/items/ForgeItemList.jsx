import React from "react";

import Grid from '@mui/material/Grid2';

import { IconButton } from "@mui/material";

const ForgeItemList = ({ items, onSelectedItem }) => {

    if (!items) {
        return <p>Loading...</p>
    }

    const handleItemClick = (itemId) => {
        const item = items.find(e => e.id === itemId);
        onSelectedItem(item);
    };

    return (
        <Grid container spacing={0} columns={8}>
            {items.map((item, index) => (
                <Grid key={index} size={1}>
                    <IconButton key={index} onClick={() => handleItemClick(item.id)}>
                        <img
                            src={`/static/images/items/${item.id}.png`}
                            style={{
                                width: '100%',
                                height: '100%',
                                borderRadius: '2px'
                            }}
                        />
                    </IconButton>
                </Grid>
            ))}
        </Grid>
    );
};

export default ForgeItemList;
