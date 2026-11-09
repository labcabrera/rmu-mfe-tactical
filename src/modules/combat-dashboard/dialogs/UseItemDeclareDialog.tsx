import { FC, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Button, MenuItem, Stack, TextField, Typography } from '@mui/material';
import {
  ALL_STUN_ROUNDS,
  CharacterPicker,
  NumberPadField,
  RmuDialog,
  SectionLabel,
} from '@labcabrera-rmu/rmu-react-shared-lib';
import { isCombatHerb, useCharacterHerbs } from '../../actor-round/poison/combat-herbs';
import { UseItemDeclarationDto } from '../../api/action.dto';
import { ActorRound } from '../../api/actor-rounds.dto';
import { useCombatRound } from '../../combat/combat-context';
import { useActorRoundOption } from '../../hooks/useActorRoundOption';
import { actorRoundDownState } from '../../services/actor-round-service';

/**
 * Declaration of a `use_item` action (workspace spec 068, decision 7): a healing item the character carries (a herb
 * that heals hits or removes stun, with the units left in this game) used on an actor of the game, itself by default.
 * It takes 2 AP; the dose is spent in strategic when the outcome of the game is applied. The hits can be typed now or
 * when it is resolved; the API rolls the range of the item without them.
 */
const UseItemDeclareDialog: FC<{
  open: boolean;
  actorRound: ActorRound | null;
  busy: boolean;
  onClose: () => void;
  onDeclare: (useItem: UseItemDeclarationDto) => void;
}> = ({ open, actorRound, busy, onClose, onDeclare }) => {
  const { t } = useTranslation();
  const { actorRounds } = useCombatRound();
  const toOption = useActorRoundOption();
  const herbs = useCharacterHerbs(actorRound, open).filter(isCombatHerb);
  const [itemId, setItemId] = useState('');
  const [targetId, setTargetId] = useState<string | null>(null);
  const [roll, setRoll] = useState<number | null>(null);

  useEffect(() => {
    if (!open || !actorRound) return;
    setItemId('');
    setTargetId(actorRound.actorId);
    setRoll(null);
  }, [open, actorRound]);

  if (!actorRound) return null;

  const targets = (actorRounds ?? []).filter((each) => actorRoundDownState(each) !== 'dead');
  const selected = herbs.find((each) => each.id === itemId);
  const effects = selected?.catalog?.features?.herb?.effects;
  const stun = effects?.stunRelief;

  return (
    <RmuDialog
      open={open}
      onDismiss={onClose}
      title={t('use-item')}
      subtitle={actorRound.actorName}
      maxWidth="sm"
      buttons={
        <>
          <Button onClick={onClose} disabled={busy}>
            {t('cancel')}
          </Button>
          <Button
            variant="contained"
            onClick={() =>
              selected &&
              targetId &&
              onDeclare({ itemId: selected.id, targetActorId: targetId, ...(roll !== null ? { roll } : {}) })
            }
            disabled={busy || !selected || !targetId}
          >
            {t('declare')}
          </Button>
        </>
      }
    >
      <Stack spacing={2}>
        {herbs.length === 0 ? (
          <Alert severity="info">{t('herb-use-no-combat-items')}</Alert>
        ) : (
          <TextField
            select
            label={t('use-item-item')}
            value={itemId}
            onChange={(event) => setItemId(event.target.value)}
            disabled={busy}
            fullWidth
          >
            {herbs.map((each) => (
              <MenuItem key={each.id} value={each.id}>
                {`${t(each.name, each.name)} (${each.amount})`}
              </MenuItem>
            ))}
          </TextField>
        )}
        {stun ? (
          <Typography variant="body2" color="text.secondary">
            {stun >= ALL_STUN_ROUNDS ? t('item-feature-herb-stun-all') : t('item-feature-herb-stun', { count: stun })}
          </Typography>
        ) : null}
        <SectionLabel>{t('target')}</SectionLabel>
        <CharacterPicker
          variant="compact"
          label={t('target')}
          options={targets.map((each) =>
            toOption(each, each.actorId === actorRound.actorId ? { name: `${each.actorName} (${t('self')})` } : {})
          )}
          groupByFaction
          value={targetId}
          onChange={setTargetId}
          disabled={busy}
        />
        {effects?.heal && (
          <>
            <NumberPadField
              integer
              min={0}
              label={t('herb-use-roll')}
              value={roll}
              onChange={setRoll}
              disabled={busy}
            />
            <Typography variant="caption" color="text.secondary">
              {t('herb-use-roll-help', { min: effects.heal.min, max: effects.heal.max })}
            </Typography>
          </>
        )}
        <Typography variant="caption" color="text.secondary">
          {t('use-item-help')}
        </Typography>
      </Stack>
    </RmuDialog>
  );
};

export default UseItemDeclareDialog;
