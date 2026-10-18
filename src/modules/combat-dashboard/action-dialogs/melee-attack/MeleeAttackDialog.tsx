/* eslint-disable react-hooks/exhaustive-deps */
import React, { FC, ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
import { alpha, Box, Button, Card, CardContent, CardMedia, Chip, Divider, Stack, Typography } from '@mui/material';
import { resolveAssetUrl, RmuDialog, TechnicalInfo, useNotify } from '@labcabrera-rmu/rmu-react-shared-lib';
import { CombatContext } from '../../../../CombatContext';
import { applyAttack, declareParry, deleteAction, prepareAttack } from '../../../api/action';
import { Action, ActionAttack, AttackDeclaration, ParryDeclaration } from '../../../api/action.dto';
import { ActorRound, ActorRoundAttack } from '../../../api/actor-rounds.dto';
import { attackActionPoints, isDevelopment, meleeStepForStatus } from '../../../services/action-service';
import MeleeAttackStepper from './MeleeAttackStepper';

const MeleeAttackDialog: FC<{
  action: Action;
  actorRound: ActorRound;
  open: boolean;
  onClose: () => void;
}> = ({ action, actorRound, open, onClose }) => {
  const auth = useAuth();
  const { t } = useTranslation();
  const [deleting, setDeleting] = useState(false);
  const { game, strategicGame, roundActions, setRoundActions, refreshActorRounds, updateAction } =
    useContext(CombatContext)!;
  const notify = useNotify();
  const [formData, setFormData] = useState<AttackDeclaration>({ attacks: [], parries: [] });
  const [availableAttacks, setAvailableAttaks] = useState<ActionAttack[]>([]);
  // Steps the user moves to by hand (next/back). `null` follows the action status.
  const [manualStep, setManualStep] = useState<number | null>(null);
  const [isValidForm, setIsValidForm] = useState<boolean>(false);
  // Last action returned by the API from this dialog, so the dialog moves on without waiting for the board's state.
  const [responseAction, setResponseAction] = useState<Action | null>(null);
  const currentAction = useMemo(() => {
    const roundAction = roundActions?.find((a: Action) => a.id === action.id) || action;
    return responseAction && responseAction.id === roundAction.id ? responseAction : roundAction;
  }, [action, roundActions, responseAction]);
  const activeStep = manualStep ?? meleeStepForStatus(currentAction.status);
  const setActiveStep = (step: number) => setManualStep(step);

  const buttonsDeleting = [
    <Button color="error" onClick={() => onDelete()}>
      {t('confirm')}
    </Button>,
    <Button onClick={() => setDeleting(false)}>{t('cancel')}</Button>,
  ];

  const loadAction = (action: Action) => {
    if (!actorRound) return;
    if (action.attacks && action.attacks.length > 0) {
      setFormData({ attacks: action.attacks || [], parries: action.parries || [] });
    } else {
      const attacks = actorRound.attacks.filter((a) => a.type === 'melee').map(mapActionAttack);
      setAvailableAttaks(attacks);
      setFormData({ attacks: attacks || [], parries: action.parries || [] });
    }
    const knownStatuses = [
      'declared',
      'prepared',
      'parry',
      'pending_roll',
      'pending_attack_roll',
      'critical_or_fumble_roll',
      'pending_apply',
      'completed',
    ];
    if (!knownStatuses.includes(action.status)) {
      notify.error(t('invalid-attack-status', { status: action.status }));
    }
  };

  /** Refreshes the dialog from an API response: the step is recomputed from the new status. */
  const onActionResponse = (response: Action) => {
    updateAction(response);
    setResponseAction(response);
    setManualStep(null);
    loadAction(response);
  };

  const validateForm = () => {
    if (!formData || !formData.attacks || formData.attacks.length < 1 || activeStep === undefined) return false;
    if (activeStep === 0) {
      return formData.attacks.some((e) => e.modifiers.targetId !== '');
    }
    //TODO
    const attack = formData.attacks[0];
    if (!attack.modifiers) return false;
    if (!attack.modifiers.targetId) return false;
    if (!attack.modifiers.range) return false;
    return true;
  };

  const onPrepare = () => {
    prepareAttack(currentAction.id, formData, auth)
      .then(onActionResponse)
      .catch((err) => notify.error(err));
  };

  const onParry = () => {
    const parries = formData.parries?.map((e) => ({ parryId: e.id, parry: e.parry }));
    const parryDeclaration = { parries } as ParryDeclaration;
    declareParry(currentAction.id, parryDeclaration, auth)
      .then(onActionResponse)
      .catch((err) => notify.error(err));
  };

  const onApply = () => {
    applyAttack(currentAction.id, auth)
      .then((response) => {
        refreshActorRounds();
        onActionResponse(response);
        onClose();
      })
      .catch((err) => notify.error(err));
  };

  const onDelete = () => {
    deleteAction(currentAction.id, auth)
      .then(() => {
        const newActionList = roundActions!.filter((e: Action) => e.id !== currentAction.id);
        setRoundActions(newActionList);
        onClose();
      })
      .catch((err) => notify.error(err));
  };

  const onStep1 = () => {
    // Cleanup attacks with no target declared
    setFormData((prev) => ({
      ...prev,
      attacks: (prev.attacks || []).filter((e) => e.modifiers && e.modifiers.targetId !== ''),
    }));
    setActiveStep(1);
  };

  const mapActionAttack = (a: ActorRoundAttack): ActionAttack => {
    return {
      attackName: a.attackName,
      modifiers: {
        targetId: '',
        bo: a.currentBo,
        disabledDB: false,
        disabledShield: false,
        disabledParry: false,
        restrictedParry: false,
        customBonus: 0,
      },
    } as ActionAttack;
  };

  const getButtons = (activeStep: number, action: Action) => {
    const buttons: ReactNode[] = [];
    if (action.status !== 'completed') {
      pushButton(buttons, 'delete', 'error', false, () => setDeleting(true));
    }
    pushButton(buttons, 'close', undefined, false, () => onClose());
    if (activeStep === 0) {
      //TODO check disabled
      pushButton(buttons, 'next', 'success', !isValidForm, () => onStep1());
    } else if (activeStep === 1) {
      pushButton(buttons, 'back', undefined, false, () => setActiveStep(activeStep - 1));
      pushButton(buttons, 'prepare', 'success', false, () => onPrepare());
    } else if (activeStep === 2) {
      pushButton(buttons, 'back', undefined, false, () => setActiveStep(activeStep - 1));
      pushButton(buttons, 'parry', 'success', false, () => onParry());
    } else if (activeStep === 3) {
      pushButton(buttons, 'back', undefined, false, () => setActiveStep(activeStep - 1));
      pushButton(buttons, 'apply', 'success', action.status !== 'pending_apply', () => onApply());
      // if (action.status === 'pending_apply') {
      // }
      // pushButton(buttons, 'Apply2', 'success', false, () => onApply());
    }
    return buttons;
  };

  const pushButton = (
    buttons: ReactNode[],
    label: string,
    color: 'error' | 'success' | undefined,
    disabled: boolean,
    onClick: () => void
  ) => {
    buttons.push(
      <Button variant="contained" color={color} onClick={onClick} disabled={disabled}>
        {t(label)}
      </Button>
    );
  };

  // Once prepared, the action points are fixed. Before that, they come from the game phase (as in the API's prepare).
  const availableActionPoints = () => {
    if (currentAction.status !== 'declared' || currentAction.freeAction) return true;
    return attackActionPoints(currentAction, game!) > 0;
  };

  useEffect(() => {
    setIsValidForm(validateForm());
  }, [formData]);

  useEffect(() => {
    if (!currentAction || !actorRound) return;
    loadAction(currentAction);
  }, [currentAction, actorRound]);

  // The board's state caught up (or changed elsewhere, e.g. a roll): follow it again.
  useEffect(() => {
    if (roundActions?.some((a) => a.id === action.id)) setResponseAction(null);
  }, [roundActions]);

  // A new status (from any form of the dialog) moves the stepper to its step.
  useEffect(() => {
    setManualStep(null);
  }, [currentAction.status]);

  if (!actorRound || !roundActions || !formData || !strategicGame || !game) return null;

  return (
    <RmuDialog
      title={actorRound.actorName}
      subtitle={`${t('melee-attack')} (${t(`action-status-${currentAction.status}`)})`}
      open={open}
      paperSx={(theme) => ({
        bgcolor: alpha(theme.palette.background.default, 0.98),
        color: theme.palette.text.primary,
        border: '1px solid',
        borderColor: alpha(theme.palette.primary.main, 0.18),
        boxShadow: `0 24px 80px ${alpha(theme.palette.common.black, 0.72)}`,
        '& .MuiDialogTitle-root': {
          borderBottom: '1px solid',
          borderColor: alpha(theme.palette.divider, 0.72),
          bgcolor: alpha(theme.palette.common.black, 0.22),
        },
        '& .MuiDialogContent-root': {
          p: 0,
        },
        '& .MuiDialogActions-root': {
          px: 3,
          py: 2,
          borderTop: '1px solid',
          borderColor: alpha(theme.palette.divider, 0.72),
          bgcolor: alpha(theme.palette.common.black, 0.24),
        },
      })}
      buttons={deleting ? buttonsDeleting : getButtons(activeStep, currentAction)}
    >
      <Box
        sx={(theme) => ({
          p: 3,
          minHeight: 520,
          color: 'text.primary',
          bgcolor: alpha(theme.palette.common.black, 0.55),
          backgroundImage: `linear-gradient(135deg, ${alpha(theme.palette.background.default, 0.96)}, ${alpha(theme.palette.background.paper, 0.86)})`,
        })}
      >
        {!deleting ? (
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2.5} sx={{ alignItems: 'stretch' }}>
            <AttackerCard actorRound={actorRound} action={currentAction} />
            <Stack spacing={2} sx={{ flex: 1, minWidth: 0 }}>
              <Box
                sx={(theme) => ({
                  minHeight: 360,
                  p: 2,
                  border: '1px solid',
                  borderColor: alpha(theme.palette.primary.main, 0.18),
                  borderRadius: 1,
                  bgcolor: alpha(theme.palette.background.paper, 0.72),
                  boxShadow: `inset 0 1px 0 ${alpha(theme.palette.common.white, 0.04)}`,
                })}
              >
                {availableActionPoints() ? (
                  <MeleeAttackStepper
                    action={currentAction}
                    actorRound={actorRound}
                    formData={formData}
                    activeStep={activeStep}
                    availableAttacks={availableAttacks}
                    setFormData={setFormData}
                  />
                ) : (
                  <Typography color="text.secondary">{t('no-available-action-points')}</Typography>
                )}
              </Box>
              <Box
                sx={(theme) => ({
                  '& > *': {
                    borderRadius: 1,
                    bgcolor: alpha(theme.palette.common.black, 0.26),
                    border: '1px solid',
                    borderColor: alpha(theme.palette.divider, 0.75),
                    overflow: 'hidden',
                  },
                })}
              >
                {isDevelopment && (
                  <TechnicalInfo>
                    <pre>
                      {JSON.stringify(
                        { formData, activeStep, action: currentAction, availableAttacks, actorRound },
                        null,
                        2
                      )}
                    </pre>
                  </TechnicalInfo>
                )}
              </Box>
            </Stack>
          </Stack>
        ) : (
          <Box
            sx={(theme) => ({
              p: 2,
              borderRadius: 1,
              border: '1px solid',
              borderColor: alpha(theme.palette.error.main, 0.35),
              bgcolor: alpha(theme.palette.error.dark, 0.12),
            })}
          >
            <Typography>{t('delete-action-confirmation')}</Typography>
          </Box>
        )}
      </Box>
    </RmuDialog>
  );
};

