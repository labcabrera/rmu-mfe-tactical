import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import ScienceIcon from '@mui/icons-material/Science';
import { Chip, Stack } from '@mui/material';
import { AttackSizeChip, DataTable, ItemConditionChip, SectionLabel } from '@labcabrera-rmu/rmu-react-shared-lib';
import { ActorRound, ActorRoundAttack } from '../api/actor-rounds.dto';

const ActorRoundAttacks: FC<{ actorRound: ActorRound }> = ({ actorRound }) => {
  const { t } = useTranslation();
  // Poison on the weapon of the attack (spec 042): the next hit spends it.
  const coatingOf = (attack: ActorRoundAttack) =>
    attack.itemId ? actorRound.items?.find((item) => item.itemId === attack.itemId)?.coating : undefined;
  const attacks = actorRound.attacks ?? [];

  const formatRanges = (ranges: ActorRoundAttack['ranges']): string => {
    if (!ranges || ranges.length === 0) return '-';
    return ranges.map((r) => `${r.from}-${r.to} (${r.bonus >= 0 ? `+${r.bonus}` : r.bonus})`).join(', ');
  };

  return (
    <Stack spacing={1}>
      <SectionLabel>{t('attacks')}</SectionLabel>
      <DataTable
        rows={attacks.map((attack, index) => ({ attack, index }))}
        getKey={({ attack, index }) => `${attack.attackName}-${index}`}
        emptyTitle={t('no-attacks')}
        columns={[
          {
            key: 'name',
            header: t('attack-name'),
            render: ({ attack: a }) => (
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                <span>{t(a.attackName)}</span>
                {coatingOf(a) && (
                  <Chip
                    size="small"
                    color="secondary"
                    variant="outlined"
                    icon={<ScienceIcon />}
                    label={t('item-coated', { name: t(coatingOf(a)!.name, coatingOf(a)!.name) })}
                  />
                )}
                {(a.broken || (a.breakagePenalty ?? 0) < 0) && (
                  <ItemConditionChip condition={{ breakagePenalty: a.breakagePenalty ?? 0, broken: !!a.broken }} />
                )}
              </Stack>
            ),
          },
          {
            key: 'type',
            header: t('type'),
            render: ({ attack: a }) =>
              [
                t(a.type),
                a.twoHanded && t('two-handed-weapon'),
                a.weaponCategory && a.weaponCategory !== 'standard' && t(`weapon-category-${a.weaponCategory}`),
              ]
                .filter(Boolean)
                .join(' · '),
          },
          {
            key: 'table',
            header: t('attack-table'),
            // The size of the attack, when not Medium, with its effect on damage and critical (spec 075)
            render: ({ attack }) => (
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                <span>{t(attack.attackTable)}</span>
                <AttackSizeChip steps={attack.attackSize ?? 0} />
              </Stack>
            ),
          },
          { key: 'base-ob', header: t('base-ob'), align: 'right', render: ({ attack }) => attack.baseBo },
          { key: 'current-ob', header: t('current-ob'), align: 'right', render: ({ attack }) => attack.currentBo },
          { key: 'fumble', header: t('fumble'), align: 'right', render: ({ attack }) => attack.fumble },
          { key: 'ranges', header: t('ranges'), render: ({ attack }) => formatRanges(attack.ranges) },
        ]}
      />
    </Stack>
  );
};

export default ActorRoundAttacks;
