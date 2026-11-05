import React, { FC, useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
import AirIcon from '@mui/icons-material/Air';
import ScubaDivingIcon from '@mui/icons-material/ScubaDiving';
import { Alert, Box, Button, Chip, Divider, FormControlLabel, Stack, Switch, TextField } from '@mui/material';
import {
  breathLimitRounds,
  breathRoundsLeft,
  ChipRow,
  NumberPadField,
  RmuDialog,
  RuleHint,
  SectionLabel,
  StartBreathDto,
} from '@labcabrera-rmu/rmu-react-shared-lib';
import { CombatContext } from '../../CombatContext';
import { setActorRoundEnvironmentProtection, startActorRoundBreath, stopActorRoundBreath } from '../api/actor-rounds';
import { ActorRound } from '../api/actor-rounds.dto';
import { isRoundEditable } from '../services/game-service';
import { useTacticalNotify } from '../services/notify-service';
import { canManageTactical } from '../shared/permissions';

type BreathForm = { prepared: boolean; underwater: boolean; constitutionBonus: number | null; note: string };

const emptyForm = (): BreathForm => ({ prepared: true, underwater: false, constitutionBonus: null, note: '' });

/**
 * The actor starts holding its breath (workspace spec 079, C4, §15.2): prepared or caught unawares, underwater or not,
 * and its Constitution bonus (the sheet's for a character; an NPC needs it, 0 otherwise).
 */
const StartBreathDialog: FC<{ actorRound: ActorRound; open: boolean; onClose: () => void }> = ({
  actorRound,
  open,
  onClose,
}) => {
  const { t } = useTranslation();
  const auth = useAuth();
  const notify = useTacticalNotify();
  const { updateActorRound } = useContext(CombatContext)!;
  const [form, setForm] = useState<BreathForm>(emptyForm);
  const [busy, setBusy] = useState(false);
  const npc = actorRound.actorType === 'npc';

  useEffect(() => {
    if (open) setForm(emptyForm());
  }, [open]);

  const change = (patch: Partial<BreathForm>) => setForm((prev) => ({ ...prev, ...patch }));

  const start = () => {
    const dto: StartBreathDto = {
      prepared: form.prepared,
      underwater: form.underwater,
      ...(form.constitutionBonus !== null ? { constitutionBonus: form.constitutionBonus } : {}),
      ...(form.note.trim() ? { note: form.note.trim() } : {}),
    };
    setBusy(true);
    startActorRoundBreath(actorRound.id, dto, auth)
      .then((updated) => {
        updateActorRound(updated);
        notify.success(t('breath-started', { rounds: updated.breath?.limitRounds ?? 0 }));
        onClose();
      })
      .catch((err) => notify.error(err))
      .finally(() => setBusy(false));
  };

  return (
    <RmuDialog
      open={open}
      onDismiss={onClose}
      maxWidth="sm"
      title={t('breath-hold')}
      subtitle={actorRound.actorName}
      buttons={[
        <Button key="cancel" onClick={onClose}>
          {t('cancel')}
        </Button>,
        <Button key="start" variant="contained" disabled={busy} onClick={start}>
          {t('breath-hold')}
        </Button>,
      ]}
    >
      <Stack spacing={2}>
        <RuleHint title={t('breath-hold')} description={t('breath-help')} reference="§15.2">
          <Alert severity="info" variant="outlined">
            {t('breath-help')}
          </Alert>
        </RuleHint>
        <Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap', rowGap: 1 }}>
          <FormControlLabel
            control={<Switch checked={form.prepared} onChange={(e) => change({ prepared: e.target.checked })} />}
            label={t('breath-prepared')}
          />
          <FormControlLabel
            control={<Switch checked={form.underwater} onChange={(e) => change({ underwater: e.target.checked })} />}
            label={t('breath-underwater')}
          />
        </Stack>
        <Box sx={{ width: 220 }}>
          <NumberPadField
            label={t('breath-constitution-bonus')}
            helperText={t(npc ? 'breath-constitution-bonus-npc' : 'breath-constitution-bonus-sheet')}
            value={form.constitutionBonus}
            onChange={(constitutionBonus) => change({ constitutionBonus })}
            integer
            signed
            steps={[-5, -1, 1, 5]}
          />
        </Box>
        {form.constitutionBonus !== null && (
          <ChipRow>
            <Chip
              size="small"
              variant="outlined"
              label={t('breath-limit', { rounds: breathLimitRounds(form.prepared, form.constitutionBonus) })}
            />
          </ChipRow>
        )}
        <TextField
          size="small"
          label={t('note')}
          value={form.note}
          onChange={(e) => change({ note: e.target.value })}
          fullWidth
        />
      </Stack>
    </RmuDialog>
  );
};

/**
 * Breath and protection from the environment of an actor in the side panel (workspace spec 079, C3-C4). The game
 * master starts and stops a held breath (its rounds against the limit, the suffocation after a failed check) and, in a
 * game with an extreme temperature, marks the actor protected (no critical in the upkeep). Nothing for the players
 * when there is nothing to show.
 */
const ActorRoundEnvironment: FC<{ actorRound: ActorRound }> = ({ actorRound }) => {
  const { t } = useTranslation();
  const auth = useAuth();
  const notify = useTacticalNotify();
  const { game, displayRound, updateActorRound } = useContext(CombatContext)!;
  const [busy, setBusy] = useState(false);
  const [starting, setStarting] = useState(false);
  const manage = !!game && canManageTactical(game) && isRoundEditable(game, displayRound);
  const breath = actorRound.breath ?? null;
  const extreme = game?.environment?.extremeTemperature ?? null;
  const protectedFromEnvironment = !!actorRound.protectedFromEnvironment;
  if (!manage && !breath && !(extreme && protectedFromEnvironment)) return null;

  const run = (call: Promise<ActorRound>, message: string) => {
    setBusy(true);
    call
      .then((updated) => {
        updateActorRound(updated);
        notify.success(t(message));
      })
      .catch((err) => notify.error(err))
      .finally(() => setBusy(false));
  };

  const left = breath ? breathRoundsLeft(breath) : 0;
  const suffocating = !!breath && breath.failedRound !== null;

  return (
    <>
      <Stack spacing={1}>
        <RuleHint title={t('environment-actor')} description={t('environment-actor-help')} reference="§15.2-15.3">
          <SectionLabel>{t('environment-actor')}</SectionLabel>
        </RuleHint>
        {breath ? (
          <Stack spacing={1}>
            <ChipRow>
              <Chip
                size="small"
                color={suffocating ? 'error' : left === 0 ? 'warning' : 'info'}
                icon={breath.underwater ? <ScubaDivingIcon /> : <AirIcon />}
                label={t('breath-held-rounds', { held: breath.heldRounds, limit: breath.limitRounds })}
              />
              {!breath.prepared && <Chip size="small" variant="outlined" label={t('breath-unprepared')} />}
              {breath.underwater && <Chip size="small" variant="outlined" label={t('breath-underwater')} />}
              {suffocating && <Chip size="small" color="error" label={t('suffocating')} />}
            </ChipRow>
            {suffocating && (
              <Alert severity="error" variant="outlined">
                {t('breath-suffocating-help')}
              </Alert>
            )}
            {manage && (
              <Button
                size="small"
                variant="outlined"
                startIcon={<AirIcon />}
                disabled={busy}
                onClick={() => run(stopActorRoundBreath(actorRound.id, auth), 'breath-stopped')}
                sx={{ alignSelf: 'flex-start' }}
              >
                {t('breath-stop')}
              </Button>
            )}
          </Stack>
        ) : (
          manage && (
            <Button
              size="small"
              variant="outlined"
              startIcon={<ScubaDivingIcon />}
              onClick={() => setStarting(true)}
              sx={{ alignSelf: 'flex-start' }}
            >
              {t('breath-hold')}
            </Button>
          )
        )}
        {extreme &&
          (manage ? (
            <FormControlLabel
              control={
                <Switch
                  checked={protectedFromEnvironment}
                  disabled={busy}
                  onChange={(e) =>
                    run(
                      setActorRoundEnvironmentProtection(actorRound.id, e.target.checked, auth),
                      'environment-protection-updated'
                    )
                  }
                />
              }
              label={t('environment-protected')}
            />
          ) : (
            protectedFromEnvironment && (
              <Chip size="small" variant="outlined" color="success" label={t('environment-protected')} />
            )
          ))}
        {starting && <StartBreathDialog actorRound={actorRound} open onClose={() => setStarting(false)} />}
      </Stack>
      <Divider />
    </>
  );
};

export default ActorRoundEnvironment;
