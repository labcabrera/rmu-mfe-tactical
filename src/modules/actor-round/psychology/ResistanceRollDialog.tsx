import React, { FC, useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
import { Alert, Button, Stack, Typography } from '@mui/material';
import {
  formatBonus,
  NumericInput,
  OPEN_D100,
  RmuDialog,
  RollBreakdown,
  RollField,
} from '@labcabrera-rmu/rmu-react-shared-lib';
import { CombatContext } from '../../../CombatContext';
import { addActorRoundEffect } from '../../api/actor-rounds';
import { ActorRound } from '../../api/actor-rounds.dto';
import { rollActorResistance } from '../../api/psychology';
import { FEAR_EFFECTS, ResistanceRollResult } from '../../api/psychology.dto';
import { useTacticalNotify } from '../../services/notify-service';
import FrightLevelInput from './FrightLevelInput';

/** RR bonus of the actor for a kind of resistance, copied from its character; undefined for NPCs. */
export const resistanceBonus = (actorRound: ActorRound, resistance: string): number | undefined =>
  actorRound.resistances?.find((each) => each.resistance === resistance)?.totalBonus;

/** Fear RR bonus of the actor from its sheet; undefined for NPCs. */
export const fearBonus = (actorRound: ActorRound): number | undefined => resistanceBonus(actorRound, 'fear');

/**
 * Fear RR of one actor (workspace spec 022, decision 8): the fright level as the attack level, the open-ended roll,
 * the RR bonus (from the sheet, or typed for an NPC) and a modifier of the game master. The API resolves it with
 * core's tables and leaves no effect; on a failure the game master may put the fear effect it gives. A group takes
 * its fear check from the round header instead.
 */
const ResistanceRollDialog: FC<{ actorRound: ActorRound; open: boolean; onClose: () => void }> = ({
  actorRound,
  open,
  onClose,
}) => {
  const { t } = useTranslation();
  const auth = useAuth();
  const notify = useTacticalNotify();
  const { updateActorRound } = useContext(CombatContext)!;
  const sheetBonus = fearBonus(actorRound);
  // A fear effect already there is changed by the group checks, which keep the worst one.
  const afraid = actorRound.effects?.some((effect) => (FEAR_EFFECTS as readonly string[]).includes(effect.status));
  const [attackLevel, setAttackLevel] = useState<number | null>(null);
  const [roll, setRoll] = useState<number | null>(null);
  const [bonus, setBonus] = useState<number | null>(null);
  const [modifier, setModifier] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<ResistanceRollResult | null>(null);

  useEffect(() => {
    if (!open) return;
    setAttackLevel(null);
    setRoll(null);
    setBonus(null);
    setModifier(null);
    setResult(null);
  }, [open]);

  const valid = attackLevel !== null && roll !== null && (sheetBonus !== undefined || bonus !== null);

  const submit = () => {
    if (attackLevel === null || roll === null) return;
    setBusy(true);
    rollActorResistance(
      actorRound.id,
      {
        kind: 'fear',
        attackLevel,
        roll,
        ...(modifier ? { modifiers: [{ key: 'custom-bonus', value: modifier }] } : {}),
        ...(bonus !== null ? { bonus } : {}),
      },
      auth
    )
      .then(setResult)
      .catch((err) => notify.error(err))
      .finally(() => setBusy(false));
  };

  const applyEffect = () => {
    if (!result?.fearState) return;
    const effect = { id: '', status: `fear-${result.fearState}`, value: result.failure, rounds: undefined };
    setBusy(true);
    addActorRoundEffect(actorRound.id, effect, auth)
      .then((updated) => {
        updateActorRound(updated);
        onClose();
      })
      .catch((err) => notify.error(err))
      .finally(() => setBusy(false));
  };

  return (
    <RmuDialog
      open={open}
      onClose={onClose}
      title={t('fear-rr')}
      subtitle={actorRound.actorName}
      maxWidth="sm"
      buttons={
        result ? (
          <>
            {result.fearState && !afraid && (
              <Button onClick={applyEffect} disabled={busy} color="warning">
                {t('apply-fear-effect', { effect: t(`fear-${result.fearState}`) })}
              </Button>
            )}
            <Button variant="contained" onClick={onClose}>
              {t('close')}
            </Button>
          </>
        ) : (
          <>
            <Button onClick={onClose} disabled={busy}>
              {t('cancel')}
            </Button>
            <Button variant="contained" onClick={submit} disabled={!valid || busy}>
              {t('roll')}
            </Button>
          </>
        )
      }
    >
      {result ? (
        <Stack spacing={1.5}>
          <Alert severity={result.resisted ? 'success' : 'warning'}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              {result.resisted
                ? t('rr-resisted', { total: result.total, required: result.required })
                : t('rr-failed', { total: result.total, required: result.required, failure: result.failure })}
            </Typography>
            {result.fearState && (
              <Typography variant="body2">
                {`${t(`fear-${result.fearState}`)} · ${t(`fear-severity-${result.severity}`)}`}
                {result.rallyModifier ? ` · ${t('rally-modifier', { value: formatBonus(result.rallyModifier) })}` : ''}
              </Typography>
            )}
          </Alert>
          <RollBreakdown context="fear-rr" modifiers={result.breakdown} total={result.total} />
          {result.fearState && (
            <Typography variant="caption" color="text.secondary">
              {t('fear-rr-effect-help')}
            </Typography>
          )}
        </Stack>
      ) : (
        <Stack spacing={2}>
          <FrightLevelInput value={attackLevel} onChange={setAttackLevel} disabled={busy} />
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <RollField spec={OPEN_D100} value={roll} onChange={(value) => setRoll(value.total)} disabled={busy} />
            <NumericInput
              label={t('fear-rr-bonus')}
              value={bonus}
              onChange={setBonus}
              placeholder={sheetBonus !== undefined ? formatBonus(sheetBonus) : undefined}
              integer
              allowNegatives
              error={sheetBonus === undefined && bonus === null}
              disabled={busy}
            />
            <NumericInput
              label={t('custom-bonus')}
              value={modifier}
              onChange={setModifier}
              integer
              allowNegatives
              disabled={busy}
            />
          </Stack>
          <Typography variant="caption" color="text.secondary">
            {sheetBonus !== undefined
              ? t('fear-rr-bonus-sheet', { value: formatBonus(sheetBonus) })
              : t('fear-rr-bonus-required')}
          </Typography>
        </Stack>
      )}
    </RmuDialog>
  );
};

export default ResistanceRollDialog;
