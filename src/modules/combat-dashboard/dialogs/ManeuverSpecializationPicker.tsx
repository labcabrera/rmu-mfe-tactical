import { FC, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Stack, Typography } from '@mui/material';
import { normalizeText, SearchField } from '@labcabrera-rmu/rmu-react-shared-lib';
import OptionChips from '../flows/maneuver/OptionChips';
import { SpecializationCatalog } from './useSpecializationCatalog';

const OTHER = '__other__';
/** Catalogs longer than this get their own filter field. */
const FILTER_FROM = 10;

/**
 * The specialization of the chosen skill (spec 093): the ones the actor has developed, with their bonus, and the rest
 * of the catalog behind "Other…" (directly when the actor has none).
 */
const ManeuverSpecializationPicker: FC<{
  skillName: string;
  developed: { specialization: string; bonus: number }[];
  catalog: SpecializationCatalog;
  /** What the actor rolls with a specialization it does not have. */
  undevelopedBonus: number;
  value: string | null;
  onChange: (specialization: string | null) => void;
}> = ({ skillName, developed, catalog, undevelopedBonus, value, onChange }) => {
  const { t } = useTranslation();
  const [opened, setOpened] = useState(false);
  const [query, setQuery] = useState('');
  const label = (key: string) => t(key, { defaultValue: catalog.names[key] ?? key });
  const owned = useMemo(() => new Set(developed.map((each) => each.specialization)), [developed]);
  const rest = catalog.keys.filter((key) => !owned.has(key));
  const showCatalog = opened || developed.length === 0;
  const term = normalizeText(query.trim());
  const shown = showCatalog
    ? rest.filter((key) => !term || key === value || normalizeText(label(key)).includes(term))
    : // A choice of the catalog stays in view when it is closed.
      rest.filter((key) => key === value);
  const options = [
    ...developed.map((each) => ({ key: each.specialization, value: each.bonus })),
    ...shown.map((key) => ({ key, value: undevelopedBonus })),
    ...(developed.length > 0 && rest.length > 0 ? [{ key: OTHER, value: null }] : []),
  ];

  if (options.length === 0) return null;
  return (
    <Stack spacing={1.5}>
      <Box sx={{ maxHeight: { md: 180 }, overflowY: 'auto' }}>
        <OptionChips
          label={t('specialization-of', { skill: skillName })}
          options={options}
          value={value ?? ''}
          optionLabel={(option) => (option.key === OTHER ? t('specialization-other') : label(option.key))}
          onChange={(key) => {
            if (key === OTHER) setOpened(!opened);
            else onChange(key === value ? null : key);
          }}
        />
      </Box>
      {showCatalog && rest.length > FILTER_FROM && (
        <Box sx={{ maxWidth: 320 }}>
          <SearchField size="small" label={t('search')} value={query} onChange={setQuery} delay={0} />
        </Box>
      )}
      {!value && (
        <Typography variant="caption" color="text.secondary">
          {t('specialization-choose')}
        </Typography>
      )}
    </Stack>
  );
};

export default ManeuverSpecializationPicker;
