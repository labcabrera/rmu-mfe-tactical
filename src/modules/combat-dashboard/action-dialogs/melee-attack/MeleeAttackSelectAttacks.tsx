import React, { Dispatch, FC, Fragment, SetStateAction, useContext, useState } from 'react';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import DeleteIcon from '@mui/icons-material/Delete';
import {
  Grid,
  Stack,
  Typography,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  IconButton,
  Avatar,
} from '@mui/material';
import { t } from 'i18next';
import { CombatContext } from '../../../../CombatContext';
import { ActionAttack, AttackDeclaration } from '../../../api/action.dto';
import { ActorRound } from '../../../api/actor-rounds.dto';
import AddProtectorDialog from './AddProtectorDialog';
import OffensiveBonusSelector from './OffensiveBonusSelector';
import TargetSelector from './TargetSelector';

//TODO shared model
const PACE_ORDER = ['creep', 'walk', 'jog', 'run', 'sprint', 'dash'];

const MeleeAttackSelectAttacks: FC<{
  formData: AttackDeclaration;
  actorRound: ActorRound;
  setFormData: Dispatch<SetStateAction<AttackDeclaration>>;
  availableAttacks: ActionAttack[];
}> = ({ formData, actorRound, availableAttacks, setFormData }) => {
  const { actorRounds, roundActions } = useContext(CombatContext)!;
  const [selectedAttack, setSelectedAttack] = useState<ActionAttack>();
  const [openProtectorDialog, setOpenProtectorDialog] = useState<boolean>(false);

  const hasStatus = (actorRound: ActorRound, statuses: string[]): boolean => {
    return actorRound.effects?.some((se) => statuses.includes(se.status));
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
    const valid = Array.from(new Set(paces)).filter((p) => PACE_ORDER.includes(p));
    if (valid.length === 0) return paces[0];

    valid.sort((a, b) => PACE_ORDER.indexOf(b) - PACE_ORDER.indexOf(a));
    return valid[0];
  };

  const onTargetSelect = (attackName: string, targetId: string) => {
    const targetActorRound = actorRounds!.find((e) => e.actorId === targetId)!;
    const available = availableAttacks.find((e) => e.attackName === attackName)!;

    const modifiersUpdate = {
      targetId,
      disabledShield: !targetActorRound.defense.shield,
      // TODO check all status values
      disabledDB: hasStatus(targetActorRound, ['dead']),
      pace: findSourceMaxPace(),
      proneTarget: hasStatus(targetActorRound, ['prone', 'dead']),
      stunnedFoe: hasStatus(targetActorRound, ['stunned']),
      surprisedFoe: hasStatus(targetActorRound, ['surprised']),
      positionalSource: 'none',
      positionalTarget: 'none',
      cover: 'none',
      dodge: 'none',
      restrictedQuarters: 'none',
      calledShot: 'none',
      // TODO check two weapon
      restrictedParry: false,
      customBonus: 0,
    } as any;

    setFormData((prev) => {
      const exists = prev.attacks.some((e) => e.attackName === attackName);
      return {
        ...prev,
        attacks: exists
          ? prev.attacks.map((a) =>
              a.attackName === attackName ? { ...a, modifiers: { ...(a.modifiers || {}), ...modifiersUpdate } } : a
            )
          : [...prev.attacks, { ...available, modifiers: { ...(available.modifiers || {}), ...modifiersUpdate } }],
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

  const onDeleteProtector = (attackName: string, protectorId: string) => {
    setFormData((prev) => {
      const attacks = prev.attacks || [];
      const newAttacks = attacks.map((e) =>
        e.attackName === attackName ? { ...e, protectors: (e.protectors || []).filter((p) => p !== protectorId) } : e
      );
      const next = { ...prev, attacks: newAttacks };
      return next;
    });
  };

  if (!availableAttacks || availableAttacks.length < 1) return <p>No available melee attacks</p>;

  if (!actorRound || !actorRound.attacks) return <Typography>No attacks available</Typography>;

  return (
    <Grid container spacing={1}>
      {/* <Grid size={12}>
        <Grid container spacing={1}>
          {availableAttacks.map((attack, index) => {
            return (
              <Grid size={4} key={index}>
                <AvailableAttackCard actionAttack={attack} onClick={() => onAddAttack(attack.attackName)} />
              </Grid>
            );
          })}
        </Grid>
      </Grid> */}
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
                <ProtectorsList
                  attack={attack}
                  actorRounds={actorRounds}
                  onAdd={() => {
                    setSelectedAttack(attack);
                    setOpenProtectorDialog(true);
                  }}
                  onDelete={(protectorId: string) => onDeleteProtector(attack.attackName, protectorId)}
                />
              )}
            </Grid>
            <Grid size={12}></Grid>
          </Fragment>
        );
      })}
      {selectedAttack && actorRound && actorRounds && (
        <AddProtectorDialog
          selectedAttack={selectedAttack}
          actorRound={actorRound}
          actorRounds={actorRounds}
          open={openProtectorDialog}
          onAdd={(actorId) => onAddProtector(selectedAttack.attackName, actorId)}
          onClose={() => setOpenProtectorDialog(false)}
        />
      )}
    </Grid>
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

const ProtectorsList: FC<{
  attack: ActionAttack;
  actorRounds: ActorRound[] | null;
  onAdd: () => void;
  onDelete: (protectorId: string) => void;
}> = ({ attack, actorRounds, onAdd, onDelete }) => {
  if (!actorRounds || !attack) return;
  return (
    <List>
      <ListItem
        secondaryAction={
          <IconButton
            edge="end"
            color="primary"
            onClick={(e) => {
              e.stopPropagation();
              onAdd();
            }}
          >
            <AddCircleIcon />
          </IconButton>
        }
      >
        <ListItemText>{t('Protectors')}</ListItemText>
      </ListItem>
      {(attack.protectors || []).map((protectorId, index) => {
        const actorRound = actorRounds.find((e) => e.actorId === protectorId)!;
        return (
          <ListItem
            key={index}
            secondaryAction={
              <IconButton
                color="primary"
                edge="end"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(protectorId);
                }}
              >
                <DeleteIcon />
              </IconButton>
            }
          >
            <ListItemAvatar>
              <Avatar variant="square" src={actorRound.imageUrl} />
            </ListItemAvatar>
            <ListItemText>{actorRound.actorName}</ListItemText>
          </ListItem>
        );
      })}
    </List>
  );
};

export default MeleeAttackSelectAttacks;
