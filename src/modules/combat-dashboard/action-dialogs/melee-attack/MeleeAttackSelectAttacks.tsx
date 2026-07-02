import React, { Dispatch, FC, SetStateAction, useContext, useState } from 'react';
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
  Box,
  Paper,
  alpha,
} from '@mui/material';
import { CombatContext } from '../../../../CombatContext';
import { ActionAttack, AttackDeclaration } from '../../../api/action.dto';
import { ActorRound } from '../../../api/actor-rounds.dto';
import {
  findMaxActorRoundPace,
  isActorRoundDisabled,
  isActorRoundProne,
  isActorRoundStunned,
} from '../../../services/actor-round-service';
import AddProtectorDialog from './AddProtectorDialog';
import OffensiveBonusSelector from './OffensiveBonusSelector';
import TargetSelector from './TargetSelector';
import { useTranslation } from 'react-i18next';

const MeleeAttackSelectAttacks: FC<{
  formData: AttackDeclaration;
  actorRound: ActorRound;
  setFormData: Dispatch<SetStateAction<AttackDeclaration>>;
  availableAttacks: ActionAttack[];
}> = ({ formData, actorRound, availableAttacks, setFormData }) => {
  const { t } = useTranslation();
  const { actorRounds, roundActions } = useContext(CombatContext)!;
  const [selectedAttack, setSelectedAttack] = useState<ActionAttack>();
  const [openProtectorDialog, setOpenProtectorDialog] = useState<boolean>(false);

  const hasStatus = (actorRound: ActorRound, statuses: string[]): boolean => {
    return actorRound.effects?.some((se) => statuses.includes(se.status));
  };

  const onTargetSelect = (attackName: string, targetId: string) => {
    const targetActorRound = actorRounds!.find((e) => e.actorId === targetId)!;
    const available = availableAttacks.find((e) => e.attackName === attackName)!;
    const maxPace = findMaxActorRoundPace(actorRound.actorId, roundActions || []);

    const isTargetDisabled = isActorRoundDisabled(actorRound);

    const modifiersUpdate = {
      targetId,
      disabledShield: !targetActorRound.defense.shield || isTargetDisabled,
      disabledDB: isTargetDisabled,
      pace: maxPace,
      proneTarget: isActorRoundProne(actorRound),
      stunnedFoe: isActorRoundStunned(actorRound),
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
    <Grid container spacing={1.5} sx={{ mt: 1 }}>
      {formData.attacks.map((attack, index) => {
        const targetId = attack.modifiers.targetId;
        const actorRoundAttack = actorRound.attacks.find((e) => e.attackName === attack.attackName)!;
        const targetActorRound = targetId ? actorRounds?.find((e) => e.actorId === targetId) : null;
        return (
          <Grid size={12} key={index}>
            <Paper
              elevation={0}
              sx={(theme) => ({
                p: 1.5,
                borderRadius: 1,
                border: '1px solid',
                borderColor: alpha(theme.palette.primary.main, 0.16),
                bgcolor: alpha(theme.palette.common.black, 0.2),
              })}
            >
              <Grid container spacing={1.5} sx={{ alignItems: 'center' }}>
                <Grid size={{ xs: 12, md: 2 }}>
                  <Stack direction="column" spacing={0.25}>
                    <Typography variant="h6" color="primary.light" sx={{ lineHeight: 1.1 }}>
                      {t(attack.attackName)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {t(actorRoundAttack.attackTable)}: {actorRoundAttack.currentBo}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {t('Base BO')}: {actorRoundAttack.baseBo}
                    </Typography>
                  </Stack>
                </Grid>
                <Grid size={{ xs: 12, md: 2 }}>
                  <TargetSelector
                    value={attack.modifiers.targetId}
                    sourceId={actorRound.actorId}
                    onChange={(e) => onTargetSelect(attack.attackName, e!)}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 2 }}>
                  {targetActorRound ? (
                    <TargetInfo target={targetActorRound} />
                  ) : (
                    <Box
                      sx={(theme) => ({
                        px: 1.25,
                        py: 1,
                        borderRadius: 1,
                        border: '1px dashed',
                        borderColor: alpha(theme.palette.primary.light, 0.22),
                        color: 'text.secondary',
                      })}
                    >
                      <Typography variant="body2" fontStyle="italic">
                        Select target
                      </Typography>
                    </Box>
                  )}
                </Grid>
                <Grid size={{ xs: 12, md: 3 }}>
                  {attack.modifiers.targetId && (
                    <OffensiveBonusSelector
                      value={attack.modifiers.bo || 0}
                      max={actorRoundAttack.currentBo || 0}
                      onChange={(bo) => onBoChange(attack.attackName, bo)}
                    />
                  )}
                </Grid>
                <Grid size={{ xs: 12, md: 3 }}>
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
              </Grid>
            </Paper>
          </Grid>
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
  const { t } = useTranslation();
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
