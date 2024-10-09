import React from "react";
import { useTranslation } from 'react-i18next';
import { useNavigate } from "react-router-dom";

import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import BackButton from "../../button/BackButton";
import SaveButton from "../../button/SaveButton";

import { API_TACTICAL_URL } from "../../../constants/environment";
import { ACTION_BUTTON_SIZE } from "../../../constants/ui";

const GameCreationActions = ({ formData, isValid = false }) => {

    const navigate = useNavigate();
    const { t } = useTranslation();

    const handleSaveButtonClick = () => {
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        };
        const url = `${API_TACTICAL_URL}/tactical-games`;
        fetch(url, requestOptions)
            .then(response => response.json())
            .then(data => navigate("/tactical/view/" + data.id, { state: { game: data } }));
    };

    const handleBackButtonClick = () => {
        navigate(`/tactical`);
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
                    <Typography sx={{ color: 'text.primary' }}>Create</Typography>
                </Breadcrumbs>

                <div style={{ flexGrow: 1 }} />

                <BackButton onClick={handleBackButtonClick} size={ACTION_BUTTON_SIZE} />
                <SaveButton onClick={handleSaveButtonClick} size={ACTION_BUTTON_SIZE} disabled={!isValid} />
            </Stack>
        </div>
    );
}

export default GameCreationActions;