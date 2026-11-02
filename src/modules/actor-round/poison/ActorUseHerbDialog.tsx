import React, { FC, useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
import { Alert, MenuItem, Stack, TextField, Typography } from '@mui/material';
import { ALL_STUN_ROUNDS, applyActorHerb, NumberPadField, RmuDialog } from '@labcabrera-rmu/rmu-react-shared-lib';
import { CombatContext } from '../../../CombatContext';
import { ActorRound } from '../../api/actor-rounds.dto';
import { useTacticalNotify } from '../../services/notify-service';
import { isCombatHerb, useCharacterHerbs } from './combat-herbs';

/**
 * Uses a herb the character of the actor carries (spec 062): it heals hits (the roll, or the server rolls the range
 * of the herb) and removes stun rounds. Out of an action and without AP (a game master adjustment). Since workspace
 * spec 068 the actor round records the dose as consumed, and strategic spends it when the outcome of the game is
 * applied; in combat the same is a `use_item` action of 2 AP.
 */
const ActorUseHerbDialog: FC<{ actorRound: ActorRound; open: boolean; onClose: () => void }> = ({
  actorRound,
  open,
  onClose,
}) => {
  const { t } = useTranslation();
  const auth = useAuth();
  const notify = useTacticalNotify();
  const { updateActorRound } = useContext(CombatContext)!;
  const herbs = useCharacterHerbs(actorRound, open).filter(isCombatHerb);
  const [itemId, setItemId] = useState('');
  const [roll, setRoll] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setItemId('');
    setRoll(null);
  }, [open]);

  const selected = herbs.find((each) => each.id === itemId);
  const effects = selected?.catalog?.features?.herb?.effects;
  const stun = effects?.stunRelief;
  const stunText = stun
    ? stun >= ALL_STUN_ROUNDS
      ? t('item-feature-herb-stun-all')
      : t('item-feature-herb-stun', { count: stun })
    : undefined;

  const save = () => {
    if (!selected) return;
    setSaving(true);
    applyActorHerb<ActorRound>(actorRound.id, { itemId: selected.id, ...(roll !== null ? { roll } : {}) }, auth)
      .then((result) => {
        updateActorRound(result.actorRound);
        notify.success(t('herb-use-combat-done', { hits: result.healed, rounds: result.stunRoundsRemoved }));
        onClose();
      })
      .catch(notify.error)
      .finally(() => setSaving(false));
  };

  return (
    <RmuDialog
      open={open}
      title={t('herb-use')}
      subtitle={actorRound.actorName}
      maxWidth="sm"
      onCancel={onClose}
      onConfirm={save}
      onConfirmDisabled={saving || !selected}
    >
      <Stack spacing={2} sx={{ pt: 1 }}>
        {herbs.length === 0 ? (
          <Alert severity="info">{t('herb-use-no-combat-items')}</Alert>
        ) : (
          <TextField
            select
            size="small"
            label={t('item-category-herb')}
            value={itemId}
            onChange={(e) => setItemId(e.target.value)}
          >
            {herbs.map((each) => (
              <MenuItem key={each.id} value={each.id}>
                {`${t(each.name, each.name)} (${each.amount})`}
              </MenuItem>
            ))}
          </TextField>
        )}
        {stunText && (
          <Typography variant="body2" color="text.secondary">
            {stunText}
          </Typography>
        )}
        {effects?.heal && (
          <>
            <NumberPadField
              integer
              min={0}
              allowNegatives={false}
              label={t('herb-use-roll')}
              value={roll}
              onChange={setRoll}
            />
            <Typography variant="caption" color="text.secondary">
              {t('herb-use-roll-help', { min: effects.heal.min, max: effects.heal.max })}
            </Typography>
          </>
        )}
      </Stack>
    </RmuDialog>
  );
};

export default ActorUseHerbDialog;
