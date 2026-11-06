import React, { FC, useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import HealingIcon from '@mui/icons-material/Healing';
import MonitorHeartIcon from '@mui/icons-material/MonitorHeart';
import { Stack, Typography, Chip, Box, TextField, IconButton, Button, MenuItem, Tooltip } from '@mui/material';
import {
  ChipRow,
  effectColor,
  formatBonus,
  EmptyState,
  InjurySourceLine,
  normalizeEffectStatus,
  NumberPadField,
  SectionLabel,
} from '@labcabrera-rmu/rmu-react-shared-lib';
import { CombatContext } from '../../CombatContext';
import { addActorRoundEffect, deleteActorRoundEffect } from '../api/actor-rounds';
import { ActorRound, ActorRoundEffect, AP_EFFECTS } from '../api/actor-rounds.dto';
import { actorRoundBleedingEffect } from '../services/actor-round-service';
import { isGameFinished } from '../services/game-service';
import { useTacticalNotify } from '../services/notify-service';
import MedicalRollDialog, { MedicalTarget } from './medical/MedicalRollDialog';

/** Text of the value of the effects of workspace spec 079: the Defense level, the bonus, the sizes, the percent. */
const BLOCK_B_EFFECT_VALUES: Record<string, string> = {
  'adrenal-defense': 'adrenal-defense-level',
  'adrenal-focus': 'effect-value-bonus',
  'adrenal-strength': 'adrenal-strength-sizes',
  'adrenal-block': 'effect-value-bonus',
  fortitude: 'fortitude-percent',
};

const ActorRoundEffects: FC<{
  actorRound: ActorRound;
}> = ({ actorRound }) => {
  const auth = useAuth();
  const { t } = useTranslation();
  const [newState, setNewState] = useState('');
  const [apEffect, setApEffect] = useState(AP_EFFECTS[0].status);
  const [apValue, setApValue] = useState<number | null>(AP_EFFECTS[0].defaultValue);
  const apDefinition = AP_EFFECTS.find((e) => e.status === apEffect)!;
  const apValueValid =
    apValue !== null &&
    Number.isInteger(apValue) &&
    apValue >= apDefinition.min &&
    apValue <= apDefinition.max &&
    (apEffect !== 'manual' || apValue !== 0);
  const notify = useTacticalNotify();
  const { game, displayRound, updateActorRound } = useContext(CombatContext)!;
  const currentRound = !!game && game.status === 'in_progress' && displayRound === game.round;
  // A finished game is read-only (spec 013): effects are neither added nor removed.
  const readOnly = isGameFinished(game);
  const [stabilizing, setStabilizing] = useState<MedicalTarget | null>(null);
  const surprise = actorRound.effects?.find((e) => e.status === 'surprised' || e.status === 'flatfooted');
  const bleeding = actorRoundBleedingEffect(actorRound);

  const addEffect = (status: string, value?: number) => {
    const effect: ActorRoundEffect = { id: '', status, value, rounds: undefined };
    addActorRoundEffect(actorRound.id, effect, auth)
      .then((updatedActorRound) => updateActorRound(updatedActorRound))
      .catch((err) => notify.error(err));
  };

  const addState = () => addEffect(newState);

  const removeState = (id: string) => {
    deleteActorRoundEffect(actorRound.id, id, auth)
      .then((updatedActorRound) => updateActorRound(updatedActorRound))
      .catch((err) => notify.error(err));
  };

  // A stun shows its penalty and rounds: there is one per severity (§9.8 Stun). A surprise shows the AP it takes.
  const getLabelForState = (state: ActorRoundEffect) => {
    const parts = [t(normalizeEffectStatus(state.status))];
    const apDefinition = AP_EFFECTS.find((e) => e.status === state.status);
    if (state.status === 'surprised') parts.push(t('surprised-lost-ap', { count: state.value ?? 2 }));
    else if (apDefinition && state.value !== undefined && state.value !== null)
      parts.push(t(`ap-effect-value-${state.status}`, { count: state.value }));
    // Workspace spec 079, B3-B4: adrenal moves and Fortitude say what they give
    else if (BLOCK_B_EFFECT_VALUES[state.status] && state.value !== undefined && state.value !== null)
      parts.push(t(BLOCK_B_EFFECT_VALUES[state.status], { count: state.value, value: formatBonus(state.value) }));
    else if (state.value) parts.push(`${state.value}`);
    if (state.status === 'adrenal-block' && typeof state.data?.skillId === 'string')
      parts.push(t(state.data.skillId, { defaultValue: state.data.skillId }));
    if (state.rounds && state.status !== 'surprised' && state.status !== 'flatfooted')
      parts.push(t('rounds-short', { count: state.rounds }));
    // Spec 034: a delayed effect of a critical text says the round it starts in.
    if (state.fromRound && state.fromRound > actorRound.round)
      parts.push(t('effect-from-round', { round: state.fromRound }));
    return parts.join(' ');
  };

  return (
    <Stack spacing={1}>
      <SectionLabel>{t('effects-states')}</SectionLabel>

      {(actorRound.effects || []).length === 0 && !bleeding ? (
        <EmptyState dense title={t('no-states')} />
      ) : (
        <ChipRow>
          {/* It comes from the injuries: it is treated there and has no delete button. */}
          {bleeding && (
            <Tooltip title={t('effect-bleeding-help')}>
              <Chip label={getLabelForState(bleeding)} color={effectColor('bleeding')} sx={{ m: 0.5 }} />
            </Tooltip>
          )}
          {(actorRound.effects || []).map((s: ActorRoundEffect, i: number) => {
            const chip = (
              <Chip
                label={getLabelForState(s)}
                onDelete={readOnly ? undefined : () => removeState(s.id)}
                deleteIcon={<DeleteIcon />}
                sx={{ m: 0.5 }}
              />
            );
            return (
              <Stack key={`${s.status}-${i}`} direction="row" sx={{ alignItems: 'center' }}>
                {/* Where the effect comes from (the critical, its attacker and round), when the API knows it. */}
                {s.source ? (
                  <Tooltip title={<InjurySourceLine source={s.source} />}>
                    <span>{chip}</span>
                  </Tooltip>
                ) : (
                  chip
                )}
                {/* Workspace spec 079, C6: the soul departs 60 rounds after the death; until then a revival */}
                {s.status === 'dead' && typeof actorRound.soulRoundsLeft === 'number' && (
                  <Chip
                    size="small"
                    color={actorRound.soulRoundsLeft > 0 ? 'warning' : 'default'}
                    variant="outlined"
                    label={
                      actorRound.soulRoundsLeft > 0
                        ? t('soul-rounds-left', { count: actorRound.soulRoundsLeft })
                        : t('soul-departed')
                    }
                  />
                )}
                {s.status === 'dead' && currentRound && (actorRound.soulRoundsLeft ?? 0) > 0 && (
                  <Tooltip title={t('gm-adjustment-help')}>
                    <Button
                      size="small"
                      startIcon={<MonitorHeartIcon />}
                      onClick={() => setStabilizing({ kind: 'revive' })}
                    >
                      {t('revive')}
                    </Button>
                  </Tooltip>
                )}
                {s.status === 'dying' && s.causeTreated && (
                  <Chip size="small" color="success" variant="outlined" label={t('dying-cause-treated')} />
                )}
                {/* Workspace spec 068: a game master adjustment without AP; in combat it is a medical action */}
                {s.status === 'dying' && currentRound && (
                  <Tooltip title={t('gm-adjustment-help')}>
                    <Button
                      size="small"
                      startIcon={<HealingIcon />}
                      onClick={() => setStabilizing({ kind: 'stabilize', effect: s })}
                    >
                      {t('stabilize-gm')}
                    </Button>
                  </Tooltip>
                )}
              </Stack>
            );
          })}
        </ChipRow>
      )}

      {currentRound && !surprise && (
        // §8.3 Surprise: set by the game master when the fight starts or the actor joins it, for that round.
        <Stack spacing={0.5}>
          <Typography variant="caption" color="text.secondary">
            {t('surprise-declaration')}
          </Typography>
          <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 1 }}>
            <Button size="small" variant="outlined" onClick={() => addEffect('surprised', 2)}>
              {`${t('surprised')} ${t('surprised-lost-ap', { count: 2 })}`}
            </Button>
            <Button size="small" variant="outlined" onClick={() => addEffect('surprised', 1)}>
              {`${t('surprised')} ${t('surprised-lost-ap', { count: 1 })}`}
            </Button>
            <Button size="small" variant="outlined" color="warning" onClick={() => addEffect('flatfooted')}>
              {t('flatfooted')}
            </Button>
          </Stack>
          <Typography variant="caption" color="text.secondary">
            {t('surprise-declaration-help')}
          </Typography>
        </Stack>
      )}

      {currentRound && (
        // Spec 011: effects that change the action points of the round. The API recomputes the capacity.
        <Stack spacing={0.5}>
          <Typography variant="caption" color="text.secondary">
            {t('ap-effects')}
          </Typography>
          <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
            <TextField
              select
              size="small"
              label={t('effect')}
              value={apEffect}
              onChange={(e) => {
                const definition = AP_EFFECTS.find((d) => d.status === e.target.value)!;
                setApEffect(definition.status);
                setApValue(definition.defaultValue);
              }}
              sx={{ minWidth: 180 }}
            >
              {AP_EFFECTS.map((definition) => (
                <MenuItem key={definition.status} value={definition.status}>
                  {t(definition.status)}
                </MenuItem>
              ))}
            </TextField>
            <Box sx={{ width: 110 }}>
              <NumberPadField
                label={t('value')}
                value={apValue}
                onChange={setApValue}
                integer
                allowNegatives={apDefinition.min < 0}
                min={apDefinition.min}
                max={apDefinition.max}
                error={!apValueValid}
              />
            </Box>
            <Button
              size="small"
              variant="outlined"
              startIcon={<AddIcon />}
              disabled={!apValueValid}
              onClick={() => addEffect(apEffect, apValue ?? undefined)}
            >
              {t('add')}
            </Button>
          </Stack>
          <Typography variant="caption" color="text.secondary">
            {t(`effect-${apEffect}-help`)}
          </Typography>
        </Stack>
      )}

      {!readOnly && (
        <Box sx={{ mt: 1, display: 'flex', alignItems: 'center' }}>
          <TextField
            size="small"
            label={t('new-state')}
            value={newState}
            onChange={(e) => setNewState(e.target.value)}
            sx={{ mr: 1 }}
          />
          <IconButton color="primary" onClick={addState} disabled={!newState}>
            <AddIcon />
          </IconButton>
        </Box>
      )}
      <MedicalRollDialog actorRound={actorRound} target={stabilizing} onClose={() => setStabilizing(null)} />
    </Stack>
  );
};

export default ActorRoundEffects;
