import React, { FC, useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
import { Alert, Stack, TextField, Typography } from '@mui/material';
import { combatActionInfo, FlowStep, useNotify } from '@labcabrera-rmu/rmu-react-shared-lib';
import { CombatContext } from '../../../../CombatContext';
import { completeAction } from '../../../api/action';
import { Action } from '../../../api/action.dto';
import { ActorRound } from '../../../api/actor-rounds.dto';
import ActionFlow from '../ActionFlow';

/**
 * Actions without rolls (stand up, dodge, draw and load, other): what the action does, an optional note, and
 * "Complete". Standing up clears the actor's prone state; the other effects are set by the game master (a
 * dodge, for example, is a modifier of the attacks against the actor).
 */
const SimpleActionFlow: FC<{
  action: Action;
  actorRound: ActorRound;
  onDeleted: () => void;
  onNextPending?: () => void;
}> = ({ action, onDeleted, onNextPending }) => {
  const { t } = useTranslation();
  const auth = useAuth();
  const notify = useNotify();
  const { updateAction, refreshActorRounds } = useContext(CombatContext)!;
  const [note, setNote] = useState(action.description ?? '');
  const [busy, setBusy] = useState(false);
  const done = action.status === 'completed';
  const name = t(combatActionInfo(action.actionType).labelKey);

  const complete = () => {
    setBusy(true);
    completeAction(action.id, note.trim() || undefined, auth)
      .then((updated) => {
        updateAction(updated);
        if (action.actionType === 'stand_up') refreshActorRounds();
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
      primary={done ? undefined : { label: t('complete'), disabled: busy, onClick: complete }}
      onDeleted={onDeleted}
      onNextPending={onNextPending}
    />
  );
};

export default SimpleActionFlow;
