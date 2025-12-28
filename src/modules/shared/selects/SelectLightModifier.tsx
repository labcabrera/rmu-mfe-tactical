import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Stack, Button, Typography } from '@mui/material';

const SelectLightModifier: FC<{
  value: string;
  onChange: (value: string) => void;
  readOnly?: boolean;
}> = ({ value, onChange, readOnly = false }) => {
  const { t } = useTranslation();

  const codes: string[] = ['none', 'helpful', 'required'];

  const handleClick = (option: string) => {
    if (readOnly) return;
    onChange(option);
  };

  return (
    <div>
      <Typography variant="caption" sx={{ display: 'block', mb: 0.5 }}>
        {t('light-modifier')}
      </Typography>
      <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
        {codes.map((option) => {
          const selected = option === value;
          return (
            <Button
              key={option}
              size="small"
              variant={selected ? 'contained' : 'outlined'}
              color={selected ? 'primary' : 'inherit'}
              onClick={() => handleClick(option)}
              disabled={readOnly}
            >
              {t(option)}
            </Button>
          );
        })}
      </Stack>
    </div>
  );
};

export default SelectLightModifier;
