import React, { FC, KeyboardEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { alpha, Box, Stack, Typography, useTheme } from '@mui/material';
import { NumericInput } from '@labcabrera-rmu/rmu-react-shared-lib';
import ModifierTile from './ModifierTile';

/** ARIA role of each clickable zone. */
const RADIO = 'radio';

type Zone = 'head' | 'chest' | 'abdomen' | 'arms' | 'legs';

// Shapes of a simple front silhouette (viewBox 140 x 220). Arms and legs are two shapes each, one zone.
const SHAPES: { zone: Zone; shape: 'circle' | 'rect'; props: Record<string, number> }[] = [
  { zone: 'head', shape: 'circle', props: { cx: 70, cy: 26, r: 20 } },
  { zone: 'chest', shape: 'rect', props: { x: 44, y: 50, width: 52, height: 46, rx: 8 } },
  { zone: 'abdomen', shape: 'rect', props: { x: 46, y: 99, width: 48, height: 40, rx: 8 } },
  { zone: 'arms', shape: 'rect', props: { x: 18, y: 52, width: 22, height: 88, rx: 10 } },
  { zone: 'arms', shape: 'rect', props: { x: 100, y: 52, width: 22, height: 88, rx: 10 } },
  { zone: 'legs', shape: 'rect', props: { x: 46, y: 142, width: 22, height: 74, rx: 10 } },
  { zone: 'legs', shape: 'rect', props: { x: 72, y: 142, width: 22, height: 74, rx: 10 } },
];

/**
 * Called shot as a silhouette: click (or focus and press Enter or Space) the part to aim at; "none" clears it.
 * The penalty of the called shot can be changed once a part is chosen.
 */
const CalledShotPicker: FC<{
  value: string;
  penalty: number | null | undefined;
  onChange: (zone: string) => void;
  onPenalty: (penalty: number | null) => void;
}> = ({ value, penalty, onChange, onPenalty }) => {
  const { t } = useTranslation();
  const theme = useTheme();

  const fill = (zone: Zone) =>
    value === zone ? theme.palette.primary.main : alpha(theme.palette.text.secondary, 0.22);
  const onKeyDown = (zone: Zone) => (event: KeyboardEvent<SVGElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onChange(zone);
    }
  };

  return (
    <Stack direction="row" spacing={2} sx={{ alignItems: 'flex-start' }}>
      <Box
        component="svg"
        viewBox="0 0 140 220"
        role="radiogroup"
        aria-label={t('called-shot')}
        sx={{ width: 120, height: 190, flexShrink: 0, overflow: 'visible' }}
      >
        {SHAPES.map(({ zone, shape, props }, index) => {
          const Shape = shape;
          // Only the first shape of a zone is the focusable radio; the second one is part of it.
          const first = SHAPES.findIndex((s) => s.zone === zone) === index;
          return (
            <Shape
              key={index}
              {...props}
              fill={fill(zone)}
              stroke={value === zone ? theme.palette.primary.dark : theme.palette.divider}
              strokeWidth={1.5}
              style={{ cursor: 'pointer', transition: 'fill 150ms' }}
              onClick={() => onChange(zone)}
              {...(first
                ? {
                    role: RADIO,
                    'aria-checked': value === zone,
                    'aria-label': t(zone),
                    tabIndex: 0,
                    onKeyDown: onKeyDown(zone),
                  }
                : { 'aria-hidden': true })}
            >
              <title>{t(zone)}</title>
            </Shape>
          );
        })}
      </Box>
      <Stack spacing={1} sx={{ flex: 1, minWidth: 0, maxWidth: 280 }}>
        <Typography variant="caption" color="text.secondary">
          {t('called-shot')}
        </Typography>
        <ModifierTile role="radio" label={t('none')} selected={value === 'none'} onClick={() => onChange('none')} />
        {value !== 'none' && (
          <>
            <Typography variant="body2" sx={{ fontWeight: 700 }}>
              {t(value)}
            </Typography>
            <NumericInput label={t('called-shot-penalty')} value={penalty ?? null} onChange={onPenalty} integer />
          </>
        )}
      </Stack>
    </Stack>
  );
};

export default CalledShotPicker;
