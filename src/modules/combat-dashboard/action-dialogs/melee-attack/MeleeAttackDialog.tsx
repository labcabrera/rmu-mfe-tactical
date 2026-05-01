/* eslint-disable react-hooks/exhaustive-deps */
import React, { FC, ReactNode, useContext, useEffect, useState } from 'react';
import { Button, Typography } from '@mui/material';
import { RmuDialog, TechnicalInfo } from '@labcabrera-rmu/rmu-react-shared-lib';
import { CombatContext } from '../../../../CombatContext';
import { useError } from '../../../../ErrorContext';
import { applyAttack, declareParry, deleteAction, prepareAttack } from '../../../api/action';
import { Action, ActionAttack, AttackDeclaration, ParryDeclaration } from '../../../api/action.dto';
import { ActorRound, ActorRoundAttack } from '../../../api/actor-rounds.dto';
import MeleeAttackStepper from './MeleeAttackStepper';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';

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
  const { showError } = useError();
  const [formData, setFormData] = useState<AttackDeclaration>({ attacks: [], parries: [] });
  const [availableAttacks, setAvailableAttaks] = useState<ActionAttack[]>([]);
  const [activeStep, setActiveStep] = useState<number>(0);
  const [buttons, setButtons] = useState<ReactNode>([]);
  const [isValidForm, setIsValidForm] = useState<boolean>(false);

  const buttonsDeleting = [
    <Button color="error" onClick={() => onDelete()}>
      {t('Confirm')}
    </Button>,
    <Button onClick={() => setDeleting(false)}>{t('Cancel')}</Button>,
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
    switch (action.status) {
      case 'declared': {
        setActiveStep(0);
        break;
      }
      case 'parry':
        setActiveStep(2);
        break;
      case 'pending_attack_roll':
      case 'prepared':
      case 'pending_apply':
      case 'completed':
        setActiveStep(3);
        break;
      default:
        showError(`Invalid attack status ${action.status}`);
    }
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
    prepareAttack(action.id, formData, auth)
      .then((response) => loadAction(response))
      .catch((err) => showError(err.message));
  };

  const onParry = () => {
    const parries = formData.parries?.map((e) => ({ parryId: e.id, parry: e.parry }));
    const parryDeclaration = { parries } as ParryDeclaration;
    declareParry(action.id, parryDeclaration, auth)
      .then((response) => loadAction(response))
      .catch((err) => showError(err.message));
  };

  const onApply = () => {
    applyAttack(action.id, auth)
      .then((response) => {
        loadAction(response);
        refreshActorRounds();
        updateAction(response);
        onClose();
      })
      .catch((err) => showError(err.message));
  };

  const onDelete = () => {
    deleteAction(action.id, auth)
      .then(() => {
        const newActionList = roundActions!.filter((e: Action) => e.id !== action.id);
        setRoundActions(newActionList);
        onClose();
      })
      .catch((err) => showError(err.message));
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
      pushButton(buttons, 'Delete', 'error', false, () => setDeleting(true));
    }
    pushButton(buttons, 'Close', undefined, false, () => onClose());
    if (activeStep === 0) {
      //TODO check disabled
      pushButton(buttons, 'Next', 'success', !isValidForm, () => onStep1());
    } else if (activeStep === 1) {
      pushButton(buttons, 'Back', undefined, false, () => setActiveStep(activeStep - 1));
      pushButton(buttons, 'Prepare', 'success', false, () => onPrepare());
    } else if (activeStep === 2) {
      pushButton(buttons, 'Back', undefined, false, () => setActiveStep(activeStep - 1));
      pushButton(buttons, 'Parry', 'success', false, () => onParry());
    } else if (activeStep === 3) {
      pushButton(buttons, 'Back', undefined, false, () => setActiveStep(activeStep - 1));
      if (action.status === 'pending_apply' || action.status === 'prepared') {
        pushButton(buttons, 'Apply', 'success', false, () => onApply());
      }
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

  const availableActionPoints = () => {
    //TODO pendiente de refactor de phase string -> number
    const ap = activeStep - action.phaseStart + 3;
    return ap > 1;
  };

  useEffect(() => {
    if (activeStep !== undefined && action) {
      setButtons(getButtons(activeStep, action));
    }
  }, [activeStep, action, formData, isValidForm]);

  useEffect(() => {
    setIsValidForm(validateForm());
  }, [formData]);

  useEffect(() => {
    if (!action || !actorRound) return;
    loadAction(action);
  }, [action, actorRound]);

  if (!actorRound || !roundActions || !formData || !strategicGame || !game) return <p>Loading...</p>;

  return (
    <RmuDialog
      title={actorRound.actorName}
      subtitle={`${t('Melee attack')} (${action.status})`}
      avatarImg={actorRound.imageUrl}
      fullScreen={false}
      open={open}
      buttons={deleting ? buttonsDeleting : buttons}
    >
      <>
        {!deleting ? (
          <>
            {availableActionPoints() ? (
              <MeleeAttackStepper
                action={action}
                actorRound={actorRound}
                formData={formData}
                activeStep={activeStep}
                availableAttacks={availableAttacks}
                setFormData={setFormData}
              />
            ) : (
              <Typography>Not available action points</Typography>
            )}
            <TechnicalInfo>
              <pre>FormData: {JSON.stringify(formData, null, 2)}</pre>
              <pre>ActiveStep: {JSON.stringify(activeStep, null, 2)}</pre>
              <pre>Action: {JSON.stringify(action, null, 2)}</pre>
              <pre>AvailableAttacks: {JSON.stringify(availableAttacks, null, 2)}</pre>
              <pre>ActorRound: {JSON.stringify(actorRound, null, 2)}</pre>
            </TechnicalInfo>
          </>
        ) : (
          <Typography>Are you sure you want to delete this action?</Typography>
        )}
      </>
    </RmuDialog>
  );
};

export default MeleeAttackDialog;
