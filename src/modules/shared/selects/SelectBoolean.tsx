import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Stack, Button, FormControl, FormLabel } from '@mui/material';

const SelectBoolean: FC<{
  id: string;
  name: string;
  value?: boolean | null;
  onChange: (value: boolean) => void;
  readOnly?: boolean;
}> = ({ id = 'select-boolean', name, value = null, onChange, readOnly = false }) => {
  const { t } = useTranslation();

  const options: { id: boolean; label: string }[] = [
    { id: true, label: t('yes') },
    { id: false, label: t('no') },
  ];

  const handleClick = (val: boolean) => {
    if (readOnly) return;
    onChange(val);
  };

  return (
    <FormControl component="fieldset" variant="standard" sx={{ width: '100%' }}>
      <FormLabel id={id} component="legend" sx={{ mb: 1, typography: 'body1' }}>
        {name}
      </FormLabel>
      <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
        {options.map((opt) => {
          const selected = value === opt.id;
          return (
            <Button
              key={String(opt.id)}
              size="large"
              variant={selected ? 'contained' : 'outlined'}
              color={selected ? 'primary' : 'inherit'}
              onClick={() => handleClick(opt.id)}
              disabled={readOnly}
            >
              {opt.label}
            </Button>
          );
        })}
      </Stack>
    </FormControl>
  );
};

export default SelectBoolean;
