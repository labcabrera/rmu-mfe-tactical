import React, { FC, useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Button, MenuItem, Stack, TextField } from '@mui/material';
import { ActionAim, ActionDrawAndLoad, RmuDialog } from '@labcabrera-rmu/rmu-react-shared-lib';
import { CombatContext } from '../../../CombatContext';
import { ActorRound } from '../../api/actor-rounds.dto';
import { apProfileLabel, drawAndLoadApProfile } from '../../services/ap-service';
import { aimWeapons } from '../../services/combat-talents-service';
import { attackLabel } from './flows/attack/attack-label';

export type WeaponActionDeclaration = { drawAndLoad: ActionDrawAndLoad } | { aim: ActionAim };

const NO_WEAPON = '';

/**
 * Declaration of the actions on a weapon of workspace spec 076. `draw_and_load`: the weapon drawn or loaded, optional;
 * with Quickdraw for it the action takes no AP, and with Slow on the Draw while surprised 2 AP. `aim` (Sharpshooter):
 * the foe and the ranged weapon of the talent, a full round.
 */
const WeaponActionDeclareDialog: FC<{
  open: boolean;
  kind: 'draw_and_load' | 'aim';
  actorRound: ActorRound | null;
  busy: boolean;
  onClose: () => void;
  onDeclare: (declaration: WeaponActionDeclaration) => void;
}> = ({ open, kind, actorRound, busy, onClose, onDeclare }) => {
  const { t } = useTranslation();
  const { actorRounds } = useContext(CombatContext)!;
  const [itemId, setItemId] = useState(NO_WEAPON);
  const [targetId, setTargetId] = useState('');

  useEffect(() => {
    if (!open) return;
    setItemId(NO_WEAPON);
    setTargetId('');
  }, [open, kind]);

  if (!actorRound) return null;

  const aim = kind === 'aim';
  // Aiming names the weapon as its attack; drawing any weapon of the actor not dropped
  const weapons = aim
    ? aimWeapons(actorRound).map((attack) => ({ itemId: attack.itemId!, name: attackLabel(attack.attackName, t) }))
    : (actorRound.items ?? [])
        .filter((item) => item.kind === 'weapon' && !item.dropped)
        .map((item) => ({ itemId: item.itemId, name: item.name }));
  const foes = (actorRounds ?? []).filter((each) => each.actorId !== actorRound.actorId);
  const ready = aim ? !!itemId && !!targetId : true;

  const declare = () => {
    if (aim) onDeclare({ aim: { targetActorId: targetId, itemId } });
    else onDeclare({ drawAndLoad: { itemId: itemId || null } });
  };

  return (
    <RmuDialog
      open={open}
      onClose={onClose}
      title={t(aim ? 'aim' : 'draw-and-load')}
      subtitle={actorRound.actorName}
      maxWidth="sm"
      buttons={
        <>
          <Button onClick={onClose} disabled={busy}>
            {t('cancel')}
          </Button>
          <Button variant="contained" onClick={declare} disabled={busy || !ready}>
            {t('declare')}
          </Button>
        </>
      }
    >
      <Stack spacing={2}>
        <Alert severity="info" variant="outlined">
          {t(aim ? 'aim-help' : 'draw-and-load-help')}
        </Alert>
        {aim && (
          <TextField
            select
            size="small"
            label={t('aim-target')}
            value={targetId}
            onChange={(event) => setTargetId(event.target.value)}
          >
            {foes.map((foe) => (
              <MenuItem key={foe.actorId} value={foe.actorId}>
                {foe.actorName}
              </MenuItem>
            ))}
          </TextField>
        )}
        <TextField
          select
          size="small"
          label={t('weapon')}
          value={itemId}
          onChange={(event) => setItemId(event.target.value)}
        >
          {!aim && <MenuItem value={NO_WEAPON}>{t('draw-and-load-no-weapon')}</MenuItem>}
          {weapons.map((weapon) => (
            <MenuItem key={weapon.itemId} value={weapon.itemId}>
              {aim
                ? weapon.name
                : `${weapon.name} · ${apProfileLabel(drawAndLoadApProfile(actorRound, weapon.itemId), t)}`}
            </MenuItem>
          ))}
        </TextField>
      </Stack>
    </RmuDialog>
  );
};

export default WeaponActionDeclareDialog;
