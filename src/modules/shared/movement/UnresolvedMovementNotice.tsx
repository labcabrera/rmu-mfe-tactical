import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert } from '@mui/material';
import { Action } from '../../api/action.dto';
import { useCombatGame, useCombatRound } from '../../combat/combat-context';
import { unresolvedFreeMovement } from '../../services/movement-service';
import { phaseNumber } from '../../services/phase-service';

/** Workspace spec 081, decision 1: an informative note, it does not block the action. */
const UnresolvedMovementNotice: FC<{ action: Action }> = ({ action }) => {
  const { t } = useTranslation();
  const { game } = useCombatGame();
  const { roundActions } = useCombatRound();
  if (!unresolvedFreeMovement(roundActions ?? [], action, game ? phaseNumber(game.phase) : 0)) return null;
  return (
    <Alert severity="info" variant="outlined">
      {t('free-movement-unresolved-notice')}
    </Alert>
  );
};

export default UnresolvedMovementNotice;
