import * as React from 'react';
import { useTranslation } from 'react-i18next';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';

const TacticalGameViewInfo = ({ tacticalGame, strategicGame }) => {
  const { t } = useTranslation();

  return (
    <>
      <Box component="form" sx={{ '& > :not(style)': { m: 1, width: '100%' } }}>
        <TextField label={t('strategic-game')} name="name" value={strategicGame?.name || ''} variant="standard" readonly />
        <TextField label={t('tactical-game')} name="name" value={tacticalGame.name} variant="standard" readonly />
        <TextField label={t('game-status')} name="status" value={t(`game-status-${tacticalGame.status}`)} variant="standard" readonly />
        <TextField label={t('phase')} name="phase" value={t(`phase-${tacticalGame.phase}`)} variant="standard" readonly />
        <TextField label={t('round')} value={tacticalGame.round} variant="standard" readonly />
        <TextField label={t('owner')} value={tacticalGame.owner} variant="standard" readonly />
        <TextField label={t('description')} name="description" value={tacticalGame.description} multiline maxRows={4} variant="standard" readonly />
      </Box>
    </>
  );
};

export default TacticalGameViewInfo;
