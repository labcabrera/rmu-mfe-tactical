import React, { Dispatch, FC, Fragment, SetStateAction, useContext, useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogActions,
  List,
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Button,
  Grid,
  Stack,
  Typography,
  DialogContent,
  FormControlLabel,
  FormGroup,
  Switch,
  ListItemButton,
} from '@mui/material';
import { t } from 'i18next';
import { CombatContext } from '../../../../CombatContext';
import { ActionAttack, AttackDeclaration } from '../../../api/action.dto';
import { ActorRound } from '../../../api/actor-rounds.dto';
import OffensiveBonusSelector from './OffensiveBonusSelector';
import TargetSelector from './TargetSelector';

const MeleeAttackSelectAttacks: FC<{
  formData: AttackDeclaration;
  actorRound: ActorRound;
  setFormData: Dispatch<SetStateAction<AttackDeclaration>>;
  availableAttacks: ActionAttack[];
}> = ({ formData, actorRound, availableAttacks, setFormData }) => {
  const { actorRounds, roundActions } = useContext(CombatContext)!;
  const [sourceActorId, setSourceActorId] = useState<String>();
  const [openProtectorDialog, setOpenProtectorDialog] = useState<boolean>(false);
  const paceOrder = ['creep', 'walk', 'jog', 'run', 'sprint', 'dash'];

  const hasStatus = (actorRound: ActorRound, status: string): boolean => {
    return actorRound.effects?.some((se) => se.status === status);
  };

  const findSourceMaxPace = (): string => {
    const actions = (roundActions || []).filter(
      (ra) => ra.actorId === actorRound.actorId && ra.actionType === 'movement'
    );
    if (!actions || actions.length === 0) return 'creep';
    const paces = actions
      .map((a) => a.movement?.modifiers?.pace)
      .filter((p): p is string => typeof p === 'string' && p !== '');
    if (paces.length === 0) return 'creep';
    const valid = Array.from(new Set(paces)).filter((p) => paceOrder.includes(p));
    if (valid.length === 0) return paces[0];

    valid.sort((a, b) => paceOrder.indexOf(b) - paceOrder.indexOf(a));
    return valid[0];
  };

  const onAddAttack = (attackName: string) => {
    const available = availableAttacks.find((e) => e.attackName === attackName)!;
    setFormData((prev) => ({
      ...prev,
      attacks: [...prev.attacks, available],
    }));
  };

  const onTargetSelect = (attackName: string, targetId: string) => {
    const targetActorRound = actorRounds!.find((e) => e.actorId === targetId)!;
    const available = availableAttacks.find((e) => e.attackName === attackName)!;

    available.modifiers.targetId = targetId;
    available.modifiers.disabledShield = !targetActorRound.defense.shield;
    //TODO check all status values
    available.modifiers.disabledDB = hasStatus(targetActorRound, 'dead');
    available.modifiers.pace = findSourceMaxPace();
    available.modifiers.proneTarget = hasStatus(targetActorRound, 'prone');
    available.modifiers.stunnedFoe = hasStatus(targetActorRound, 'stunned');
    available.modifiers.surprisedFoe = hasStatus(targetActorRound, 'surprised');
    available.modifiers.positionalSource = 'none';
    available.modifiers.positionalTarget = 'none';
    available.modifiers.cover = 'none';
    available.modifiers.dodge = 'none';
    available.modifiers.restrictedQuarters = 'none';
    available.modifiers.calledShot = 'none';
    //TODO check two weapon
    available.modifiers.restrictedParry = false;
    available.modifiers.customBonus = 0;

    setFormData((prev) => {
      const exists = prev.attacks.some((e) => e.attackName === attackName);
      return {
        ...prev,
        attacks: exists
          ? prev.attacks.map((a) =>
              a.attackName === attackName ? { ...a, modifiers: { ...a.modifiers, targetId } } : a
            )
          : [...prev.attacks, available],
      };
    });
  };

  const onBoChange = (attackName: string, bo: number) => {
    setFormData((prev) => {
      const attacks = prev.attacks || [];
      const newAttacks = attacks.map((e) =>
        e.attackName === attackName ? { ...e, modifiers: { ...(e.modifiers || {}), bo } } : e
      );
      const next = { ...prev, attacks: newAttacks };
      console.warn('On bo change', attackName, bo, { prev, next });
      return next;
    });
  };

  const onAddProtector = (attackName: string, actorId: string) => {
    setFormData((prev) => {
      const attacks = prev.attacks || [];
      const newAttacks = attacks.map((e) =>
        e.attackName === attackName ? { ...e, protectors: [...(e.protectors || []), actorId] } : e
      );
      const next = { ...prev, attacks: newAttacks };
      return next;
    });
  };

  if (!availableAttacks || availableAttacks.length < 1) return <p>No available melee attacks</p>;

  if (!actorRound || !actorRound.attacks) return <Typography>No attacks available</Typography>;

  return (
    <Grid container spacing={1}>
      <Grid size={12}>
        <Grid container spacing={1}>
          {availableAttacks.map((attack, index) => {
            return (
              <Grid size={4} key={index}>
                <AvailableAttackCard actionAttack={attack} onClick={() => onAddAttack(attack.attackName)} />
              </Grid>
            );
          })}
        </Grid>
      </Grid>
      {formData.attacks.map((attack, index) => {
        const targetId = attack.modifiers.targetId;
        const actorRoundAttack = actorRound.attacks.find((e) => e.attackName === attack.attackName)!;
        const targetActorRound = targetId ? actorRounds?.find((e) => e.actorId === targetId) : null;
        return (
          <Fragment key={index}>
            <Grid size={2}>
              <Stack direction="column"></Stack>
              <Typography variant="h6" color="primary">
                {t(attack.attackName)}
              </Typography>
              <Typography variant="body2" color="secondary">
                {t(actorRoundAttack.attackTable)}: {actorRoundAttack.currentBo} ({actorRoundAttack.baseBo})
              </Typography>
            </Grid>
            <Grid size={2}>
              <TargetSelector
                value={attack.modifiers.targetId}
                sourceId={actorRound.actorId}
                onChange={(e) => onTargetSelect(attack.attackName, e!)}
              />
            </Grid>
            <Grid size={2}>{targetActorRound && <TargetInfo target={targetActorRound} />}</Grid>
            <Grid size={3}>
              {attack.modifiers.targetId && (
                <OffensiveBonusSelector
                  value={attack.modifiers.bo || 0}
                  max={actorRoundAttack.currentBo || 0}
                  onChange={(bo) => onBoChange(attack.attackName, bo)}
                />
              )}
            </Grid>
            <Grid size={3}>
              {attack.modifiers.targetId && (
                <>
                  <Button
                    onClick={() => {
                      setSourceActorId(actorRound.actorId);
                      setOpenProtectorDialog(true);
                    }}
                  >
                    Add protector
                  </Button>
                  <pre>{JSON.stringify(attack.protectors, null, 2)}</pre>
                </>
              )}
            </Grid>
            <Grid size={12}></Grid>
          </Fragment>
        );
      })}
      {sourceActorId && actorRounds && (
        <AddProtectDialog
          sourceActorId={sourceActorId}
          open={openProtectorDialog}
          actorRounds={actorRounds}
          onAdd={(actorId) => onAddProtector(selectedAttack.attackName, actorId)}
          onRemove={(actorId) => {}}
          onClose={() => setOpenProtectorDialog(false)}
        />
      )}
    </Grid>
  );
};

