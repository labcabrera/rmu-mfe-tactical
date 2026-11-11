import { FC, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
import { Alert, Typography } from '@mui/material';
import {
  ALL_STUN_ROUNDS,
  applyActorHerb,
  HerbUseFields,
  RmuDialog,
  useApiNotify,
} from '@labcabrera-rmu/rmu-react-shared-lib';
import { ActorRound } from '../../api/actor-rounds.dto';
import { useCombatActions } from '../../combat/combat-context';
import { useBusyAction } from '../../hooks/useBusyAction';
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
  const notify = useApiNotify();
  const { updateActorRound } = useCombatActions();
  const herbs = useCharacterHerbs(actorRound, open).filter(isCombatHerb);
  const [itemId, setItemId] = useState('');
  const [roll, setRoll] = useState<number | null>(null);
  const { busy: saving, run } = useBusyAction();

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
    run(
      applyActorHerb<ActorRound>(actorRound.id, { itemId: selected.id, ...(roll !== null ? { roll } : {}) }, auth).then(
        (result) => {
          updateActorRound(result.actorRound);
          notify.success(t('herb-use-combat-done', { hits: result.healed, rounds: result.stunRoundsRemoved }));
          onClose();
        }
      )
    );
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
      <HerbUseFields
        numberPad
        herbs={herbs}
        itemId={itemId}
        onItemChange={setItemId}
        empty={<Alert severity="info">{t('herb-use-no-combat-items')}</Alert>}
        info={
          stunText && (
            <Typography variant="body2" color="text.secondary">
              {stunText}
            </Typography>
          )
        }
        heal={effects?.heal}
        roll={roll}
        onRollChange={setRoll}
      />
    </RmuDialog>
  );
};

export default ActorUseHerbDialog;
