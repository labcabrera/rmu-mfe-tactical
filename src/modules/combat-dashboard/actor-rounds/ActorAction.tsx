import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { alpha, ButtonBase, Stack, Tooltip, Typography } from '@mui/material';
import { ActionStateMarker, combatActionInfo, combatColors } from '@labcabrera-rmu/rmu-react-shared-lib';
import { CombatContext } from '../../../CombatContext';
import type { Action } from '../../api/action.dto';
import { apProfileLabel, isActionClosed, useOpenRounds } from '../../services/ap-service';
import { actionApText, actionLabel, actionResult, actionState, actionStateTooltip } from './action-view';

/**
 * An action on the phase timeline: a bar in the color of its type, with its icon, a short label, its action points
 * over its maximum ("2/4 AP") with the penalty of resolving it now, and its state (from its readiness) with the result
 * once resolved. The tooltip of the AP gives the profile of the action ("Melee attack: 2-4 AP").
 */
export default function ActorAction({ action, onClick }: { action: Action; onClick: () => void }) {
  const { t } = useTranslation();
  const { actorRounds } = useContext(CombatContext)!;
  const openRounds = useOpenRounds();
  const info = combatActionInfo(action.actionType);
  const state = actionState(action);
  const label = actionLabel(action, t, actorRounds);
  const done = isActionClosed(action);
  const ap = done ? undefined : actionApText(action, t);
  const penalty = !done && action.readiness === 'ready' && action.readinessPenalty ? action.readinessPenalty : null;
  const profile = action.apProfile
    ? t('ap-profile-of', { action: t(info.labelKey), profile: apProfileLabel(action.apProfile, t) })
    : label;

  return (
    <ButtonBase
      onClick={onClick}
      aria-label={label}
      sx={(theme) => {
        const color = combatColors(theme)[info.category];
        return {
          width: '100%',
          height: '100%',
          justifyContent: 'flex-start',
          gap: 1,
          px: 1,
          borderRadius: `${theme.radius.sm}px`,
          borderLeft: `4px solid ${color}`,
          bgcolor: alpha(color, done ? 0.06 : 0.14),
          color: done ? 'text.secondary' : 'text.primary',
          transition: theme.transitions.create(['background-color', 'transform']),
          '&:hover': { bgcolor: alpha(color, 0.22) },
          '& .MuiSvgIcon-root': { fontSize: 18, color },
        };
      }}
    >
      {info.icon()}
      <Typography variant="caption" sx={{ fontWeight: 600, flex: 1, minWidth: 0, textAlign: 'left' }} noWrap>
        {label}
      </Typography>
      {ap && (
        <Tooltip title={profile}>
          <Typography variant="caption" color="text.secondary" sx={{ flexShrink: 0, fontWeight: 600 }} noWrap>
            {penalty ? `${ap} · ${penalty}` : ap}
          </Typography>
        </Tooltip>
      )}
      <Stack sx={{ flexShrink: 0 }}>
        <ActionStateMarker
          state={state}
          text={actionResult(action, t)}
          tooltip={actionStateTooltip(action, t, openRounds)}
        />
      </Stack>
    </ButtonBase>
  );
}
