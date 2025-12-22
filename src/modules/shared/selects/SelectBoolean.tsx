import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Stack, Button, Typography } from '@mui/material';

const SelectBoolean: FC<{
  name?: string;
  value?: boolean | null;
  onChange: (value: boolean) => void;
  readOnly?: boolean;
}> = ({ name, value = null, onChange, readOnly = false }) => {
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
    <div>
      <Typography variant="caption" sx={{ display: 'block', mb: 0.5 }}>
        {t(name || '')}
      </Typography>
      <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
        {options.map((opt) => {
          const selected = value === opt.id;
          return (
            <Button
              key={String(opt.id)}
              size="small"
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
    </div>
  );
};

export default SelectBoolean;
