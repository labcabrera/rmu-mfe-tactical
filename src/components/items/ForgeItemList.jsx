import React from "react";

import Grid from '@mui/material/Grid2';

import { IconButton } from "@mui/material";

const ForgeItemList = ({ items }) => {

    if (!items) {
        return <p>Loading...</p>
    }

    return (
        <Grid container spacing={0}>
            {items.map((item, index) => (
                <Grid size={1}>
                    <IconButton>
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
