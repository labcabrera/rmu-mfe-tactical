import React, { ChangeEventHandler, FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Avatar, InputAdornment, TextField } from '@mui/material';

type ArmorTextFieldProps = {
  value: string;
  onChange: ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>;
  i18nLabel?: string;
  disabled?: boolean;
  required?: boolean;
};

const ArmorTextField: FC<ArmorTextFieldProps> = ({ value, onChange, i18nLabel = 'armor-type', disabled = false, required = false }) => {
  const { t } = useTranslation();

  return (
    <TextField
      label={t(i18nLabel)}
      value={value}
      onChange={onChange}
      disabled={disabled}
      required={required}
      variant="outlined"
      fullWidth
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <Avatar src="/static/images/generic/armor.png" sx={{ width: 25, height: 25 }} />
          </InputAdornment>
        ),
      }}
    />
  );
};

export default ArmorTextField;
