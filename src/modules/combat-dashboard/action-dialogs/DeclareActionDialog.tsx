import React, { useContext, FC, useState } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  TextField,
  FormControl,
  Stack,
  Typography,
  ToggleButtonGroup,
  ToggleButton,
  Slide,
} from '@mui/material';
import { t } from 'i18next';
import { CombatContext } from '../../../CombatContext';
import { useError } from '../../../ErrorContext';
import { createAction } from '../../api/action';
import { ActorRound } from '../../api/actor-rounds.dto';
import ActorRoundAvatar from '../../shared/avatars/ActorRoundAvatar';
import SelectManeuverType from '../../shared/selects/SelectManeuverType';
import SelectSkillByCategory from '../../shared/selects/SelectSkillByCategory';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide children={undefined} direction="up" ref={ref} {...props} />;
});

const actionOptions = [
  {
    key: 'movement',
    title: 'Movement',
    options: [
      { key: 'movement', label: 'Movement', freeAction: true },
      { key: 'stand-up', label: 'Stand up', freeAction: false },
    ],
  },
  {
    key: 'combat',
    title: 'Combat',
    options: [
      { key: 'melee_attack', label: 'Melee', freeAction: false },
      { key: 'ranged_attack', label: 'Ranged', freeAction: false },
      { key: 'draw-and-load', label: 'Load', freeAction: false },
      { key: 'dodge', label: 'Dodge', freeAction: false },
    ],
  },
  {
    key: 'maneuvers',
    title: 'Maneuvers',
    options: [{ key: 'maneuver', label: 'Maneuver', freeAction: true }],
  },
  {
    key: 'spells',
    title: 'Spells',
    options: [
      { key: 'cast_spell', label: 'Spell', freeAction: true },
      { key: 'cast_instant', label: 'Instant', freeAction: true },
    ],
  },
  {
    key: 'other',
    title: 'Other',
    options: [
      { key: 'perception', label: 'Perception', freeAction: true },
      { key: 'medical', label: 'Medical', freeAction: true },
      { key: 'other', label: 'Other', freeAction: false },
    ],
  },
];

