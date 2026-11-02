/* eslint-disable react-hooks/exhaustive-deps */
import React, { FC, useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
import { Alert, MenuItem, Stack, TextField, Typography } from '@mui/material';
import {
  ALL_STUN_ROUNDS,
  applyActorHerb,
  discardItem,
  fetchStrategicItems,
  NumberPadField,
  RmuDialog,
  StrategicItem,
} from '@labcabrera-rmu/rmu-react-shared-lib';
import { CombatContext } from '../../../CombatContext';
import { ActorRound } from '../../api/actor-rounds.dto';
import { useTacticalNotify } from '../../services/notify-service';

/** The herbs of a character that work in combat: they heal hits or remove stun (spec 062). */
const isCombatHerb = (item: StrategicItem): boolean => {
  const effects = item.catalog?.features?.herb?.effects;
  return item.category === 'herb' && !!(effects?.heal || effects?.stunRelief);
};

/**
 * Uses a herb the character of the actor carries (spec 062): it heals hits (the roll, or the server rolls the range
 * of the herb) and removes stun rounds. The tactical API does not spend the dose, so the dialog discards one unit of
 * the strategic item afterwards.
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
  const [herbs, setHerbs] = useState<StrategicItem[]>([]);
  const [itemId, setItemId] = useState('');
  const [roll, setRoll] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open || !actorRound.characterId) return;
    setItemId('');
    setRoll(null);
    fetchStrategicItems(`characterId==${actorRound.characterId}`, 0, 1000, auth)
      .then((page) => setHerbs(page.content.filter(isCombatHerb)))
      .catch(notify.error);
  }, [open, actorRound.characterId]);

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
        // Tactical does not spend the dose (like the antidotes of spec 042): one unit of the strategic item goes
        return discardItem(selected.id, { amount: 1, note: t('herb-use-dose-note') }, auth)
          .then(() => setHerbs((list) => list.filter((each) => each.id !== selected.id || each.amount > 1)))
          .catch(notify.error);
      })
      .then(onClose)
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
