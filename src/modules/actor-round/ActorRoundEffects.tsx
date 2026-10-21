import React, { FC, useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { Stack, Typography, Chip, Box, TextField, IconButton, Button, MenuItem } from '@mui/material';
import { NumericInput } from '@labcabrera-rmu/rmu-react-shared-lib';
import { CombatContext } from '../../CombatContext';
import { addActorRoundEffect, deleteActorRoundEffect } from '../api/actor-rounds';
import { ActorRound, ActorRoundEffect, AP_EFFECTS } from '../api/actor-rounds.dto';
import { useTacticalNotify } from '../services/notify-service';

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
  const surprise = actorRound.effects?.find((e) => e.status === 'surprised' || e.status === 'flatfooted');

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
    const parts = [t(state.status)];
    const apDefinition = AP_EFFECTS.find((e) => e.status === state.status);
    if (state.status === 'surprised') parts.push(t('surprised-lost-ap', { count: state.value ?? 2 }));
    else if (apDefinition && state.value !== undefined && state.value !== null)
      parts.push(t(`ap-effect-value-${state.status}`, { count: state.value }));
    else if (state.value) parts.push(`${state.value}`);
    if (state.rounds && state.status !== 'surprised' && state.status !== 'flatfooted')
      parts.push(t('rounds-short', { count: state.rounds }));
    return parts.join(' ');
  };

  return (
    <Stack spacing={1}>
      <Typography variant="subtitle2">{t('effects-states')}</Typography>

      {(actorRound.effects || []).length === 0 ? (
        <Typography variant="body2">{t('no-states')}</Typography>
      ) : (
        <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
          {(actorRound.effects || []).map((s: ActorRoundEffect, i: number) => (
            <Chip
              key={`${s.status}-${i}`}
              label={getLabelForState(s)}
              onDelete={() => removeState(s.id)}
              deleteIcon={<DeleteIcon />}
              sx={{ m: 0.5 }}
            />
          ))}
        </Stack>
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
              <NumericInput
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
    </Stack>
  );
};

export default ActorRoundEffects;
