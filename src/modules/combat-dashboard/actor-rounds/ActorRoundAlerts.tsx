import React, { FC, useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Stack } from '@mui/material';
import { ActionStateMarker } from '@labcabrera-rmu/rmu-react-shared-lib';
import { CombatContext } from '../../../CombatContext';
import { ActorRound, ActorRoundAlert } from '../../api/actor-rounds.dto';
import { isGameFinished } from '../../services/game-service';
import ActorAlertDialog from '../actor-alert-dialogs/ActorAlertDialog';
import { reactionAttackLabel } from '../actor-alert-dialogs/CombatTalentAlertDialog';

const ActorRoundAlerts: FC<{
  actorRound: ActorRound;
}> = ({ actorRound }) => {
  const { t } = useTranslation();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedAlertId, setSelectedAlertId] = useState<string | null>(null);
  const combat = useContext(CombatContext);

  // Alerts open forms that change the actor: a finished game is read-only (spec 013).
  if (!actorRound || isGameFinished(combat?.game)) return null;

  // A resolved breakage alert keeps its result (spec 019): only the pending ones are shown. A reaction not taken
  // expires when its phase ends (workspace spec 076).
  const pending = (actorRound.alerts || []).filter(
    (alert) => alert.status !== 'resolved' && alert.status !== 'expired'
  );

  const handleAlertClick = (alertId: string) => {
    setSelectedAlertId(alertId);
    setDialogOpen(true);
  };

  const handleClose = () => {
    setDialogOpen(false);
    setSelectedAlertId(null);
  };

  const handleSave = (updated: ActorRoundAlert) => {
    // Replace the alert in the latest actor round: the dialog may have changed it meanwhile (a fear check)
    combat?.setActorRounds((rounds) =>
      rounds
        ? rounds.map((round) =>
            round.id === actorRound.id
              ? { ...round, alerts: (round.alerts || []).map((a) => (a.id === updated.id ? updated : a)) }
              : round
          )
        : rounds
    );
  };

  return (
    <>
      {pending.length > 0 && (
        <>
          <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 1 }}>
            {pending.map((alert) => (
              <Button
                key={alert.id}
                // Neutral, not red: the marker alone says it has to be resolved, as for the pending actions. A wound
                // that reopened and a limb that may be lost are red (workspace spec 068).
                variant="outlined"
                // A reaction (workspace spec 076) is an attack to take now: it stands out.
                color={
                  alert.type === 'wound-reopened' || alert.type === 'limb-loss'
                    ? 'error'
                    : alert.type === 'reaction-available'
                      ? 'warning'
                      : 'inherit'
                }
                size="small"
                onClick={() => handleAlertClick(alert.id)}
                startIcon={<ActionStateMarker state="pending" />}
                sx={{ mr: 0.5, mb: 0.5 }}
              >
                {alert.type === 'reaction-available' ? reactionAttackLabel(alert, t) : t(`alert-${alert.type}`)}
              </Button>
            ))}
          </Stack>
        </>
      )}

      {selectedAlertId && (
        <ActorAlertDialog
          actorRound={actorRound}
          alertId={selectedAlertId}
          open={dialogOpen}
          onClose={handleClose}
          onSave={handleSave}
        />
      )}
    </>
  );
};

export default ActorRoundAlerts;
