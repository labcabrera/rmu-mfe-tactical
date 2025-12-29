import React, { ChangeEvent, FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Stack, Button, FormControl, FormLabel } from '@mui/material';

type SelectCalledShotProps = {
  value: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  name?: string;
  label?: string;
  readOnly?: boolean;
};

const SelectCalledShot: FC<SelectCalledShotProps> = ({
  value,
  onChange,
  name = 'calledShot',
  label = 'Called Shot',
  readOnly = false,
}) => {
  const { t } = useTranslation();
  const options = ['none', 'head', 'body', 'arms', 'legs'];

  const handleClick = (option: string) => {
    if (readOnly) return;
    const evt = { target: { name, value: option } } as unknown as ChangeEvent<HTMLInputElement>;
    onChange(evt);
  };

  const labelId = `select-called-shot-${name}-label`;

  return (
    <FormControl component="fieldset" variant="standard" sx={{ width: '100%' }}>
      <FormLabel id={labelId} component="legend" sx={{ mb: 1, typography: 'body1' }}>
        {t(label)}
      </FormLabel>
      <Stack role="group" aria-labelledby={labelId} direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
        {options.map((option) => {
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
    </FormControl>
  );
};

export default SelectCalledShot;