const AvailableAttackCard: FC<{
  actionAttack: ActionAttack;
  onClick: () => void;
}> = ({ actionAttack, onClick }) => {
  return (
    <Card onClick={onClick}>
      <CardContent>
        <Typography>{t(actionAttack.attackName)}</Typography>
        <Typography>BO: {actionAttack.modifiers.bo}</Typography>
      </CardContent>
    </Card>
  );
};

const TargetInfo: FC<{
  target: ActorRound;
}> = ({ target }) => {
  const at = target.defense.at
    ? `${target.defense.at}`
    : `${target.defense.headAt}-${target.defense.bodyAt}-${target.defense.armsAt}-${target.defense.legsAt}`;

  return (
    <Stack direction={'column'} spacing={1}>
      <Typography>{target.actorName}</Typography>
      <Typography>BD: {target.defense.bd}</Typography>
      <Typography>AT: {at}</Typography>
    </Stack>
  );
};

const AddProtectDialog: FC<{
  sourceActorId: string;
  actorRounds: ActorRound[];
  open: boolean;
  onAdd: (actorId: string) => void;
  onClose: () => void;
}> = ({ sourceActorId, actorRounds, open, onAdd, onClose }) => {
  const [displayAll, setDisplayAll] = useState<boolean>(false);
  const [availableActors, setAvailableActors] = useState<ActorRound[]>([]);

  useEffect(() => {
    if (!actorRounds) return;
    let list = actorRounds.filter((a) => a.actorId !== sourceActorId);
    if (!displayAll) {
      const factionId = actorRounds.find((e) => e.actorId === sourceActorId)!.factionId;
      list = list.filter((e) => e.factionId !== factionId);
    }
    setAvailableActors(list);
  }, [displayAll]);

  const handleAdd = (actorId: string) => {
    onAdd(actorId);
    onClose();
  };

  return (
    <Dialog open={open} onClose={() => onClose && onClose()} fullWidth maxWidth="sm">
      <DialogTitle>{t('Select protector')}</DialogTitle>
      <DialogContent>
        <FormGroup>
          <FormControlLabel value={displayAll} control={<Switch />} label="All" onChange={(e, v) => setDisplayAll(v)} />
        </FormGroup>
        <List>
          {availableActors.map((actor, index) => {
            const isSelected = false;
            return (
              <ListItem key={index}>
                <ListItemButton selected={isSelected} onClick={() => handleAdd(actor.actorId)}>
                  <ListItemAvatar>
                    <Avatar src={actor.imageUrl || undefined} alt={actor.actorName} />
                  </ListItemAvatar>
                  <ListItemText
                    primary={actor.actorName}
                    secondary={`${t('Protect')}: ${actor.defense?.protect ?? 0}`}
                  />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => onClose()}>{t('Close')}</Button>
      </DialogActions>
    </Dialog>
  );
};

export default MeleeAttackSelectAttacks;
