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
import { fetchActorRound } from '../../api/actor-rounds';
import { ActorRound } from '../../api/actor-rounds.dto';
import { rollActorResistance } from '../../api/psychology';
import { ResistanceRollResult } from '../../api/psychology.dto';
import { resistanceBonus } from '../../actor-round/psychology/ResistanceRollDialog';
import { useTacticalNotify } from '../../services/notify-service';

/**
 * Physical RR of an actor dying in frenzy (workspace spec 040, decision 14), asked by its upkeep alert: the open-ended
 * roll and the physical RR bonus (from the sheet, or typed for an NPC), at attack level 0. The API kills the actor when
 * it fails and resolves the alert either way.
 */
const FrenzyDyingRrDialog: FC<{ actorRound: ActorRound; open: boolean; onClose: () => void }> = ({
  actorRound,
  open,
  onClose,
}) => {
  const { t } = useTranslation();
  const auth = useAuth();
  const notify = useTacticalNotify();
  const { updateActorRound } = useContext(CombatContext)!;
  const sheetBonus = resistanceBonus(actorRound, 'physical');
  const [roll, setRoll] = useState<number | null>(null);
  const [bonus, setBonus] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<ResistanceRollResult | null>(null);

  useEffect(() => {
    if (!open) return;
    setRoll(null);
    setBonus(null);
    setResult(null);
  }, [open]);

  const valid = roll !== null && (sheetBonus !== undefined || bonus !== null);

  const submit = () => {
    if (roll === null) return;
    setBusy(true);
    rollActorResistance(
      actorRound.id,
      { kind: 'physical', attackLevel: 0, roll, reason: 'frenzy-dying', ...(bonus !== null ? { bonus } : {}) },
      auth
    )
      .then((rolled) => {
        setResult(rolled);
        return fetchActorRound(actorRound.id, auth).then(updateActorRound);
      })
      .catch((err) => notify.error(err))
      .finally(() => setBusy(false));
  };

  return (
    <RmuDialog
      open={open}
      onClose={onClose}
      title={t('frenzy-dying-rr')}
      subtitle={actorRound.actorName}
      maxWidth="sm"
      buttons={
        result ? (
          <Button variant="contained" onClick={onClose}>
            {t('close')}
          </Button>
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
          <Alert severity={result.resisted ? 'success' : 'error'}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              {result.resisted
                ? t('rr-resisted', { total: result.total, required: result.required })
                : t('rr-failed', { total: result.total, required: result.required, failure: result.failure })}
            </Typography>
            <Typography variant="body2">{t(result.resisted ? 'frenzy-dying-survives' : 'frenzy-dying-dies')}</Typography>
          </Alert>
          <RollBreakdown modifiers={result.breakdown} total={result.total} />
        </Stack>
      ) : (
        <Stack spacing={2}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <RollField spec={OPEN_D100} value={roll} onChange={(value) => setRoll(value.total)} disabled={busy} />
            <NumericInput
              label={t('physical-rr-bonus')}
              value={bonus}
              onChange={setBonus}
              placeholder={sheetBonus !== undefined ? formatBonus(sheetBonus) : undefined}
              integer
              allowNegatives
              error={sheetBonus === undefined && bonus === null}
              disabled={busy}
            />
          </Stack>
          <Typography variant="caption" color="text.secondary">
            {sheetBonus !== undefined
              ? t('physical-rr-bonus-sheet', { value: formatBonus(sheetBonus) })
              : t('physical-rr-bonus-required')}
          </Typography>
        </Stack>
      )}
    </RmuDialog>
  );
};

export default FrenzyDyingRrDialog;
