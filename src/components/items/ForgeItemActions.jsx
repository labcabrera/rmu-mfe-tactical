import React from "react";
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from "react-router-dom";

import Breadcrumbs from '@mui/material/Breadcrumbs';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import CloseButton from "../button/CloseButton";
import PlayButton from "../button/PlayButton";
import ForgeButton from "../button/ForgeButton";

import { ACTION_BUTTON_SIZE } from "../../constants/ui";

const ForgeItemActions = () => {

    const location = useLocation();
    const navigate = useNavigate();
    const tacticalGame = location.state?.tacticalGame;
    const { t, i18n } = useTranslation();

    const handleForgeItemClick = () => {
        //TODO
    };

    return (
        <div className="generic-action-bar">
            <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                sx={{
                    width: '100%'
                }}>

                <Breadcrumbs aria-label="breadcrumb">
                    <Typography sx={{ color: 'text.primary' }}>{t('tactical-game')}</Typography>
                    <Typography sx={{ color: 'text.primary' }}>{tacticalGame.name}</Typography>
                    <Typography sx={{ color: 'text.primary' }}>Forge item</Typography>
                </Breadcrumbs>

                <div style={{ flexGrow: 1 }} />

                <CloseButton size={ACTION_BUTTON_SIZE} />
                <ForgeButton onClick={handleForgeItemClick} size={ACTION_BUTTON_SIZE}/>
            </Stack>
        </div>
    );
}

export default ForgeItemActions;