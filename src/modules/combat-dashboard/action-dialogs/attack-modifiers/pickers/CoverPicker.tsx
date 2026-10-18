import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Typography } from '@mui/material';
import { ModifierOption } from '../attack-modifier-fields';
import ModifierTile from './ModifierTile';

const MATERIALS = ['soft', 'hard'] as const;
const AMOUNTS = ['partial', 'half', 'full'] as const;

/**
 * Cover of the target as a matrix: soft or hard cover by row, partial, half or full by column, each with its
 * value; "none" above.
 */
const CoverPicker: FC<{ options: ModifierOption[]; value: string; onChange: (key: string) => void }> = ({
  options,
  value,
  onChange,
}) => {
  const { t } = useTranslation();
  const valueOf = (key: string) => options.find((o) => o.key === key)?.value ?? null;
  return (
    <Box role="radiogroup" aria-label={t('cover')}>
      <Typography variant="caption" color="text.secondary" component="div" sx={{ mb: 0.5 }}>
        {t('cover')}
      </Typography>
      <Box
        sx={{ display: 'grid', gridTemplateColumns: '72px repeat(3, minmax(0, 1fr))', gap: 1, alignItems: 'center' }}
      >
        <Box sx={{ gridColumn: '1 / -1' }}>
          <ModifierTile role="radio" label={t('none')} selected={value === 'none'} onClick={() => onChange('none')} />
        </Box>
        <Box />
        {AMOUNTS.map((amount) => (
          <Typography key={amount} variant="caption" color="text.secondary" align="center">
            {t(`cover-${amount}`)}
          </Typography>
        ))}
        {MATERIALS.map((material) => (
          <React.Fragment key={material}>
            <Typography variant="caption" color="text.secondary">
              {t(`cover-${material}`)}
            </Typography>
            {AMOUNTS.map((amount) => {
              const key = `${material}_${amount}`;
              return (
                <ModifierTile
                  key={key}
                  role="radio"
                  label=""
                  ariaLabel={`${t(`cover-${material}`)} ${t(`cover-${amount}`)}`}
                  value={valueOf(key)}
                  selected={value === key}
                  onClick={() => onChange(key)}
                />
              );
            })}
          </React.Fragment>
        ))}
      </Box>
    </Box>
  );
};

export default CoverPicker;
