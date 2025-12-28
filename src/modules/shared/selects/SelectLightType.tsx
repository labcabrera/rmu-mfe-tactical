import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Stack, Button, Typography, Badge } from '@mui/material';

type LightOption = {
  id: string;
  requiredBonus: number;
  helpfulBonus: number;
};

const SelectLightType: FC<{
  lightModifier: string;
  value: string;
  onChange: (value: string) => void;
  readOnly?: boolean;
}> = ({ lightModifier = 'none', value, onChange, readOnly = false }) => {
  const { t } = useTranslation();

  const codes: LightOption[] = [
    { id: 'no_shadows', requiredBonus: 0, helpfulBonus: 0 },
    { id: 'light_shadows', requiredBonus: -10, helpfulBonus: -5 },
    { id: 'medium_shadows', requiredBonus: -20, helpfulBonus: -10 },
    { id: 'heavy_shadows', requiredBonus: -30, helpfulBonus: -15 },
    { id: 'dark', requiredBonus: -50, helpfulBonus: -25 },
    { id: 'extremely_dark', requiredBonus: -70, helpfulBonus: -35 },
    { id: 'pitch_black', requiredBonus: -100, helpfulBonus: -50 },
  ];

  const handleClick = (option: string) => {
    if (readOnly) return;
    onChange(option);
  };

  const getModifier = (option: LightOption) => {
    if (lightModifier === 'required') {
      return option.requiredBonus;
    } else if (lightModifier === 'helpful') {
      return option.helpfulBonus;
    }
    return 0;
  };

  return (
    <div>
      <Typography variant="caption" sx={{ display: 'block', mb: 0.5 }}>
        {t('light')}
      </Typography>
      <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
        {codes.map((option) => {
          const selected = option.id === value;
          return (
            <Badge badgeContent={getModifier(option)} color="error" key={option.id}>
              <Button
                key={option.id}
                size="small"
                variant={selected ? 'contained' : 'outlined'}
                color={selected ? 'primary' : 'inherit'}
                onClick={() => handleClick(option.id)}
                disabled={readOnly}
              >
                {t(option.id)}
              </Button>
            </Badge>
          );
        })}
      </Stack>
    </div>
  );
};

export default SelectLightType;
