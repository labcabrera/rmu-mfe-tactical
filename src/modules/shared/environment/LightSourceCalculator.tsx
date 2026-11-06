import React, { FC, MouseEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';
import CalculateIcon from '@mui/icons-material/Calculate';
import { Box, Chip, IconButton, MenuItem, Popover, Stack, TextField, Tooltip, Typography } from '@mui/material';
import {
  LIGHT_SOURCES,
  LightSource,
  lightAtDistance,
  LightType,
  NumberPadField,
  RuleHint,
} from '@labcabrera-rmu/rmu-react-shared-lib';

/**
 * Light of a source at a distance (workspace spec 079, C5, §15.7): there are no positions in the game, so this only
 * tells the game master the light level to pick (a candle, a torch, a lantern or a bonfire within 10', one level darker
 * to 30', two to 100', three to 300'). The ambient light wins when it is brighter.
 */
export const LightSourceCalculator: FC<{ ambient?: LightType | null }> = ({ ambient }) => {
  const { t } = useTranslation();
  const [source, setSource] = useState<LightSource>('torch');
  const [distance, setDistance] = useState<number | null>(10);
  const light = distance !== null ? lightAtDistance(source, distance, ambient) : null;

  return (
    <Stack spacing={1.5}>
      <RuleHint title={t('light-source-calculator')} description={t('light-source-calculator-help')} reference="§15.7">
        <Typography variant="subtitle2">{t('light-source-calculator')}</Typography>
      </RuleHint>
      <Stack direction="row" spacing={1.5} sx={{ flexWrap: 'wrap', rowGap: 1.5, alignItems: 'flex-start' }}>
        <TextField
          select
          size="small"
          label={t('light-source')}
          value={source}
          onChange={(e) => setSource(e.target.value as LightSource)}
          sx={{ minWidth: 160 }}
        >
          {LIGHT_SOURCES.map((each) => (
            <MenuItem key={each} value={each}>
              {t(`light-source-${each}`)}
            </MenuItem>
          ))}
        </TextField>
        <Box sx={{ width: 160 }}>
          <NumberPadField
            label={t('light-source-distance')}
            value={distance}
            onChange={setDistance}
            min={0}
            allowNegatives={false}
            steps={[-10, -5, 5, 10]}
          />
        </Box>
      </Stack>
      <Chip
        size="small"
        color={light ? 'info' : 'default'}
        label={light ? t('light-source-result', { light: t(light) }) : t('light-source-out-of-range')}
        sx={{ alignSelf: 'flex-start' }}
      />
    </Stack>
  );
};

/** An icon button next to the light selector that opens the calculator in a popover. */
const LightSourceCalculatorButton: FC<{ ambient?: LightType | null }> = ({ ambient }) => {
  const { t } = useTranslation();
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  return (
    <>
      <Tooltip title={t('light-source-calculator')}>
        <IconButton
          size="small"
          aria-label={t('light-source-calculator')}
          onClick={(event: MouseEvent<HTMLElement>) => setAnchor(event.currentTarget)}
        >
          <CalculateIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Popover
        open={!!anchor}
        anchorEl={anchor}
        onClose={() => setAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Box sx={{ p: 2, maxWidth: 380 }}>
          <LightSourceCalculator ambient={ambient} />
        </Box>
      </Popover>
    </>
  );
};

export default LightSourceCalculatorButton;
