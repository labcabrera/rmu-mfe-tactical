import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Typography } from '@mui/material';
import { formatBonus } from '@labcabrera-rmu/rmu-react-shared-lib';
import { DifficultyPreview } from './medical';

/** Where the difficulty comes from when the game master sets none, or why there is none. */
const MedicalDifficultyHint: FC<{ preview: DifficultyPreview; override: boolean; tables: boolean }> = ({
  preview,
  override,
  tables,
}) => {
  const { t } = useTranslation();
  if (override) {
    return (
      <Typography variant="caption" color="text.secondary">
        {t('treatment-difficulty-override')}
      </Typography>
    );
  }
  if (preview.kind !== 'value') {
    return (
      <Alert severity="warning">
        {t(preview.kind === 'type-required' ? 'err-injury-type-required-treatment' : 'err-treatment-not-applicable')}
      </Alert>
    );
  }
  if (!tables) {
    return (
      <Typography variant="caption" color="text.secondary">
        {t('treatment-difficulty-unavailable')}
      </Typography>
    );
  }
  const lines = [
    preview.source === 'table' ? t('treatment-difficulty-table') : null,
    preview.head ? t('treatment-head-harder') : null,
    preview.bleeding ? t('treatment-cauterize-extra', { value: formatBonus(preview.bleeding) }) : null,
  ].filter(Boolean);
  return (
    <Typography variant="caption" color="text.secondary" component="div">
      {`${t('difficulty')} ${formatBonus(preview.value)} · ${lines.join(' ')}`}
    </Typography>
  );
};

export default MedicalDifficultyHint;
