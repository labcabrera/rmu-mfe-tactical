import React from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Stack } from '@mui/material';
import { Section, StatRow, TacticalGame } from '@labcabrera-rmu/rmu-react-shared-lib';
import ExtremeTemperatureControl from '../../shared/environment/ExtremeTemperatureControl';
import LightSourceCalculatorButton from '../../shared/environment/LightSourceCalculator';
import AmbientLightSelect from '../../shared/selects/AmbientLightSelect';
import FogSelect from '../../shared/selects/FogSelect';

/**
 * Environment of the game: its fatigue modifiers, the ambient light (workspace spec 076) with the light source
 * calculator, the fog and the extreme temperature (workspace spec 079), set here by the master.
 */
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
      <Stack direction="row" spacing={0.5} sx={{ mt: 1, alignItems: 'center' }}>
        <AmbientLightSelect game={tacticalGame} onChange={onChange} fullWidth />
        <LightSourceCalculatorButton ambient={tacticalGame.environment?.light ?? null} />
      </Stack>
      <Box sx={{ mt: 1.5 }}>
        <FogSelect game={tacticalGame} onChange={onChange} fullWidth />
      </Box>
      <Box sx={{ mt: 1.5 }}>
        <ExtremeTemperatureControl game={tacticalGame} onChange={onChange} />
      </Box>
    </Section>
  );
}
