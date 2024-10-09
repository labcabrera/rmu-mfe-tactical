import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from "react-router-dom";

import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import BackButton from '../button/BackButton';
import SaveButton from '../button/SaveButton';


import { API_TACTICAL_URL } from "../../constants/environment";
import { ACTION_BUTTON_SIZE } from '../../constants/ui';

const TacticalActionCreationActions = ({ game: game, character, formData, isValid = true }) => {

    const navigate = useNavigate();
    const { t } = useTranslation();

    const createAction = async (e) => {
        e.preventDefault();
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        };
        const createActionResponse = await fetch(`${API_TACTICAL_URL}/actions`, requestOptions);
        if (createActionResponse.status == 201) {
            navigate(`/tactical/combat/${game.id}`);
            return;
        } else {
            error = await createActionResponse.json();
            console.log(error.message);
        }
    }

    const handleBackClick = () => {
        navigate(`/tactical/combat/${game.id}`);
        return;
    };

    if (!game || !formData) {
        return <p>Loading...</p>
    }

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
                    <Link underline="hover" color="inherit" href={`/tactical/view/${game.id}`}>{game.name}</Link>
                    <Link underline="hover" color="inherit" href={`/tactical/characters/edit/${character.id}`}>{character.name}</Link>
                    <Typography sx={{ color: 'text.primary' }}>{t(formData.type)} declaration</Typography>
                </Breadcrumbs>

                <div style={{ flexGrow: 1 }} />

                <BackButton onClick={handleBackClick} size={ACTION_BUTTON_SIZE} />
                <SaveButton onClick={createAction} size={ACTION_BUTTON_SIZE} disabled={!isValid} />
            </Stack>
        </div>
    );
}

export default TacticalActionCreationActions;