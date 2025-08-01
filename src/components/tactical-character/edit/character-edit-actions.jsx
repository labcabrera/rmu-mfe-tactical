import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from "react-router-dom";

import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import CancelButton from '../../button/CancelButton';
import SaveButton from '../../button/SaveButton';

import { API_TACTICAL_URL } from '../../../constants/environment';
import { ACTION_BUTTON_SIZE } from '../../../constants/ui';

const CharacterEditActions = ({ tacticalGame, tacticalCharacter, formData, onError }) => {

    const navigate = useNavigate();
    const { t } = useTranslation();

    const handleNavigateBackClick = (e) => {
        navigate(`/tactical/view/${tacticalGame.id}`, { state: { tacticalGame: tacticalGame } });
    };

    const updateTacticalCharacter = async (e) => {
        try {
            e.preventDefault();
            const requestOptions = {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            };
            const response = await fetch(`${API_TACTICAL_URL}/characters/${tacticalCharacter.id}`, requestOptions);
            if (response.status == 200) {
                navigate(`/tactical/view/${tacticalCharacter.gameId}`, { state: { tacticalGame: tacticalGame } });
            } else {
                console.log(`TacticalCharacterModification.updateTacticalCharacter error ${response.status}`);
            }
        } catch (error) {
            console.error(`TacticalCharacterModification.updateTacticalCharacter error ${error}`);
        }
    };

    if (!tacticalGame || !formData) {
        return <p>Loading... (actions)</p>
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
                    <Link underline="hover" color="inherit" href={`/tactical/view/${tacticalGame.id}`}>{tacticalGame.name}</Link>
                    <Typography sx={{ color: 'text.primary' }}>Characters</Typography>
                    <Link underline="hover" color="inherit" href={`/tactical/characters/edit/${tacticalCharacter.id}`}>{tacticalCharacter.name}</Link>
                    <Typography sx={{ color: 'text.primary' }}>Edit</Typography>
                </Breadcrumbs>

                <div style={{ flexGrow: 1 }} />

                <CancelButton onClick={handleNavigateBackClick} size={ACTION_BUTTON_SIZE} />
                <SaveButton onClick={updateTacticalCharacter} size={ACTION_BUTTON_SIZE} />
            </Stack>
        </div>

    );
}

export default CharacterEditActions;