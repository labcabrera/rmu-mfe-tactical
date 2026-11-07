import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Stack } from '@mui/material';
import { OptionGroup } from '@labcabrera-rmu/rmu-react-shared-lib';
import { ModifierOption } from '../attack-modifier-fields';

const MATERIALS = ['soft', 'hard'] as const;
const AMOUNTS = ['none', 'partial', 'half', 'full'] as const;

/**
 * Cover of the target as two choices (workspace spec 085, 3.1): how much of it is covered (none, partial, half,
 * full) and what covers it (soft or hard). Each option shows the value it gives with the other choice; the API keeps
 * one key, `none` or `<material>_<amount>`.
 */
const CoverPicker: FC<{ options: ModifierOption[]; value: string; onChange: (key: string) => void }> = ({
  options,
  value,
  onChange,
}) => {
  const { t } = useTranslation();
  const [materialPart, amountPart] = value === 'none' ? ['soft', 'none'] : value.split('_');
  const material = MATERIALS.includes(materialPart as (typeof MATERIALS)[number]) ? materialPart : 'soft';
  const amount = amountPart ?? 'none';
  const keyOf = (m: string, a: string) => (a === 'none' ? 'none' : `${m}_${a}`);
  const valueOf = (key: string) => options.find((o) => o.key === key)?.value ?? null;

  return (
    <Stack spacing={1} role="group" aria-label={t('cover')}>
      <OptionGroup
        label={t('cover')}
        options={AMOUNTS.map((a) => ({
          key: a,
          label: a === 'none' ? t('none') : t(`cover-${a}`),
          value: valueOf(keyOf(material, a)),
        }))}
        value={amount}
        onChange={(a) => onChange(keyOf(material, a))}
      />
      <OptionGroup
        size="small"
        label={t('cover-material')}
        options={MATERIALS.map((m) => ({
          key: m,
          label: t(`cover-${m}`),
          // With no cover the material gives nothing: no values, and it cannot be chosen.
          value: amount === 'none' ? null : valueOf(keyOf(m, amount)),
          disabled: amount === 'none',
        }))}
        value={material}
        onChange={(m) => onChange(keyOf(m, amount))}
      />
    </Stack>
  );
};

export default CoverPicker;
