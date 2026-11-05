import React, { FC, useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
import PsychologyIcon from '@mui/icons-material/Psychology';
import { Alert, Button, Chip, Stack, Tooltip, Typography } from '@mui/material';
import { ChipRow, ConcentrationFocus, RuleHint, SectionLabel } from '@labcabrera-rmu/rmu-react-shared-lib';
import { TFunction } from 'i18next';
import { CombatContext } from '../../CombatContext';
import { addActorRoundEffect, deleteActorRoundEffect } from '../api/actor-rounds';
import { ActorRound, ActorRoundEffect } from '../api/actor-rounds.dto';
import { isRoundEditable } from '../services/game-service';
import { useTacticalNotify } from '../services/notify-service';

/** What an actor concentrates on, as a short text: the kind and its note. */
export const focusLabel = (focus: ConcentrationFocus, t: TFunction): string =>
  [t(`concentration-kind-${focus.kind}`), focus.note].filter(Boolean).join(': ');

/**
 * Chip of an actor that concentrates (workspace spec 077, decision A2): each AP of another action counts half. Its
 * tooltip lists what it concentrates on. Nothing without a focus.
 */
export const ConcentrationChip: FC<{ actorRound: ActorRound }> = ({ actorRound }) => {
  const { t } = useTranslation();
  const foci = actorRound.concentration ?? [];
  if (foci.length === 0) return null;
  const title = (
    <Stack>
      <span>{t('concentration-help')}</span>
      {foci.map((focus, index) => (
        <span key={`${focus.kind}-${index}`}>{focusLabel(focus, t)}</span>
      ))}
    </Stack>
  );
  return (
    <Tooltip title={title}>
      <Chip
        size="small"
        variant="outlined"
        color={foci.length > 1 ? 'error' : 'info'}
        icon={<PsychologyIcon />}
        label={foci.length > 1 ? t('concentration-double') : t('concentration-double-cost')}
        sx={{ alignSelf: 'flex-start' }}
      />
    </Tooltip>
  );
};

/**
 * Concentration of an actor in the side panel (workspace spec 077, decision A2): what it concentrates on (a partial
 * dodge or block, a held action, a `concentrating` effect), a warning with two foci, and "Concentrate" to add a
 * manual focus (a `concentrating` effect the game master removes when it ends).
 */
const ActorRoundConcentration: FC<{ actorRound: ActorRound }> = ({ actorRound }) => {
  const { t } = useTranslation();
  const auth = useAuth();
  const notify = useTacticalNotify();
  const { game, displayRound, updateActorRound } = useContext(CombatContext)!;
  const [busy, setBusy] = useState(false);
  const foci = actorRound.concentration ?? [];
  const editable = isRoundEditable(game, displayRound);

  const run = (call: Promise<ActorRound>) => {
    setBusy(true);
    call
      .then(updateActorRound)
      .catch((err) => notify.error(err))
      .finally(() => setBusy(false));
  };
  const concentrate = () => {
    const effect = {
      id: '',
      status: 'concentrating',
      value: undefined,
      rounds: undefined,
      data: { kind: 'manual' },
    } as ActorRoundEffect;
    run(addActorRoundEffect(actorRound.id, effect, auth));
  };
  const remove = (effectId: string) => run(deleteActorRoundEffect(actorRound.id, effectId, auth));

  return (
    <Stack spacing={1}>
      <RuleHint title={t('concentration')} description={t('concentration-help')} reference="§8.1">
        <SectionLabel>{t('concentration')}</SectionLabel>
      </RuleHint>
      {foci.length === 0 ? (
        <Typography variant="caption" color="text.secondary">
          {t('concentration-none')}
        </Typography>
      ) : (
        <ChipRow>
          {foci.map((focus, index) => (
            <Chip
              key={`${focus.kind}-${focus.effectId ?? focus.actionId ?? index}`}
              size="small"
              icon={<PsychologyIcon />}
              label={focusLabel(focus, t)}
              // A focus of a `concentrating` effect ends by removing it; the others end with their dodge or action.
              onDelete={editable && focus.effectId ? () => remove(focus.effectId!) : undefined}
            />
          ))}
        </ChipRow>
      )}
      {foci.length > 1 && (
        <Alert severity="warning" variant="outlined">
          {t('concentration-double-warning')}
        </Alert>
      )}
      {editable && (
        <Button
          size="small"
          variant="outlined"
          startIcon={<PsychologyIcon />}
          onClick={concentrate}
          disabled={busy}
          sx={{ alignSelf: 'flex-start' }}
        >
          {t('concentration-manual-focus')}
        </Button>
      )}
    </Stack>
  );
};

export default ActorRoundConcentration;
