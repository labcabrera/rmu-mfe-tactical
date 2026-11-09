import { FC, useEffect, useState } from 'react';
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
import { fetchActorRound } from '../../api/actor-rounds';
import { ActorRound } from '../../api/actor-rounds.dto';
import { rollActorResistance } from '../../api/psychology';
import { ResistanceRollResult } from '../../api/psychology.dto';
import { useCombatActions } from '../../combat/combat-context';
import { useBusyAction } from '../../hooks/useBusyAction';
import { actorOpenEnded } from '../../services/combat-talents-service';
import { resistanceBonus } from '../psychology/ResistanceRollDialog';

/**
 * Physical RR of an actor dying in frenzy (workspace spec 040, decision 14), asked by its upkeep alert: the open-ended
 * roll and the physical RR bonus (from the sheet, or typed for an NPC), at attack level 0. The API kills the actor when
 * it fails and resolves the alert either way.
 */
const FrenzyDyingRrDialog: FC<{ actorRound: ActorRound; alertId: string; open: boolean; onClose: () => void }> = ({
  actorRound,
  alertId,
  open,
  onClose,
}) => {
  const { t } = useTranslation();
  const auth = useAuth();
  const { updateActorRound } = useCombatActions();
  const sheetBonus = resistanceBonus(actorRound, 'physical');
  const [roll, setRoll] = useState<number | null>(null);
  const [bonus, setBonus] = useState<number | null>(null);
  const { busy, run } = useBusyAction();
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
    run(
      rollActorResistance(
        actorRound.id,
        {
          kind: 'physical',
          attackLevel: 0,
          roll,
          reason: 'frenzy-dying',
          alertId,
          ...(bonus !== null ? { bonus } : {}),
        },
        auth
      ).then((rolled) => {
        setResult(rolled);
        return fetchActorRound(actorRound.id, auth).then(updateActorRound);
      })
    );
  };

  return (
    <RmuDialog
      open={open}
      onDismiss={onClose}
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
        <RollResultAlert
          severity={result.resisted ? 'success' : 'error'}
          headline={
            result.resisted
              ? t('rr-resisted', { total: result.total, required: result.required })
              : t('rr-failed', { total: result.total, required: result.required, failure: result.failure })
          }
          lines={[t(result.resisted ? 'frenzy-dying-survives' : 'frenzy-dying-dies')]}
          breakdown={<RollBreakdown context="physical-rr" modifiers={result.breakdown} total={result.total} />}
        />
      ) : (
        <Stack spacing={2}>
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
