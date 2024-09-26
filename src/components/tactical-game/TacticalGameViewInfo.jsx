//import React from "react";
import * as React from 'react';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';


const TacticalGameViewInfo = ({ tacticalGame }) => {

    const debugMode = false;

    const handleDeleteFaction = (faction) => () => {
        //TODO
        console.log("delete faction " + faction);
    };

    return (
        <div>
            <Box component="form"
                sx={{ '& > :not(style)': { m: 1, width: '100%' } }}
            >
                <TextField
                    label="Name"
                    name="name"
                    value={tacticalGame.name}
                    disabled
                />
                <TextField
                    label="Status"
                    name="status"
                    value={tacticalGame.status}
                    disabled
                />
                <TextField
                    label="Round"
                    value={tacticalGame.round}
                    disabled
                />
                <TextField
                    label="Description"
                    name="description"
                    value={tacticalGame.description}
                    multiline
                    maxRows={4}
                    disabled
                />
                <TextField
                    label="User"
                    name="user"
                    value={tacticalGame.user}
                    disabled
                />
                <TextField
                    label="Created"
                    value={tacticalGame.createdAt}
                    disabled
                />
                <TextField
                    label="Updated"
                    value={tacticalGame.updatedAt}
                    disabled
                />
                <Stack direction="row" spacing={1}>
                    {tacticalGame.factions.map((item) => (
                        <Chip key={item} label={item} variant="outlined" onDelete={handleDeleteFaction(item)} />
                    ))}
                </Stack>
            </Box >
            {
                debugMode ? (
                    <div>
                        <pre>
                            {JSON.stringify(tacticalGame, null, 2)}
                        </pre>
                        <pre>
                            {JSON.stringify(location.state, null, 2)}
                        </pre>
                    </div >
                ) : null}
        </div >
    );
}

export default TacticalGameViewInfo;
