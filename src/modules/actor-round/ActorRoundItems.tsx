import { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import BuildIcon from '@mui/icons-material/Build';
import ScienceIcon from '@mui/icons-material/Science';
import { Chip, IconButton, Stack, Tooltip } from '@mui/material';
import { DataTable, ItemConditionChip, SectionLabel } from '@labcabrera-rmu/rmu-react-shared-lib';
import { ActorRound, ActorRoundItem } from '../api/actor-rounds.dto';
import { useCombatGame, useCombatRound } from '../combat/combat-context';
import { isRoundEditable } from '../services/game-service';
import BreakageCheckDialog from './alerts/BreakageCheckDialog';

/**
 * Items of the actor (spec 019): its equipped and carried items with their strength and breakage. In the current
 * round of a game in progress, any of them can make a breakage check by hand (a maneuver with 33 or 77, or what the
 * game master asks for).
 */
const ActorRoundItems: FC<{ actorRound: ActorRound }> = ({ actorRound }) => {
  const { t } = useTranslation();
  const { game } = useCombatGame();
  const { displayRound } = useCombatRound();
  const editable = isRoundEditable(game, displayRound);
  const [checking, setChecking] = useState<ActorRoundItem | null>(null);
  const items = actorRound.items ?? [];

  return (
    <Stack spacing={1}>
      <SectionLabel>{t('actor-items')}</SectionLabel>
      <DataTable
        rows={items}
        getKey={(item) => item.itemId}
        emptyTitle={t('actor-items-empty')}
        columns={[
          {
            key: 'name',
            header: t('name'),
            render: (item) => (
              <>
                {item.name}
                {item.coating && (
                  <Chip
                    size="small"
                    color="secondary"
                    variant="outlined"
                    icon={<ScienceIcon />}
                    label={t('item-coated', { name: t(item.coating.name, item.coating.name) })}
                    sx={{ ml: 1 }}
                  />
                )}
              </>
            ),
          },
          {
            key: 'type',
            header: t('type'),
            render: (item) => [t(`item-kind-${item.kind}`), item.slot && t(item.slot)].filter(Boolean).join(' · '),
          },
          { key: 'strength', header: t('breakage-strength'), align: 'right', render: (item) => item.strength ?? '-' },
          {
            key: 'breakage',
            header: t('breakage'),
            render: (item) => <ItemConditionChip condition={item.condition} showIntact />,
          },
          ...(editable
            ? [
                {
                  key: 'actions',
                  header: '',
                  align: 'right' as const,
                  render: (item: ActorRoundItem) => (
                    <Tooltip title={t('breakage-check-manual')}>
                      <IconButton
                        size="small"
                        aria-label={t('breakage-check-manual')}
                        onClick={() => setChecking(item)}
                      >
                        <BuildIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  ),
                },
              ]
            : []),
        ]}
      />
      {checking && (
        <BreakageCheckDialog actorRound={actorRound} itemId={checking.itemId} open onClose={() => setChecking(null)} />
      )}
    </Stack>
  );
};

export default ActorRoundItems;
