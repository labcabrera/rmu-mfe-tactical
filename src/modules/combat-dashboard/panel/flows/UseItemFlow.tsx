import React, { FC, useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
import { Alert, Stack, Typography } from '@mui/material';
import { FlowStep, NumberPadField } from '@labcabrera-rmu/rmu-react-shared-lib';
import { CombatContext } from '../../../../CombatContext';
import { useCharacterHerbs } from '../../../actor-round/poison/combat-herbs';
import { resolveUseItem } from '../../../api/action';
import { Action } from '../../../api/action.dto';
import { ActorRound } from '../../../api/actor-rounds.dto';
import { isActionClosed } from '../../../services/ap-service';
import { useTacticalNotify } from '../../../services/notify-service';
import ActionFlow from '../ActionFlow';

/**
 * A `use_item` action (workspace spec 068, decision 7): the healing item, its target and, once it has its 2 AP, the
 * hits of the dose (the API rolls the range of the item without them). The result says the hits healed and the stun
 * rounds removed; the dose is spent in strategic when the outcome of the game is applied.
 */
const UseItemFlow: FC<{
  action: Action;
  actorRound: ActorRound;
  onDeleted: () => void;
  onNextPending?: () => void;
}> = ({ action, actorRound, onDeleted, onNextPending }) => {
  const { t } = useTranslation();
  const auth = useAuth();
  const notify = useTacticalNotify();
  const { actorRounds, updateAction, refreshActorRounds } = useContext(CombatContext)!;
  const useItem = action.useItem;
  const done = isActionClosed(action);
  const herbs = useCharacterHerbs(actorRound, !done && !!useItem);
  const [roll, setRoll] = useState<number | null>(useItem?.roll ?? null);
  const [busy, setBusy] = useState(false);
  const herb = herbs.find((each) => each.id === useItem?.itemId);
  const heal = herb?.catalog?.features?.herb?.effects?.heal;
  const itemName = useItem?.result?.itemName ?? (herb ? t(herb.name, herb.name) : t('item'));
  const target = actorRounds?.find((each) => each.actorId === useItem?.targetActorId);

  const resolve = () => {
    setBusy(true);
    resolveUseItem(action.id, roll, auth)
      .then((updated) => {
        updateAction(updated);
        refreshActorRounds();
        const result = updated.useItem?.result;
        notify.success(
          t('herb-use-combat-done', { hits: result?.healed ?? 0, rounds: result?.stunRoundsRemoved ?? 0 })
        );
      })
      .catch((err) => notify.error(err))
      .finally(() => setBusy(false));
  };

  const result = useItem?.result;
  const steps: FlowStep[] = [
    {
      id: 'declared',
      label: t('use-item'),
      summary: [itemName, target?.actorName].filter(Boolean).join(' → '),
    },
    {
      id: 'resolve',
      label: t('resolve'),
      content: (
        <Stack spacing={1.5}>
          <Typography variant="body2">
            {t('use-item-on', { item: itemName, target: target?.actorName ?? '' })}
          </Typography>
          <NumberPadField integer min={0} label={t('herb-use-roll')} value={roll} onChange={setRoll} disabled={busy} />
          <Typography variant="caption" color="text.secondary">
            {heal ? t('herb-use-roll-help', { min: heal.min, max: heal.max }) : t('use-item-roll-help')}
          </Typography>
        </Stack>
      ),
    },
    {
      id: 'result',
      label: t('result'),
      content: result ? (
        <Alert severity="success" variant="outlined">
          {`${result.itemName} · ${t('herb-use-combat-done', { hits: result.healed, rounds: result.stunRoundsRemoved })}`}
        </Alert>
      ) : (
        <Typography variant="body2" color="text.secondary">
          {t(`action-status-${action.status}-help`)}
        </Typography>
      ),
    },
  ];

  return (
    <ActionFlow
      action={action}
      steps={steps}
      activeIndex={done ? 2 : 1}
      primary={done ? undefined : { label: t('resolve'), disabled: busy || !useItem, onClick: resolve, resolves: true }}
      onDeleted={onDeleted}
      onNextPending={onNextPending}
    />
  );
};

export default UseItemFlow;
