import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Badge, FormControl, FormLabel, ToggleButtonGroup, ToggleButton } from '@mui/material';

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
    if (readOnly) return 0;
    if (lightModifier === 'required') {
      return option.requiredBonus;
    } else if (lightModifier === 'helpful') {
      return option.helpfulBonus;
    }
    return 0;
  };

  return (
    <FormControl component="fieldset" variant="standard" sx={{ width: '100%' }}>
      <FormLabel id={'light'} component="legend" sx={{ mb: 1.5, typography: 'body1' }}>
        {t('light')}
      </FormLabel>
      <ToggleButtonGroup value={value} exclusive>
        {codes.map((option) => (
          <Badge badgeContent={getModifier(option)} color="error" key={option.id}>
            <ToggleButton
              value={option.id}
              onClick={() => handleClick(option.id)}
              disabled={readOnly}
              sx={{ minWidth: 160 }}
            >
              {t(option.id)}
            </ToggleButton>
          </Badge>
        ))}
      </ToggleButtonGroup>
    </FormControl>
  );
};

export default SelectLightType;