const DeclareActionDialog: FC<{
  actorRound: ActorRound;
  phaseNumber: number;
  open: boolean;
  setOpen: (open: boolean) => void;
}> = ({ actorRound, phaseNumber, open, setOpen }) => {
  const { showError } = useError();
  const [actionForm, setActionForm] = useState({
    gameId: actorRound.gameId,
    actorId: actorRound.actorId,
    actionType: null,
    freeAction: false,
    pace: (actorRound as any).movementMode ?? null,
    phaseStart: phaseNumber,
    attackNames: null as string[] | null,
    maneuver: {
      skillId: null as string | null,
      maneuverType: null as string | null,
    },
  });
  const [otherDetails, setOtherDetails] = useState<string>('');
  const { roundActions, setRoundActions } = useContext(CombatContext)!;

  const handleClose = () => {
    setOpen(false);
  };

  const isActionAttack = (actionType: string) => {
    return actionType === 'melee_attack' || actionType === 'ranged_attack';
  };

  const isDisabled = (option: string) => {
    if (option === 'cast_spell' || option === 'cast_instant') {
      return true;
    }
    if (option === 'ranged_attack') {
      return actorRound.attacks.some((attack) => attack.type === 'ranged') ? false : true;
    }
    return false;
  };

  const handleSelectAction = (opt: { key: string; freeAction?: boolean }) => {
    const base = {
      gameId: actorRound.gameId,
      actorId: actorRound.actorId,
      actionType: opt.key,
      freeAction: !!opt.freeAction,
      phaseStart: phaseNumber,
    } as any;

    if (isActionAttack(opt.key)) {
      if (actorRound.attacks && actorRound.attacks.length > 0) {
        base.attackNames = actorRound.attacks.map((a: any) => a.attackName);
      } else {
        base.attackNames = [];
      }
    }

    if (opt.key === 'maneuver') {
      base.maneuver = {
        skillId: null,
        maneuverType: 'absolute',
      };
    }

    setActionForm(base);
  };

  const handleDeclare = () => {
    createAction(actionForm)
      .then((action) => {
        setRoundActions([...roundActions, action]);
        setOpen(false);
      })
      .catch((err) => showError(err.message));
  };

  const filterAttacks = (attacks: any[], actionType: string) => {
    if (actionType === 'melee_attack') {
      return attacks.filter((attack) => attack.type === 'melee');
    }
    if (actionType === 'ranged_attack') {
      return attacks.filter((attack) => attack.type === 'ranged');
    }
    return [];
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="lg" fullWidth slots={{ transition: Transition }}>
      <DialogTitle>
        <Stack direction="row" spacing={2} alignItems="center">
          <ActorRoundAvatar actorRound={actorRound} size={100} variant="square" />
          <Stack direction="column">
            <Typography variant="h6">{actorRound.actorName}</Typography>
            <Typography variant="subtitle1">Action Declaration</Typography>
            <Typography variant="subtitle1">Additional information here</Typography>
          </Stack>
        </Stack>
      </DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={1}>
          <Grid size={6}>
            <Grid container spacing={1}>
              {actionOptions.map((group) => (
                <Grid size={12}>
                  <FormControl key={group.key} sx={{ mt: 1 }}>
                    <ToggleButtonGroup value={actionForm.actionType} exclusive>
                      {group.options.map((opt) => (
                        <Grid key={opt.key}>
                          <ToggleButton
                            value={opt.key}
                            onClick={() => handleSelectAction(opt)}
                            disabled={isDisabled(opt.key)}
                            sx={{ minWidth: 100 }}
                            size="small"
                          >
                            {opt.label}
                          </ToggleButton>
                        </Grid>
                      ))}
                    </ToggleButtonGroup>
                  </FormControl>
                </Grid>
              ))}
            </Grid>
          </Grid>

          <Grid size={6}>
            {actionForm.actionType && (
              <FormControl sx={{ mt: 1 }}>
                <ToggleButtonGroup
                  value={actionForm.freeAction ? 'free' : 'normal'}
                  exclusive
                  size="small"
                  onChange={(_, val) => {
                    const next = val === 'free';
                    setActionForm({ ...actionForm, freeAction: next });
                  }}
                >
                  <ToggleButton value="normal" size="small" sx={{ minWidth: 100 }}>
                    Normal
                  </ToggleButton>
                  <ToggleButton value="free" size="small" sx={{ minWidth: 100 }}>
                    Free
                  </ToggleButton>
                </ToggleButtonGroup>
              </FormControl>
            )}

            <div style={{ marginTop: 16 }}>
              {isActionAttack(actionForm.actionType) && (
                <>
                  {actorRound.attacks && actorRound.attacks.length > 0 && (
                    <Grid container spacing={1} sx={{ mt: 1 }}>
                      {filterAttacks(actorRound.attacks, actionForm.actionType).map((atk: any) => {
                        const selected = actionForm.attackNames && actionForm.attackNames.includes(atk.attackName);
                        const toggleAttack = (attackName: string) => {
                          const current: string[] = actionForm.attackNames || [];
                          const exists = current.includes(attackName);
                          let next: string[];
                          if (exists) {
                            next = current.filter((n) => n !== attackName);
                          } else {
                            next = [...current, attackName];
                          }
                          setActionForm({ ...actionForm, attackNames: next });
                        };

                        return (
                          <Grid key={atk.attackName}>
                            <Button
                              size="small"
                              variant={selected ? 'contained' : 'outlined'}
                              color={selected ? 'warning' : 'secondary'}
                              onClick={() => toggleAttack(atk.attackName)}
                            >
                              {atk.attackName}
                            </Button>
                          </Grid>
                        );
                      })}
                    </Grid>
                  )}
                </>
              )}
              {actionForm.actionType === 'maneuver' && (
                <>
                  <SelectManeuverType
                    value={actionForm.maneuver.maneuverType || ''}
                    onChange={(maneuverType: string): void => {
                      setActionForm({
                        ...actionForm,
                        maneuver: {
                          ...actionForm.maneuver,
                          maneuverType,
                        },
                      });
                    }}
                  />
                  <SelectSkillByCategory
                    value={actionForm.maneuver.skillId || ''}
                    onChange={(skillId: string): void => {
                      setActionForm({
                        ...actionForm,
                        maneuver: {
                          ...actionForm.maneuver,
                          skillId,
                        },
                      });
                    }}
                  />
                </>
              )}

              {actionForm.actionType === 'other' && (
                <TextField
                  label="Details"
                  value={otherDetails}
                  onChange={(e) => setOtherDetails(e.target.value)}
                  fullWidth
                  multiline
                  rows={3}
                  sx={{ mt: 1 }}
                />
              )}
            </div>
            {/* <pre>{JSON.stringify(actionForm, null, 2)}</pre> */}
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>{t('close')}</Button>
        <Button disabled={!actionForm.actionType} onClick={handleDeclare}>
          Declare
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeclareActionDialog;
