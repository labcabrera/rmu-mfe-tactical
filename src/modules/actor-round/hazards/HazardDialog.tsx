import { FC, ReactNode, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
import { Alert, Box, Button, FormControlLabel, MenuItem, Stack, Switch, TextField, Typography } from '@mui/material';
import {
  ActorRoundHazard,
  ATTACK_SIZE_SCALE,
  D100,
  FALL_CONTROL_PURPOSE,
  HAZARD_MAX_CRITICAL_ROLLS,
  HazardKind,
  HIGH_OPEN_D100,
  NumberPadField,
  ResolveHazardBlockAFields,
  ResolveHazardDto,
  RmuDialog,
  RollField,
  RuleHint,
  signedSteps,
  useApiNotify,
} from '@labcabrera-rmu/rmu-react-shared-lib';
import { resolveHazard } from '../../api/actor-rounds';
import { ActorRound } from '../../api/actor-rounds.dto';
import { useCombatRound, useCombatActions } from '../../combat/combat-context';
import { useBusyAction } from '../../hooks/useBusyAction';
import HazardResult from './HazardResult';

/** Size of a falling object: chosen, or given by its weight. */
const BY_WEIGHT = 'by-weight';

type HazardForm = {
  distanceFeet: number | null;
  roll: number | null;
  criticalRolls: (number | null)[];
  db: number | null;
  note: string;
  deliberate: boolean;
  heightFeet: number | null;
  fallControlActionId: string;
  objectSize: string;
  weightLbs: number | null;
  shield: boolean;
};

const emptyForm = (actorRound: ActorRound, distanceFeet: number | null = null): HazardForm => ({
  distanceFeet,
  roll: null,
  criticalRolls: [],
  db: null,
  note: '',
  deliberate: false,
  heightFeet: actorRound.height ?? null,
  fallControlActionId: '',
  objectSize: 'medium',
  weightLbs: null,
  shield: true,
});

/** The request of the form: only what its kind takes, and the critical rolls given in order. */
const toDto = (
  kind: HazardKind,
  form: HazardForm,
  knockedBackAlertId?: string
): ResolveHazardDto & ResolveHazardBlockAFields => {
  const criticalRolls = form.criticalRolls.filter((roll): roll is number => roll !== null);
  return {
    kind,
    ...(knockedBackAlertId ? { knockedBackAlertId } : {}),
    distanceFeet: form.distanceFeet ?? 0,
    roll: form.roll ?? 0,
    ...(criticalRolls.length > 0 ? { criticalRolls } : {}),
    ...(form.db !== null ? { db: form.db } : {}),
    ...(form.note.trim() ? { note: form.note.trim() } : {}),
    ...(kind === 'fall'
      ? {
          deliberate: form.deliberate,
          ...(form.deliberate && form.heightFeet !== null ? { heightFeet: form.heightFeet } : {}),
          ...(form.fallControlActionId ? { fallControlActionId: form.fallControlActionId } : {}),
        }
      : {
          ...(form.objectSize === BY_WEIGHT ? { weightLbs: form.weightLbs ?? 0 } : { objectSize: form.objectSize }),
          shield: form.shield,
        }),
  };
};

/**
 * A fall or a falling object on an actor (workspace spec 077, decisions D1-D2; game master only). A fall rolls on the
 * Crush table with the actor's size, its OB the feet fallen (less the actor's height when it jumped on purpose) and only
 * magical DB; a resolved fall-control maneuver of the actor moves its critical. A falling object rolls on Rock (smaller
 * than the actor) or Crush with its size or weight, against the DB of the actor. The roll is open-ended upwards only.
 * The critical rolls are optional: the ones not given become critical alerts of the actor. The result shows here.
 */
const HazardDialog: FC<{
  actorRound: ActorRound;
  kind: HazardKind;
  open: boolean;
  onClose: () => void;
  /** Called once the hazard is resolved (a suggested fall closes its alert). */
  onResolved?: (hazard: ActorRoundHazard | undefined) => void;
  /** Shown above the form: why the fall is suggested. */
  intro?: ReactNode;
  /** A "Dismiss" button: the suggested fall does not happen. */
  onDismiss?: () => void;
  /**
   * Workspace spec 079, decision A4: the `knocked-back` alert the hazard resolves (its severity caps the critical), and
   * the feet the actor was knocked back, as the starting distance.
   */
  knockedBackAlertId?: string;
  initialDistance?: number | null;
}> = ({ actorRound, kind, open, onClose, onResolved, intro, onDismiss, knockedBackAlertId, initialDistance }) => {
  const { t } = useTranslation();
  const auth = useAuth();
  const notify = useApiNotify();
  const { roundActions } = useCombatRound();
  const { updateActorRound } = useCombatActions();
  const [form, setForm] = useState<HazardForm>(() => emptyForm(actorRound, initialDistance));
  const { busy, run } = useBusyAction();
  const [result, setResult] = useState<ActorRoundHazard | undefined>();
  const fall = kind === 'fall';

  useEffect(() => {
    if (open) {
      setForm(emptyForm(actorRound, initialDistance));
      setResult(undefined);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, kind]);

  const change = (patch: Partial<HazardForm>) => setForm((prev) => ({ ...prev, ...patch }));
  // The resolved fall-control maneuvers of the actor this round (decision D4)
  const fallControls = (roundActions ?? []).filter(
    (action) =>
      action.actorId === actorRound.actorId &&
      action.actionType === 'maneuver' &&
      action.maneuver?.modifiers.purpose === FALL_CONTROL_PURPOSE &&
      action.status === 'completed' &&
      action.maneuver?.result?.fallControlSteps !== undefined &&
      action.maneuver?.result?.fallControlSteps !== null
  );
  const ready =
    (form.distanceFeet ?? 0) > 0 &&
    form.roll !== null &&
    (fall || form.objectSize !== BY_WEIGHT || (form.weightLbs ?? 0) > 0);

  const resolve = () => {
    const before = new Set((actorRound.hazards ?? []).map((hazard) => hazard.id));
    run(
      resolveHazard(actorRound.id, toDto(kind, form, knockedBackAlertId), auth).then((updated) => {
        updateActorRound(updated);
        const hazard = (updated.hazards ?? []).find((each) => !before.has(each.id));
        setResult(hazard);
        notify.success(t('hazard-resolved', { damage: hazard?.damage ?? 0 }));
        onResolved?.(hazard);
      })
    );
  };

  const criticalSlots = Math.min(
    HAZARD_MAX_CRITICAL_ROLLS,
    form.criticalRolls.filter((roll) => roll !== null).length + 1
  );

  const formContent = (
    <Stack spacing={2}>
      {intro}
      <RuleHint
        title={t(`hazard-kind-${kind}`)}
        description={t(fall ? 'hazard-fall-help' : 'hazard-falling-object-help')}
        reference="§15.4"
      >
        <Typography variant="body2" color="text.secondary">
          {t(fall ? 'hazard-fall-help' : 'hazard-falling-object-help')}
        </Typography>
      </RuleHint>
      <Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap', rowGap: 2, alignItems: 'flex-start' }}>
        <Box sx={{ width: 180 }}>
          <NumberPadField
            label={t('hazard-distance-feet')}
            value={form.distanceFeet}
            onChange={(distanceFeet) => change({ distanceFeet })}
            min={0}
            steps={[-10, -5, 5, 10]}
            allowNegatives={false}
            error={form.distanceFeet !== null && form.distanceFeet <= 0}
          />
        </Box>
        <Box sx={{ width: 180 }}>
          <NumberPadField
            label={t(fall ? 'hazard-magic-db' : 'hazard-db')}
            helperText={t(fall ? 'hazard-magic-db-help' : 'hazard-db-help')}
            value={form.db}
            onChange={(db) => change({ db })}
            integer
            steps={[-10, -5, 5, 10]}
          />
        </Box>
      </Stack>
      {fall ? (
        <Stack spacing={1.5}>
          <Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap', rowGap: 1, alignItems: 'center' }}>
            <FormControlLabel
              control={<Switch checked={form.deliberate} onChange={(e) => change({ deliberate: e.target.checked })} />}
              label={t('hazard-deliberate')}
            />
            {form.deliberate && (
              <Box sx={{ width: 180 }}>
                <NumberPadField
                  label={t('hazard-height-feet')}
                  helperText={actorRound.height ? undefined : t('hazard-height-unknown')}
                  value={form.heightFeet}
                  onChange={(heightFeet) => change({ heightFeet })}
                  min={0}
                  allowNegatives={false}
                />
              </Box>
            )}
          </Stack>
          <TextField
            select
            size="small"
            label={t('fall-control')}
            value={form.fallControlActionId}
            onChange={(e) => change({ fallControlActionId: e.target.value })}
            helperText={fallControls.length === 0 ? t('hazard-no-fall-control') : t('hazard-fall-control-help')}
            disabled={fallControls.length === 0}
            sx={{ maxWidth: 360 }}
          >
            <MenuItem value="">{t('none')}</MenuItem>
            {fallControls.map((action) => {
              const steps = action.maneuver?.result?.fallControlSteps ?? 0;
              return (
                <MenuItem key={action.id} value={action.id}>
                  {[
                    t('phase-n', { phase: action.phaseStart }),
                    action.maneuver?.result?.result ? t(action.maneuver.result.result) : null,
                    t('fall-control-steps', { steps: signedSteps(steps) }),
                  ]
                    .filter(Boolean)
                    .join(' · ')}
                </MenuItem>
              );
            })}
          </TextField>
        </Stack>
      ) : (
        <Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap', rowGap: 2, alignItems: 'flex-start' }}>
          <TextField
            select
            size="small"
            label={t('hazard-object-size')}
            value={form.objectSize}
            onChange={(e) => change({ objectSize: e.target.value })}
            sx={{ minWidth: 200 }}
          >
            {ATTACK_SIZE_SCALE.map((size) => (
              <MenuItem key={size.sizeId} value={size.sizeId}>
                {t(`size-${size.sizeId}`)}
              </MenuItem>
            ))}
            <MenuItem value={BY_WEIGHT}>{t('hazard-size-by-weight')}</MenuItem>
          </TextField>
          {form.objectSize === BY_WEIGHT && (
            <Box sx={{ width: 180 }}>
              <NumberPadField
                label={t('hazard-weight-lbs')}
                value={form.weightLbs}
                onChange={(weightLbs) => change({ weightLbs })}
                min={0}
                allowNegatives={false}
                steps={[-10, -1, 1, 10]}
              />
            </Box>
          )}
          <FormControlLabel
            control={<Switch checked={form.shield} onChange={(e) => change({ shield: e.target.checked })} />}
            label={t('hazard-shield')}
          />
        </Stack>
      )}
      <RollField
        spec={HIGH_OPEN_D100}
        label={t('hazard-roll')}
        value={form.roll}
        onChange={(roll) => change({ roll: roll.total })}
        onClear={() => change({ roll: null })}
      />
      <Stack spacing={1}>
        <Typography variant="caption" color="text.secondary">
          {t('hazard-critical-rolls-help')}
        </Typography>
        <Stack direction="row" spacing={1.5} sx={{ flexWrap: 'wrap', rowGap: 1 }}>
          {Array.from({ length: criticalSlots }, (_, index) => (
            <Box key={index} sx={{ minWidth: 200, flex: 1 }}>
              <RollField
                spec={D100}
                label={t('hazard-critical-roll-n', { n: index + 1 })}
                value={form.criticalRolls[index] ?? null}
                onChange={(roll) => {
                  const rolls = [...form.criticalRolls];
                  rolls[index] = roll.total;
                  change({ criticalRolls: rolls });
                }}
                onClear={() => change({ criticalRolls: form.criticalRolls.slice(0, index) })}
              />
            </Box>
          ))}
        </Stack>
      </Stack>
      <TextField
        size="small"
        label={t('note')}
        value={form.note}
        onChange={(e) => change({ note: e.target.value })}
        fullWidth
      />
    </Stack>
  );

  return (
    <RmuDialog
      open={open}
      onDismiss={onClose}
      maxWidth="md"
      title={t(`hazard-kind-${kind}`)}
      subtitle={actorRound.actorName}
      buttons={
        result
          ? [
              <Button key="close" variant="contained" onClick={onClose}>
                {t('close')}
              </Button>,
            ]
          : [
              <Button key="cancel" onClick={onClose}>
                {t('cancel')}
              </Button>,
              ...(onDismiss
                ? [
                    <Button key="dismiss" color="inherit" disabled={busy} onClick={onDismiss}>
                      {t('dismiss')}
                    </Button>,
                  ]
                : []),
              <Button key="resolve" variant="contained" color="error" disabled={!ready || busy} onClick={resolve}>
                {t('resolve')}
              </Button>,
            ]
      }
    >
      {result ? (
        <Stack spacing={1.5}>
          <HazardResult hazard={result} />
          {result.criticals.some((critical) => critical.alertId) && (
            <Alert severity="info" variant="outlined">
              {t('hazard-critical-alerts')}
            </Alert>
          )}
        </Stack>
      ) : (
        formContent
      )}
    </RmuDialog>
  );
};

export default HazardDialog;