const AttackerCard: FC<{ actorRound: ActorRound; action: Action }> = ({ actorRound, action }) => {
  const { t } = useTranslation();

  return (
    <Card
      elevation={0}
      sx={(theme) => ({
        width: { xs: '100%', md: 220 },
        flex: '0 0 auto',
        borderRadius: 1,
        border: '1px solid',
        borderColor: alpha(theme.palette.primary.main, 0.22),
        bgcolor: alpha(theme.palette.background.paper, 0.78),
        overflow: 'hidden',
      })}
    >
      <CardMedia
        component="img"
        image={resolveAssetUrl(actorRound.imageUrl)}
        alt={actorRound.actorName}
        sx={{
          height: 180,
          objectFit: 'cover',
          filter: 'grayscale(0.22) contrast(0.95) brightness(0.78)',
        }}
      />
      <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
        <Stack spacing={1.25}>
          <Box>
            <Typography variant="h6" color="primary.light" sx={{ fontWeight: 700, lineHeight: 1.1 }}>
              {actorRound.actorName}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t('melee-attack')}
            </Typography>
          </Box>
          <Divider />
          <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', rowGap: 1 }}>
            <Chip size="small" label={t(`action-status-${action.status}`)} color="primary" variant="outlined" />
            <Chip size="small" label={`${t('phase')} ${action.phaseStart}`} variant="outlined" />
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default MeleeAttackDialog;
