import React, { useContext } from "react";
import { useTranslation } from 'react-i18next';
import { useNavigate } from "react-router-dom";

import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { CombatContext } from './CombatProvider';

import AddButton from "../button/AddButton";
import BackButton from "../button/BackButton";
import CloseButton from "../button/CloseButton";
import NextButton from "../button/NextButton";

import { API_TACTICAL_URL } from "../../constants/environment";
import { ACTION_BUTTON_SIZE } from "../../constants/ui";

const CombatDashboardActions = () => {

    const navigate = useNavigate();
    const { t, i18n } = useTranslation();

    const { displayRound, setDisplayRound } = useContext(CombatContext);
    const { tacticalGame, setTacticalGame } = useContext(CombatContext);

    const handleDisplayPreviousRoundClick = () => {
        setDisplayRound(displayRound > 1 ? displayRound - 1 : 1);
    };

    const handleDisplayNextRoundClick = () => {
        setDisplayRound(displayRound + 1);
    };

    const handleNextRoundClick = async () => {
        try {
            const response = await fetch(`${API_TACTICAL_URL}/tactical-games/${tacticalGame.id}/rounds/start`, { method: 'POST' });
            const data = await response.json();
            setTacticalGame(data);
            setDisplayRound(data.round);
        } catch (error) {
            console.error("CombatDashboardActions.fecthCharacterRounds error: " + error);
        }
    };

    const handleCloseDashboardClick = () => {
        navigate(`/tactical/view/${tacticalGame.id}`, { state: { tacticalGame: tacticalGame } });
    };

    if (!displayRound || !tacticalGame) {
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
                    <Typography sx={{ color: 'text.primary' }}>{t('tactical-game')}</Typography>
                    <Link underline="hover" color="inherit" href={`/tactical/view/${tacticalGame.id}`}>{tacticalGame.name}</Link>
                    <Typography sx={{ color: 'text.primary' }}>Round</Typography>
                    <Typography sx={{ color: 'text.primary' }}>{displayRound}/{tacticalGame.round}</Typography>
                    <Typography sx={{ color: 'text.primary' }}>{t(`phase-${tacticalGame.phase}`)}</Typography>
                </Breadcrumbs>

                <div style={{ flexGrow: 1 }} />

                <BackButton onClick={handleDisplayPreviousRoundClick} disabled={displayRound === 1} size={ACTION_BUTTON_SIZE} />
                <NextButton onClick={handleDisplayNextRoundClick} disabled={displayRound === tacticalGame.round} size={ACTION_BUTTON_SIZE} />
                <AddButton onClick={handleNextRoundClick} size={ACTION_BUTTON_SIZE} />
                <CloseButton onClick={handleCloseDashboardClick} size={ACTION_BUTTON_SIZE} />
            </Stack>
        </div>
    );
}

export default CombatDashboardActions;
