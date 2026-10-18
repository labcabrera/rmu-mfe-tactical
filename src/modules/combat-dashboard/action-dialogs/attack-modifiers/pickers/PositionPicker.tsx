import React, { FC, KeyboardEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { alpha, Box, Stack, Typography, useTheme } from '@mui/material';
import { formatBonus } from '@labcabrera-rmu/rmu-react-shared-lib';
import { ModifierOption } from '../attack-modifier-fields';

/** ARIA role of each clickable zone. */
const RADIO = 'radio';

/** Sides of the target, as the API names them (`none` is the front). */
const SIDES = ['none', 'flank', 'rear'];

const C = 80;
const INNER = 26;
const OUTER = 74;

/** SVG path of a ring sector between two angles (degrees, 0 = up, clockwise). */
const sector = (from: number, to: number) => {
  const point = (angle: number, radius: number) => {
    const rad = ((angle - 90) * Math.PI) / 180;
    return `${C + radius * Math.cos(rad)} ${C + radius * Math.sin(rad)}`;
  };
  const large = to - from > 180 ? 1 : 0;
  return [
    `M ${point(from, OUTER)}`,
    `A ${OUTER} ${OUTER} 0 ${large} 1 ${point(to, OUTER)}`,
    `L ${point(to, INNER)}`,
    `A ${INNER} ${INNER} 0 ${large} 0 ${point(from, INNER)}`,
    'Z',
  ].join(' ');
};

// Where the attacker strikes the target from: its front (no bonus), a flank or its rear. Both flanks are one option.
const SECTORS: { key: string; from: number; to: number }[] = [
  { key: 'none', from: -45, to: 45 },
  { key: 'flank', from: 45, to: 135 },
  { key: 'rear', from: 135, to: 225 },
  { key: 'flank', from: 225, to: 315 },
];

/**
 * The target seen from above, facing up: click the side the attack comes from (front, flank or rear). Each
 * side shows the bonus it gives.
 */
const PositionPicker: FC<{ options: ModifierOption[]; value: string; onChange: (key: string) => void }> = ({
  options,
  value,
  onChange,
}) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const valueOf = (key: string) => options.find((o) => o.key === key)?.value ?? 0;
  const label = (key: string) => {
    const bonus = valueOf(key);
    return `${t(key === 'none' ? 'front' : key)}${bonus ? ` ${formatBonus(bonus)}` : ''}`;
  };
  const onKeyDown = (key: string) => (event: KeyboardEvent<SVGElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onChange(key);
    }
  };

  return (
    <Stack spacing={0.5}>
      <Typography variant="caption" color="text.secondary">
        {t('positional-target')}
      </Typography>
      <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
        <Box
          component="svg"
          viewBox="0 0 160 160"
          role="radiogroup"
          aria-label={t('positional-target')}
          sx={{ width: 150, height: 150, flexShrink: 0 }}
        >
          {SECTORS.map((s, index) => {
            const selected = value === s.key;
            const first = SECTORS.findIndex((other) => other.key === s.key) === index;
            return (
              <path
                key={index}
                d={sector(s.from, s.to)}
                fill={selected ? theme.palette.primary.main : alpha(theme.palette.text.secondary, 0.16)}
                stroke={theme.palette.background.paper}
                strokeWidth={2}
                style={{ cursor: 'pointer', transition: 'fill 150ms' }}
                onClick={() => onChange(s.key)}
                {...(first
                  ? {
                      role: RADIO,
                      'aria-checked': selected,
                      'aria-label': label(s.key),
                      tabIndex: 0,
                      onKeyDown: onKeyDown(s.key),
                    }
                  : { 'aria-hidden': true })}
              >
                <title>{label(s.key)}</title>
              </path>
            );
          })}
          <circle
            cx={C}
            cy={C}
            r={INNER - 6}
            fill={theme.palette.background.light}
            stroke={theme.palette.text.secondary}
          />
          {/* Facing arrow of the target. */}
          <path d={`M ${C} ${C - 14} L ${C - 7} ${C + 2} L ${C + 7} ${C + 2} Z`} fill={theme.palette.text.secondary} />
        </Box>
        <Stack spacing={0.5}>
          {SIDES.map((key) => (
            <Typography
              key={key}
              variant="body2"
              sx={{ fontWeight: value === key ? 700 : 400 }}
              color={value === key ? 'primary' : 'text.secondary'}
            >
              {label(key)}
            </Typography>
          ))}
        </Stack>
      </Stack>
    </Stack>
  );
};

export default PositionPicker;
