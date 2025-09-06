import * as React from 'react';
import { useTranslation } from 'react-i18next';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import type { StrategicGame } from '../../api/strategic-games';
import type { TacticalGame } from '../../api/tactical-games';

type TacticalGameViewInfoProps = {
  tacticalGame: TacticalGame;
  strategicGame?: StrategicGame | null;
};

const TacticalGameViewInfo: React.FC<TacticalGameViewInfoProps> = ({ tacticalGame, strategicGame }) => {
  const { t } = useTranslation();

  return (
    <Box component="form" sx={{ '& > :not(style)': { m: 1, width: '100%' } }}>
      <TextField label={t('strategic-game')} name="strategicGame" value={strategicGame?.name || ''} variant="standard" />
      <TextField label={t('tactical-game')} name="tacticalGame" value={tacticalGame.name} variant="standard" />
      <TextField label={t('game-status')} name="status" value={t(`game-status-${tacticalGame.status}`)} variant="standard" />
      <TextField label={t('phase')} name="phase" value={t(`phase-${tacticalGame.phase}`)} variant="standard" />
      <TextField label={t('round')} value={tacticalGame.round} variant="standard" />
      <TextField label={t('owner')} value={tacticalGame.owner} variant="standard" />
      <TextField label={t('description')} name="description" value={tacticalGame.description} multiline maxRows={4} variant="standard" />
    </Box>
  );
};

export default TacticalGameViewInfo;
