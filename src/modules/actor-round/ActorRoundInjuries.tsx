import React, { FC, useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
import DeleteIcon from '@mui/icons-material/Delete';
import HealingIcon from '@mui/icons-material/Healing';
import LinkOffIcon from '@mui/icons-material/LinkOff';
import ScienceIcon from '@mui/icons-material/Science';
import SpaIcon from '@mui/icons-material/Spa';
import { Button, IconButton, Stack, Tooltip, Typography } from '@mui/material';
import {
  ConfirmDialog,
  Injury,
  InjuryList,
  SectionLabel,
  TemporaryModifier,
  TemporaryModifierList,
} from '@labcabrera-rmu/rmu-react-shared-lib';
import { CombatContext } from '../../CombatContext';
import {
  deleteActorRoundInjury,
  deleteActorRoundTemporaryModifier,
  loosenActorRoundTourniquet,
} from '../api/actor-rounds';
import { ActorRound } from '../api/actor-rounds.dto';
import { actorRoundBleeding } from '../services/actor-round-service';
import { isRoundEditable } from '../services/game-service';
import { useTacticalNotify } from '../services/notify-service';
import InjuryEditDialog from './medical/InjuryEditDialog';
import MedicalRollDialog, { MedicalTarget } from './medical/MedicalRollDialog';
import ActorAntidoteDialog from './poison/ActorAntidoteDialog';
import ActorUseHerbDialog from './poison/ActorUseHerbDialog';

/**
 * Injuries of the actor (spec 013): type, severity, location, bleeding, penalty and origin (attacker, round,
 * critical), with their care (workspace spec 068: treatment in progress, splint or cast limits, tourniquet, what
 * reopens them). In the current round of a game in progress, the game master can treat one at once (a Medicine roll
 * of a healer, without AP: in combat a healer declares a medical action), edit or remove it, and loosen a tourniquet
 * (0 AP). A running poisoning takes an antidote instead (spec 042). A character may use a herb it carries to heal hits
 * or remove stun (spec 062). The lasting morale and fear RR modifiers of the actor are listed below (decision 19).
 */
const ActorRoundInjuries: FC<{ actorRound: ActorRound }> = ({ actorRound }) => {
  const { t } = useTranslation();
  const auth = useAuth();
  const notify = useTacticalNotify();
  const { game, displayRound, updateActorRound } = useContext(CombatContext)!;
  const editable = isRoundEditable(game, displayRound);
  const [target, setTarget] = useState<MedicalTarget | null>(null);
  const [editing, setEditing] = useState<Injury | null>(null);
  const [deleting, setDeleting] = useState<Injury | null>(null);
  const [antidoteFor, setAntidoteFor] = useState<Injury | null>(null);
  const [herbOpen, setHerbOpen] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const modifiers = actorRound.temporaryModifiers ?? [];
  const injuries = actorRound.injuries ?? [];
  const bleeding = actorRoundBleeding(actorRound);

  const remove = () => {
    if (!deleting) return;
    const injury = deleting;
    setDeleting(null);
    deleteActorRoundInjury(actorRound.id, injury.id, auth)
      .then(updateActorRound)
      .catch((err) => notify.error(err));
  };

  const loosen = (injury: Injury) => {
    setBusyId(injury.id);
    loosenActorRoundTourniquet(actorRound.id, injury.id, auth)
      .then((updated) => {
        updateActorRound(updated);
        notify.success(t('tourniquet-loosened'));
      })
      .catch((err) => notify.error(err))
      .finally(() => setBusyId(null));
  };

  const removeModifier = (modifier: TemporaryModifier) => {
    setBusyId(modifier.id);
    deleteActorRoundTemporaryModifier(actorRound.id, modifier.id, auth)
      .then(updateActorRound)
      .catch((err) => notify.error(err))
      .finally(() => setBusyId(null));
  };

  return (
    <Stack spacing={1}>
      <SectionLabel
        actions={
          <>
            {bleeding > 0 && (
              <Typography variant="caption" color="error.main" sx={{ fontWeight: 600 }}>
                {t('injury-bleeding-per-round', { value: bleeding })}
              </Typography>
            )}
            {editable && actorRound.characterId && (
              <Button size="small" startIcon={<SpaIcon />} onClick={() => setHerbOpen(true)}>
                {t('herb-use')}
              </Button>
            )}
          </>
        }
      >
        {t('injuries')}
      </SectionLabel>
      <InjuryList
        injuries={injuries}
        dense={false}
        onEdit={editable ? setEditing : undefined}
        renderActions={
          editable
            ? (injury) => (
                <>
                  {injury.poison && !injury.poison.finished && (
                    <Button size="small" startIcon={<ScienceIcon />} onClick={() => setAntidoteFor(injury)}>
                      {t('antidote')}
                    </Button>
                  )}
                  {injury.tourniquet &&
                    injury.status !== 'healed' &&
                    injury.tourniquet.loosenedAt !== actorRound.round && (
                      <Button
                        size="small"
                        color="warning"
                        startIcon={<LinkOffIcon />}
                        disabled={busyId === injury.id}
                        onClick={() => loosen(injury)}
                      >
                        {t('loosen-tourniquet')}
                      </Button>
                    )}
                  {injury.status !== 'healed' && !(injury.poison && !injury.poison.finished) && (
                    <Tooltip title={t('gm-adjustment-help')}>
                      <Button
                        size="small"
                        startIcon={<HealingIcon />}
                        onClick={() => setTarget({ kind: 'treat', injury })}
                      >
                        {t('treat-gm')}
                      </Button>
                    </Tooltip>
                  )}
                  <Tooltip title={t('delete-injury')}>
                    <IconButton size="small" aria-label={t('delete-injury')} onClick={() => setDeleting(injury)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </>
              )
            : undefined
        }
      />
      {modifiers.length > 0 && (
        <Stack spacing={0.5} sx={{ pt: 1 }}>
          <SectionLabel>{t('temporary-modifiers')}</SectionLabel>
          <TemporaryModifierList
            modifiers={modifiers}
            onRemove={editable ? removeModifier : undefined}
            removingId={busyId}
          />
        </Stack>
      )}
      <MedicalRollDialog actorRound={actorRound} target={target} onClose={() => setTarget(null)} />
      <ActorAntidoteDialog actorRound={actorRound} injury={antidoteFor} onClose={() => setAntidoteFor(null)} />
      <ActorUseHerbDialog actorRound={actorRound} open={herbOpen} onClose={() => setHerbOpen(false)} />
      <InjuryEditDialog
        actorRound={actorRound}
        injury={editing}
        onClose={() => setEditing(null)}
        onSaved={updateActorRound}
      />
      <ConfirmDialog
        open={!!deleting}
        title={t('delete-injury')}
        message={t('delete-injury-confirmation')}
        confirmLabel={t('delete')}
        destructive
        onClose={() => setDeleting(null)}
        onConfirm={remove}
      />
    </Stack>
  );
};

export default ActorRoundInjuries;
