import React from "react";
import { useTranslation } from 'react-i18next';
import { useNavigate } from "react-router-dom";

import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import BackButton from "../../button/BackButton";
import SaveButton from "../../button/SaveButton";

import { ACTION_BUTTON_SIZE } from "../../../constants/ui";

const TacticalGameEditActions = ({ tacticalGame }) => {

    const navigate = useNavigate();
    const { t } = useTranslation();

    if (!tacticalGame) {
        return <p>Loading...</p>
    }

    const handleSaveButtonClick = () => {
    };

    const handleBackButtonClick = () => {
        navigate(`/tactical/view/${tacticalGame.id}`, { state: { tacticalGame: tacticalGame } });
        return;
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
                    <Typography sx={{ color: 'text.primary' }}>{t('edit')}</Typography>
                </Breadcrumbs>

                <div style={{ flexGrow: 1 }} />

                <BackButton onClick={handleBackButtonClick} size={ACTION_BUTTON_SIZE} />
                <SaveButton onClick={handleSaveButtonClick} size={ACTION_BUTTON_SIZE} />
            </Stack>
        </div>
    );
}

export default TacticalGameEditActions;