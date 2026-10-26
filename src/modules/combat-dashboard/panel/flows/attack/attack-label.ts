import { TFunction } from 'i18next';

/**
 * Name of an attack: its weapon's, or the attack table of a spell (spec 030, phase 4). A ball makes one attack per
 * target, named after its table with the target's number (`fire-ball-1`, `fire-ball-2`…).
 */
export const attackLabel = (attackName: string, t: TFunction): string => {
  const ball = /^(.+)-(\d+)$/.exec(attackName);
  const ballTable = ball ? t(`spell-attack-table-${ball[1]}`, { defaultValue: '' }) : '';
  if (ball && ballTable) return t('spell-ball-attack', { name: ballTable, index: Number(ball[2]) });
  return t([attackName, `spell-attack-table-${attackName}`]);
};
