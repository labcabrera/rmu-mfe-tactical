import React from 'react';
import { useTranslation } from 'react-i18next';
import { Stack } from '@mui/material';
import { Section, StatRow, TacticalGame } from '@labcabrera-rmu/rmu-react-shared-lib';
import ExtremeTemperatureControl from '../../shared/environment/ExtremeTemperatureControl';
import LightSourceControl from '../../shared/environment/LightSourceControl';
import AmbientLightSelect from '../../shared/selects/AmbientLightSelect';
import FogSelect from '../../shared/selects/FogSelect';

/**
 * Environment of the game: its fatigue modifiers, the ambient light (workspace spec 076), the fog, the light source
 * and the extreme temperature (workspace spec 079), set here by the master.
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
      <Stack spacing={2} sx={{ mt: 1.5 }}>
        <AmbientLightSelect game={tacticalGame} onChange={onChange} fullWidth />
        <FogSelect game={tacticalGame} onChange={onChange} fullWidth />
        <LightSourceControl game={tacticalGame} onChange={onChange} />
        <ExtremeTemperatureControl game={tacticalGame} onChange={onChange} />
      </Stack>
    </Section>
  );
}
