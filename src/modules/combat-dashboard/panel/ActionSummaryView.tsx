import React, { FC, ReactNode, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import DeleteIcon from '@mui/icons-material/Delete';
import OpenInFullIcon from '@mui/icons-material/OpenInFull';
import { Box, Button, Chip, Divider, Stack, Typography } from '@mui/material';
import { ActionStateMarker, combatActionInfo, formatBonus } from '@labcabrera-rmu/rmu-react-shared-lib';
import { CombatContext } from '../../../CombatContext';
import { Action, SIMPLE_ACTION_TYPES } from '../../api/action.dto';
import { apProfileLabel, isActionClosed, useOpenRounds } from '../../services/ap-service';
import { isGameFinished } from '../../services/game-service';
import { actionApText, actionResult, actionState, actionStateTooltip } from '../actor-rounds/action-view';
import { AttackResults, ManeuverResult, MovementResult } from './flows/ActionResults';
import { attackLabel } from './flows/attack/attack-label';
import { useDeleteAction } from './useDeleteAction';

const Field: FC<{ label: string; children: ReactNode }> = ({ label, children }) => (
  <Stack direction="row" spacing={2} sx={{ justifyContent: 'space-between', alignItems: 'baseline' }}>
    <Typography variant="caption" color="text.secondary">
      {label}
    </Typography>
    <Typography variant="body2" component="div" sx={{ fontWeight: 600, textAlign: 'right' }}>
      {children}
    </Typography>
  </Stack>
);

/**
 * An action in the side panel, read-only: its state, phases, what it was declared with and its results so far.
 * Its resolution forms need room, so "Resolve" opens them in a dialog. An action declared by mistake can be
 * deleted from here.
 */
const ActionSummaryView: FC<{ action: Action; onResolve: () => void; onDeleted: () => void }> = ({
  action,
  onResolve,
  onDeleted,
}) => {
  const { t } = useTranslation();
  const { requestDelete, dialog } = useDeleteAction(action, onDeleted);
  const { actorRounds, game } = useContext(CombatContext)!;
  // A finished game is read-only (spec 013): its resolutions can be viewed, not changed.
  const finished = isGameFinished(game);
  const openRounds = useOpenRounds();
  const done = isActionClosed(action);
  const ap = actionApText(action, t);
  const forced = action.resolution?.mode === 'forced' ? action.resolution : undefined;
  const targetName = (id: string) => actorRounds?.find((ar) => ar.actorId === id)?.actorName ?? '—';
  const phases =
    action.phaseEnd && action.phaseEnd !== action.phaseStart
      ? `${action.phaseStart}–${action.phaseEnd}`
      : `${action.phaseStart}`;
  const attacks = (action.attacks ?? []).filter((a) => a.modifiers?.targetId);
  const movement = action.movement?.modifiers;
  const maneuver = action.maneuver?.modifiers;

  return (
    <Stack spacing={2} sx={{ p: 2 }}>
      <Stack spacing={1}>
        <Field label={t('status')}>
          <ActionStateMarker
            state={actionState(action)}
            text={actionResult(action, t) ?? t(`action-status-${action.status}`)}
            tooltip={actionStateTooltip(action, t, openRounds)}
          />
        </Field>
        {!done && action.readiness && <Field label={t('readiness')}>{t(`action-readiness-${action.readiness}`)}</Field>}
        <Field label={t('phase')}>{phases}</Field>
        {ap && (
          <Field label={t('action-points')}>
            {[
              ap,
              action.apProfile && `(${apProfileLabel(action.apProfile, t)})`,
              !done && action.readiness === 'ready' && action.readinessPenalty
                ? formatBonus(action.readinessPenalty)
                : null,
            ]
              .filter(Boolean)
              .join(' ')}
          </Field>
        )}
        {action.continuesActionId && (
          <Field label={t('continuation')}>{t('continues-previous-round', { count: action.carriedAp ?? 0 })}</Field>
        )}
        {forced && (
          <Field label={t('forced-resolution')}>
            {[t(`force-reason-${forced.reason ?? 'gm'}`), forced.note].filter(Boolean).join(' · ')}
          </Field>
        )}
        {action.freeAction && (
          <Box>
            <Chip size="small" label={t('free-action')} />
          </Box>
        )}
        {attacks.map((attack) => (
          <Field key={attack.attackName} label={attackLabel(attack.attackName, t)}>
            {`${targetName(attack.modifiers.targetId)} · ${t('bo')} ${formatBonus(attack.modifiers.bo ?? 0)}`}
          </Field>
        ))}
        {movement?.pace && <Field label={t('movement')}>{[t(movement.skillId), t(movement.pace)].join(' · ')}</Field>}
        {maneuver?.skillId && (
          <Field label={t('maneuver')}>
            {[t(maneuver.skillId), maneuver.difficulty && t(`difficulty-${maneuver.difficulty}`)]
              .filter(Boolean)
              .join(' · ')}
          </Field>
        )}
        {SIMPLE_ACTION_TYPES.includes(action.actionType) && action.description && (
          <Field label={t('note')}>{action.description}</Field>
        )}
      </Stack>

      {(!finished || done) && (
        <Stack direction="row" spacing={1}>
          <Button
            variant={done ? 'outlined' : 'contained'}
            startIcon={<OpenInFullIcon />}
            onClick={onResolve}
            sx={{ flex: 1 }}
          >
            {done
              ? t('view-resolution')
              : t('resolve-action', { action: t(combatActionInfo(action.actionType).labelKey) })}
          </Button>
          {!finished && (
            <Button color="error" variant="outlined" startIcon={<DeleteIcon />} onClick={requestDelete}>
              {t('delete')}
            </Button>
          )}
        </Stack>
      )}
      {dialog}

      {(action.attacks?.some((a) => a.calculated) || action.movement?.calculated || action.maneuver?.result) && (
        <>
          <Divider />
          <Typography variant="overline" color="text.secondary">
            {t('results')}
          </Typography>
          {action.attacks?.some((a) => a.calculated) && <AttackResults attacks={action.attacks ?? []} />}
          <MovementResult action={action} />
          <ManeuverResult action={action} />
        </>
      )}
    </Stack>
  );
};

export default ActionSummaryView;
