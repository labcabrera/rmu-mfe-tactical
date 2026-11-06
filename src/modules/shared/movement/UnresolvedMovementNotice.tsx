import React, { FC, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert } from '@mui/material';
import { CombatContext } from '../../../CombatContext';
import { Action } from '../../api/action.dto';
import { phaseNumber } from '../../combat-dashboard/actor-rounds/round-grid';
import { unresolvedFreeMovement } from '../../services/movement-service';

/** Workspace spec 081, decision 1: an informative note, it does not block the action. */
const UnresolvedMovementNotice: FC<{ action: Action }> = ({ action }) => {
  const { t } = useTranslation();
  const { game, roundActions } = useContext(CombatContext)!;
  if (!unresolvedFreeMovement(roundActions ?? [], action, game ? phaseNumber(game.phase) : 0)) return null;
  return (
    <Alert severity="info" variant="outlined">
      {t('free-movement-unresolved-notice')}
    </Alert>
  );
};

export default UnresolvedMovementNotice;
