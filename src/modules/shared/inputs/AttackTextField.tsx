import React from 'react';
import { useTranslation } from 'react-i18next';
import Avatar from '@mui/material/Avatar';
import InputAdornment from '@mui/material/InputAdornment';
import TextField, { TextFieldProps } from '@mui/material/TextField';

type AttackTextFieldProps = {
  i18Label?: string;
  value: string;
  onChange: React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>;
  disabled?: boolean;
  required?: boolean;
};

const AttackTextField: React.FC<AttackTextFieldProps> = ({
  i18Label = 'attack',
  value,
  onChange,
  disabled = false,
  required = false,
}) => {
  const { t } = useTranslation();

  return (
    <TextField
      label={t(i18Label)}
      disabled={disabled}
      variant="outlined"
      fullWidth
      value={value}
      onChange={onChange}
      required={required}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <Avatar src="/static/images/generic/sword.png" sx={{ width: 25, height: 25 }} />
          </InputAdornment>
        ),
      }}
    />
  );
};

export default AttackTextField;