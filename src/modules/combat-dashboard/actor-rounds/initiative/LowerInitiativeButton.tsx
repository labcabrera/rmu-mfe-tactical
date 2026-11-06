import React, { FC, useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
import SouthIcon from '@mui/icons-material/South';
import { Button, IconButton, Stack, TextField, Tooltip, Typography } from '@mui/material';
import { RmuDialog } from '@labcabrera-rmu/rmu-react-shared-lib';
import { CombatContext } from '../../../../CombatContext';
import { lowerActorRoundInitiative } from '../../../api/actor-rounds';
import { ActorRound } from '../../../api/actor-rounds.dto';
import { isActorRoundDown } from '../../../services/actor-round-service';
import { isRoundEditable } from '../../../services/game-service';
import { useTacticalNotify } from '../../../services/notify-service';

/**
 * §8.3 (workspace spec 083, decision 4): the actor lowers its initiative for the rest of the round, down to its value
 * in negative. It cannot go back up, and the next round has a new one. Only in the action phases of the current round.
 */
const LowerInitiativeButton: FC<{ actorRound: ActorRound }> = ({ actorRound }) => {
  const { t } = useTranslation();
  const auth = useAuth();
  const notify = useTacticalNotify();
  const { game, displayRound, updateActorRound } = useContext(CombatContext)!;
  const [value, setValue] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const { roll, total = 0, lowered = 0 } = actorRound.initiative ?? {};

  if (
    !roll ||
    isActorRoundDown(actorRound) ||
    !isRoundEditable(game, displayRound) ||
    !game?.phase.startsWith('phase_')
  ) {
    return null;
  }

  const lowest = -Math.abs(total - lowered);
  const target = Number(value);
  const valid = !!value && Number.isInteger(target) && target < total && target >= lowest;

  const confirm = () => {
    setBusy(true);
    lowerActorRoundInitiative(actorRound.id, target, auth)
      .then((updated) => {
        updateActorRound(updated);
        notify.success(t('initiative-lowered-done', { actor: actorRound.actorName, value: target }));
        setValue(null);
      })
      .catch((err) => notify.error(err))
      .finally(() => setBusy(false));
  };

  return (
    <>
      <Tooltip title={t('initiative-lower')}>
        <span>
          <IconButton
            size="small"
            aria-label={t('initiative-lower')}
            disabled={total <= lowest}
            onClick={(e) => {
              e.stopPropagation();
              setValue(String(total - 1));
            }}
          >
            <SouthIcon fontSize="inherit" />
          </IconButton>
        </span>
      </Tooltip>
      {value !== null && (
        <RmuDialog
          open
          title={t('initiative-lower')}
          maxWidth="xs"
          fullScreen={false}
          onDismiss={() => setValue(null)}
          buttons={
            <>
              <Button onClick={() => setValue(null)}>{t('cancel')}</Button>
              <Button variant="contained" onClick={confirm} disabled={busy || !valid}>
                {t('initiative-lower')}
              </Button>
            </>
          }
        >
          <Stack spacing={2} onClick={(e) => e.stopPropagation()}>
            <Typography variant="body2" color="text.secondary">
              {t('initiative-lower-help', { lowest })}
            </Typography>
            <TextField
              autoFocus
              size="small"
              type="number"
              label={t('initiative-lower-value')}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              error={!valid}
              helperText={t('initiative-lower-range', { lowest, highest: total - 1 })}
              slotProps={{ htmlInput: { min: lowest, max: total - 1, step: 1 } }}
            />
          </Stack>
        </RmuDialog>
      )}
    </>
  );
};

export default LowerInitiativeButton;
