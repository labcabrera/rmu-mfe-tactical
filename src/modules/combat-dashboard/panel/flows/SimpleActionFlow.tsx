import React, { FC, useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
import { Alert, Stack, TextField, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';
import { combatActionInfo, FlowStep } from '@labcabrera-rmu/rmu-react-shared-lib';
import { CombatContext } from '../../../../CombatContext';
import { completeAction } from '../../../api/action';
import { Action, FullDefenseType } from '../../../api/action.dto';
import { ActorRound } from '../../../api/actor-rounds.dto';
import { isActionClosed } from '../../../services/ap-service';
import { useTacticalNotify } from '../../../services/notify-service';
import ActionFlow from '../ActionFlow';

/**
 * Actions without rolls (stand up, dodge, draw and load, other): what the action does, an optional note, and
 * "Complete". Standing up clears the actor's prone state. A dodge is the 4 AP full defence of the round (§9.6): the
 * game master chooses a full dodge or, with a shield, a full block, and the API sets the actor's defence mode.
 */
const SimpleActionFlow: FC<{
  action: Action;
  actorRound: ActorRound;
  onDeleted: () => void;
  onNextPending?: () => void;
}> = ({ action, actorRound, onDeleted, onNextPending }) => {
  const { t } = useTranslation();
  const auth = useAuth();
  const notify = useTacticalNotify();
  const { updateAction, refreshActorRounds } = useContext(CombatContext)!;
  const [note, setNote] = useState(action.description ?? '');
  const [busy, setBusy] = useState(false);
  const [defenseType, setDefenseType] = useState<FullDefenseType>('dodge');
  const isDodge = action.actionType === 'dodge';
  const hasShield = !!actorRound.defense?.shield;
  // Completed, or ended without being resolved (interrupted, expired, carried to the next round).
  const done = isActionClosed(action);
  const name = t(combatActionInfo(action.actionType).labelKey);

  const complete = () => {
    setBusy(true);
    completeAction(action.id, note.trim() || undefined, auth, isDodge ? defenseType : undefined)
      .then((updated) => {
        updateAction(updated);
        if (action.actionType === 'stand_up' || isDodge) refreshActorRounds();
        notify.success(t('action-completed', { action: name }));
      })
      .catch((err) => notify.error(err))
      .finally(() => setBusy(false));
  };

  const steps: FlowStep[] = [
    {
      id: 'declared',
      label: name,
      summary: [t('phase-n', { phase: action.phaseStart }), action.freeAction && t('free')].filter(Boolean).join(' · '),
    },
    {
      id: 'complete',
      label: t('complete'),
      summary: action.description ?? undefined,
      content: (
        <Stack spacing={1.5}>
          <Alert severity="info" variant="outlined">
            {t(`simple-action-help-${action.actionType}`)}
          </Alert>
          {isDodge && (
            <Stack spacing={0.5}>
              <Typography variant="caption" color="text.secondary">
                {t('full-defense')}
              </Typography>
              <ToggleButtonGroup
                size="small"
                exclusive
                value={defenseType}
                onChange={(_, value: FullDefenseType | null) => value && setDefenseType(value)}
                aria-label={t('full-defense')}
              >
                <ToggleButton value="dodge">{t('full-dodge')}</ToggleButton>
                <ToggleButton value="block" disabled={!hasShield}>
                  {t('full-block')}
                </ToggleButton>
              </ToggleButtonGroup>
            </Stack>
          )}
          <TextField
            label={t('note')}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            multiline
            minRows={2}
            slotProps={{ htmlInput: { maxLength: 500 } }}
          />
        </Stack>
      ),
    },
    {
      id: 'result',
      label: t('result'),
      content: (
        <Typography variant="body2">{action.description || t(`simple-action-done-${action.actionType}`)}</Typography>
      ),
    },
  ];

  return (
    <ActionFlow
      action={action}
      steps={steps}
      activeIndex={done ? 2 : 1}
      primary={done ? undefined : { label: t('complete'), disabled: busy, onClick: complete, resolves: true }}
      onDeleted={onDeleted}
      onNextPending={onNextPending}
    />
  );
};

export default SimpleActionFlow;
