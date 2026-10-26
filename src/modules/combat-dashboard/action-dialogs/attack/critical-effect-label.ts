import type { TFunction } from 'i18next';
import { CriticalEffect } from '../../../api/action.dto';

/**
 * Label of an effect of a critical or fumble entry: its status with the value (or dice), the rounds and the delay. A
 * useless limb names it and an additional critical its severity (spec 034).
 */
export const criticalEffectLabel = (effect: CriticalEffect, t: TFunction): string => {
  const amount = effect.dice ?? effect.value;
  const labels = [amount ? `${t(effect.status)} ${amount}` : t(effect.status)];
  if (effect.location) labels.push(t(effect.location));
  if (effect.severity) labels.push(t('critical-severity-n', { severity: effect.severity }));
  if (effect.rounds) labels.push(`${effect.rounds} ${effect.rounds === 1 ? t('round') : t('rounds')}`);
  if (effect.delay) labels.push(`${t('delay')} ${effect.delay}`);
  return labels.join(', ');
};
