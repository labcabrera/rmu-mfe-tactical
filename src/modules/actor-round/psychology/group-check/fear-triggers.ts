import type { TFunction } from 'i18next';

/** A key of the book rules: the share of fallen allies, `+` when it has to be exceeded (`0.5`, `0.5+`). */
const FALLEN_SHARE = /^(\d*\.?\d+)(\+?)$/;

/**
 * Text of a trigger of a suggested fear check (workspace spec 100): a house key (`strength-50`, `leader-down`…) or a
 * threshold of fallen allies of the book rules.
 */
export const fearTriggerLabel = (trigger: string, t: TFunction): string => {
  const fallen = FALLEN_SHARE.exec(trigger);
  if (fallen) {
    const percent = Math.round(Number(fallen[1]) * 100);
    return t(fallen[2] ? 'fear-trigger-fallen-over' : 'fear-trigger-fallen', { percent });
  }
  return t(`fear-trigger-${trigger}`, { defaultValue: trigger });
};
