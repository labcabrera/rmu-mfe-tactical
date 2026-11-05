import React from 'react';
import { useTranslation } from 'react-i18next';
import { Box } from '@mui/material';
import { Section, StatRow, TacticalGame } from '@labcabrera-rmu/rmu-react-shared-lib';
import AmbientLightSelect from '../../shared/selects/AmbientLightSelect';

/** Environment of the game: its fatigue modifiers and the ambient light (workspace spec 076), set here by the master. */
export default function TacticalGameViewEnvironment({
  tacticalGame,
  onChange,
}: {
  tacticalGame: TacticalGame;
  onChange: (game: TacticalGame) => void;
}) {
  const { t } = useTranslation();

  const tfm = tacticalGame.environment?.temperatureFatigueModifier || 0;
  const afm = tacticalGame.environment?.altitudeFatigueModifier || 0;

  return (
    <Section title={t('environment')}>
      {tacticalGame.environment && (
        <>
          <StatRow label={t('temperature-modifier')} value={tfm} danger={tfm < 0} success={tfm > 0} />
          <StatRow label={t('altitude-modifier')} value={afm} danger={afm < 0} success={afm > 0} />
        </>
      )}
      <Box sx={{ mt: 1 }}>
        <AmbientLightSelect game={tacticalGame} onChange={onChange} fullWidth />
      </Box>
    </Section>
  );
}
