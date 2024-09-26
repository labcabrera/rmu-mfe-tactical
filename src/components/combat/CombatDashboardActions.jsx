import React, { useContext } from "react";

import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import NavigateBeforeOutlinedIcon from '@mui/icons-material/NavigateBeforeOutlined';
import NavigateNextOutlinedIcon from '@mui/icons-material/NavigateNextOutlined';
import PlayCircleIcon from '@mui/icons-material/PlayCircle';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';

import { CombatContext } from './CombatProvider';

const CombatDashboardActions = () => {

    const { displayRound, setDisplayRound } = useContext(CombatContext);

    const handlePreviousRoundClick = () => {
        setDisplayRound(displayRound - 1);
    };

    const handleNextRoundClick = () => {
        setDisplayRound(displayRound + 1);
    };

    return (
        <div className="combat-dashboard-actions">
            <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                sx={{ width: '100%', height: 100 }}
            >

                {/* <div>Round X/{tacticalGame.round}</div> */}
                <div>{JSON.stringify(displayRound, null, 2)}</div>

                <div style={{ flexGrow: 1 }} />

                <Button variant="outlined">Action phase</Button>
                <Button variant="outlined">End turn</Button>

                <IconButton variant="outlined" onClick={handlePreviousRoundClick}>
                    <NavigateBeforeOutlinedIcon />
                </IconButton>
                <IconButton variant="outlined" onClick={handleNextRoundClick}>
                    <NavigateNextOutlinedIcon />
                </IconButton>

                <IconButton variant="outlined">
                    <PlayCircleIcon />
                </IconButton>
                <IconButton variant="outlined">
                    <EditIcon />
                </IconButton>
                <IconButton variant="outlined">
                    <DeleteIcon />
                </IconButton>
            </Stack>
        </div>
    );
}

export default CombatDashboardActions;
