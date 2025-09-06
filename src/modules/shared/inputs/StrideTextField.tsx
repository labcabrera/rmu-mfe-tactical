import React from 'react';
import { useTranslation } from 'react-i18next';
import Avatar from '@mui/material/Avatar';
import InputAdornment from '@mui/material/InputAdornment';
import TextField from '@mui/material/TextField';

type StrideTextFieldProps = {
  value: string;
  onChange: React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>;
  i18nLabel?: string;
  disabled?: boolean;
  required?: boolean;
};

const StrideTextField: React.FC<StrideTextFieldProps> = ({ value, onChange, i18nLabel = 'stride', disabled = false, required = false }) => {
  const { t } = useTranslation();

  return (
    <TextField
      label={t(i18nLabel)}
      variant="outlined"
      fullWidth
      value={value}
      onChange={onChange}
      required={required}
      disabled={disabled}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <Avatar src="/static/images/generic/movement.png" sx={{ width: 25, height: 25 }} />
          </InputAdornment>
        ),
      }}
    />
  );
};

export default StrideTextField;
