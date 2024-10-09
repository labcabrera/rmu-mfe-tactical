import React from "react";
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from "react-router-dom";

import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import CloseButton from "../button/CloseButton";
import ForgeButton from "../button/ForgeButton";

import { API_TACTICAL_URL } from '../../constants/environment';
import { ACTION_BUTTON_SIZE } from "../../constants/ui";

const ForgeItemActions = ({ tacticalCharacter, formData }) => {

    const location = useLocation();
    const navigate = useNavigate();
    const tacticalGame = location.state?.tacticalGame;
    const { t } = useTranslation();

    const handleForgeItemClick = async () => {
        try {
            const requestOptions = {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            };
            const response = await fetch(`${API_TACTICAL_URL}/characters/${tacticalCharacter.id}/items`, requestOptions);
            if (response.status === 200) {
                navigate(`/tactical/characters/edit/${tacticalCharacter.id}`);
            } else {
                const responseBody = await response.json();
                throw responseBody.message;
            }
            return;
        } catch (error) {
            //TODO
            console.error(`handleForgeItemClick error ${error}`);
        }
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
                    <Link underline="hover" color="inherit" href='/tactical'>{t('tactical-games')}</Link>
                    <Typography sx={{ color: 'text.primary' }}>{tacticalGame.name}</Typography>
                    <Typography sx={{ color: 'text.primary' }}>Characters</Typography>
                    <Link underline="hover" color="inherit" href={`/tactical/characters/edit/${tacticalCharacter.id}`}>{tacticalCharacter.name}</Link>
                    <Typography sx={{ color: 'text.primary' }}>Forge item</Typography>
                </Breadcrumbs>

                <div style={{ flexGrow: 1 }} />

                <CloseButton size={ACTION_BUTTON_SIZE} />
                <ForgeButton onClick={handleForgeItemClick} size={ACTION_BUTTON_SIZE} disabled={!formData.itemTypeId} />
            </Stack>
        </div>
    );
}

export default ForgeItemActions;