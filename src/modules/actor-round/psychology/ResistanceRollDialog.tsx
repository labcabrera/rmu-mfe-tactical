import React, { FC, useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
import { Button, Stack, Typography } from '@mui/material';
import {
  formatBonus,
  NumberPadField,
  OPEN_D100,
  RmuDialog,
  RollBreakdown,
  RollResultAlert,
  RollField,
} from '@labcabrera-rmu/rmu-react-shared-lib';
import { CombatContext } from '../../../CombatContext';
import { fetchActorRound } from '../../api/actor-rounds';
import { ActorRound } from '../../api/actor-rounds.dto';
import { applyFearEffect, rollActorResistance } from '../../api/psychology';
import { ResistanceRollResult } from '../../api/psychology.dto';
import { actorOpenEnded } from '../../services/combat-talents-service';
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
 * core's tables and leaves no effect; on a failure the game master applies the fear effect it gives through
 * `fear-effects` (workspace spec 068, S11), which keeps the worst state of the actor. A group takes its fear check
 * from the round header instead. `initialLevel` prefills the fright level (the Revulsion alert), and with `alertId` the
 * API closes that alert with the result of the RR (workspace spec 087).
 */
const ResistanceRollDialog: FC<{
  actorRound: ActorRound;
  open: boolean;
  onClose: () => void;
  initialLevel?: number | null;
  /** Name of what frightens, kept as the source of the fear effect. */
  sourceName?: string;
  /** The alert this RR answers. */
  alertId?: string;
}> = ({ actorRound, open, onClose, initialLevel = null, sourceName, alertId }) => {
  const { t } = useTranslation();
  const auth = useAuth();
  const notify = useTacticalNotify();
  const { updateActorRound } = useContext(CombatContext)!;
  const sheetBonus = fearBonus(actorRound);
  const [attackLevel, setAttackLevel] = useState<number | null>(null);
  const [roll, setRoll] = useState<number | null>(null);
  const [bonus, setBonus] = useState<number | null>(null);
  const [modifier, setModifier] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<ResistanceRollResult | null>(null);

  useEffect(() => {
    if (!open) return;
    setAttackLevel(initialLevel);
    setRoll(null);
    setBonus(null);
    setModifier(null);
    setResult(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
        ...(alertId ? { alertId } : {}),
      },
      auth
    )
      .then((rolled) => {
        setResult(rolled);
        return alertId ? fetchActorRound(actorRound.id, auth).then(updateActorRound) : undefined;
      })
      .catch((err) => notify.error(err))
      .finally(() => setBusy(false));
  };

  const applyEffect = () => {
    if (!result?.severity) return;
    setBusy(true);
    applyFearEffect(
      actorRound.id,
      { severity: result.severity, ...(sourceName ? { source: { name: sourceName } } : {}) },
      auth
    )
      .then((applied) => {
        updateActorRound(applied.actorRound);
        if (applied.unchanged) notify.info(t('fear-effect-unchanged', { effect: t(applied.effect.status) }));
        else notify.success(t('fear-effect-applied', { effect: t(applied.effect.status) }));
        onClose();
      })
      .catch((err) => notify.error(err))
      .finally(() => setBusy(false));
  };

  return (
    <RmuDialog
      open={open}
      onDismiss={onClose}
      title={t('fear-rr')}
      subtitle={actorRound.actorName}
      maxWidth="sm"
      buttons={
        result ? (
          <>
            {result.fearState && result.severity && (
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
        <RollResultAlert
          severity={result.resisted ? 'success' : 'warning'}
          headline={
            result.resisted
              ? t('rr-resisted', { total: result.total, required: result.required })
              : t('rr-failed', { total: result.total, required: result.required, failure: result.failure })
          }
          lines={[
            result.fearState &&
              `${t(`fear-${result.fearState}`)} · ${t(`fear-severity-${result.severity}`)}${
                result.rallyModifier ? ` · ${t('rally-modifier', { value: formatBonus(result.rallyModifier) })}` : ''
              }`,
          ]}
          breakdown={<RollBreakdown context="fear-rr" modifiers={result.breakdown} total={result.total} />}
          note={result.fearState ? t('fear-rr-effect-help') : undefined}
        />
      ) : (
        <Stack spacing={2}>
          <FrightLevelInput value={attackLevel} onChange={setAttackLevel} disabled={busy} />
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <RollField
              spec={OPEN_D100}
              value={roll}
              onChange={(value) => setRoll(value.total)}
              disabled={busy}
              openEnded={actorOpenEnded(actorRound)}
            />
            <NumberPadField
              steps={[-10, -5, 5, 10]}
              label={t('fear-rr-bonus')}
              value={bonus}
              onChange={setBonus}
              placeholder={sheetBonus !== undefined ? formatBonus(sheetBonus) : undefined}
              integer
              allowNegatives
              error={sheetBonus === undefined && bonus === null}
              disabled={busy}
            />
            <NumberPadField
              steps={[-10, -5, 5, 10]}
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
