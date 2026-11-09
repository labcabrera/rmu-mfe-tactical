import { FC, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import EditIcon from '@mui/icons-material/Edit';
import { IconButton, InputAdornment, TextField } from '@mui/material';

/**
 * An environment condition edited in its own dialog (the light source, the extreme temperature), shown as a read-only
 * field with the same size and width as the environment selects: its value, an icon and an edit button. Clicking the
 * field or the button opens the dialog.
 */
const EnvironmentDialogField: FC<{
  label: string;
  value: string;
  icon: ReactNode;
  /** The condition is set: the value is highlighted. */
  active?: boolean;
  color?: 'error' | 'info';
  /** Without it the field only shows the value (a viewer that cannot change the condition). */
  onOpen?: () => void;
}> = ({ label, value, icon, active = false, color = 'info', onOpen }) => {
  const { t } = useTranslation();
  return (
    <TextField
      label={label}
      value={value}
      fullWidth
      onClick={onOpen}
      slotProps={{
        input: {
          readOnly: true,
          startAdornment: <InputAdornment position="start">{icon}</InputAdornment>,
          endAdornment: onOpen && (
            <InputAdornment position="end">
              <IconButton
                edge="end"
                aria-label={`${t('edit')}: ${label}`}
                onClick={(event) => {
                  event.stopPropagation();
                  onOpen?.();
                }}
              >
                <EditIcon fontSize="small" />
              </IconButton>
            </InputAdornment>
          ),
          sx: {
            ...(onOpen && { cursor: 'pointer' }),
            '& input': { textOverflow: 'ellipsis', ...(onOpen && { cursor: 'pointer' }) },
            ...(active && { color: `${color}.main`, '& .MuiInputAdornment-root': { color: `${color}.main` } }),
          },
        },
        inputLabel: { shrink: true },
      }}
    />
  );
};

export default EnvironmentDialogField;
