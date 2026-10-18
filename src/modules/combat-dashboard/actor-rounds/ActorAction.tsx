import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { alpha, ButtonBase, Stack, Typography } from '@mui/material';
import { ActionStateMarker, combatActionInfo, combatColors } from '@labcabrera-rmu/rmu-react-shared-lib';
import { CombatContext } from '../../../CombatContext';
import type { Action } from '../../api/action.dto';
import { actionLabel, actionResult, actionState } from './action-view';

/**
 * An action on the phase timeline: a bar in the color of its type, with its icon, a short label, and its
 * state (needs input, waiting, resolved or failed) with the result once resolved.
 */
export default function ActorAction({ action, onClick }: { action: Action; onClick: () => void }) {
  const { t } = useTranslation();
  const { actorRounds } = useContext(CombatContext)!;
  const info = combatActionInfo(action.actionType);
  const state = actionState(action);
  const label = actionLabel(action, t, actorRounds);
  const done = state === 'resolved' || state === 'failed';

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
      <Stack sx={{ flexShrink: 0 }}>
        <ActionStateMarker state={state} text={actionResult(action, t)} />
      </Stack>
    </ButtonBase>
  );
}
