import React from 'react';
import { useTranslation } from 'react-i18next';
import { Section, StatRow, TacticalGame } from '@labcabrera-rmu/rmu-react-shared-lib';

export default function TacticalGameViewEnvironment({ tacticalGame }: { tacticalGame: TacticalGame }) {
  const { t } = useTranslation();

  if (!tacticalGame) return <p>Loading game...</p>;

  if (!tacticalGame.environment) return null;

  const tfm = tacticalGame.environment.temperatureFatigueModifier || 0;
  const afm = tacticalGame.environment.altitudeFatigueModifier;

  return (
    <Section title={t('environment')}>
      <StatRow label={'temperature-modifier'} value={tfm} danger={tfm < 0} success={tfm > 0} />
      <StatRow label={'altitude-modifier'} value={afm} danger={afm < 0} success={afm > 0} />
    </Section>
  );
}
