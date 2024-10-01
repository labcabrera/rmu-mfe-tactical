import React from 'react';
import { useTranslation } from 'react-i18next';

import Avatar from '@mui/material/Avatar';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import HealthBar from './HealthBar';

const CombatCharacterRoundInfo = ({ characterRound, character }) => {

    const { t, i18n } = useTranslation();

    if (!characterRound || !character) {
        return <p>Loading... {characterRound} {character}</p>
    }

    const getAvatarImage = () => {
        return `/static/images/races/${character.info.race}.jpg`;
    };

    return (
        <Card>
            <CardContent>
                <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    spacing={{ xs: 1, sm: 2, md: 4 }}
                >
                    <Avatar alt={character.name} variant="square" src={getAvatarImage()} />
                    <Typography variant="h6" component="div">
                        {character.name}
                    </Typography>
                </Stack>
                <Typography variant="h6" component="div">
                    {t(character.info.race)} level {character.info.level}
                </Typography>
                <HealthBar currentHP={character.hp.current} maxHP={character.hp.max} />
            </CardContent>
        </Card>
    );
}

export default CombatCharacterRoundInfo;
