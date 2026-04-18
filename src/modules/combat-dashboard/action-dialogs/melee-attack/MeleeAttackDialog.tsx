/* eslint-disable react-hooks/exhaustive-deps */
import React, { FC, useContext, useEffect, useState } from 'react';
import { Button, Typography } from '@mui/material';
import { RmuDialog, TechnicalInfo } from '@labcabrera-rmu/rmu-react-shared-lib';
import { t } from 'i18next';
import { CombatContext } from '../../../../CombatContext';
import { useError } from '../../../../ErrorContext';
import { applyAttack, deleteAction, prepareAttack } from '../../../api/action';
import { Action, ActionAttack, AttackDeclaration } from '../../../api/action.dto';
import { ActorRound, ActorRoundAttack } from '../../../api/actor-rounds.dto';
import MeleeAttackStepper from './MeleeAttackStepper';

const MeleeAttackDialog: FC<{
  action: Action;
  actorRound: ActorRound;
  open: boolean;
  onClose: () => void;
}> = ({ action, actorRound, open, onClose }) => {
  const [deleting, setDeleting] = useState(false);
  const { game, strategicGame, roundActions, setRoundActions, updateAction, refreshActorRounds } =
    useContext(CombatContext)!;
  const { showError } = useError();
  const [formData, setFormData] = useState<AttackDeclaration>({ attacks: [], parries: [] });
  const [isValidForm, setIsValidForm] = useState<boolean>(false);
  const isCompleted = action.status === 'completed';
  const [availableAttacks, setAvailableAttaks] = useState<ActionAttack[]>([]);
  const [activeStep, setActiveStep] = useState<number>(0);

  const buttonsDeleting = [
    <Button color="error" onClick={() => onDelete()}>
      {t('Confirm')}
    </Button>,
    <Button onClick={() => setDeleting(false)}>{t('Cancel')}</Button>,
  ];

  const getButtons = () => {
    const buttons = [];
    if (!isCompleted) {
      buttons.push(
        <Button color="error" onClick={() => setDeleting(true)}>
          {t('Delete')}
        </Button>
      );
    }
    if (activeStep === 0) {
      buttons.push(<Button onClick={() => setActiveStep(1)}>{t('Next')}</Button>);
    } else if (activeStep === 1) {
      buttons.push(<Button onClick={() => setActiveStep(0)}>{t('Back')}</Button>);
      // buttons.push(<Button onClick={() => setActiveStep(2)}>{t('Next')}</Button>);
      buttons.push(
        //TODO disabled
        <Button variant="contained" color="success" onClick={onPrepare} disabled={false}>
          {t('Prepare')}
        </Button>
      );
    } else if (activeStep === 2) {
      buttons.push(<Button onClick={() => setActiveStep(0)}>{t('Back')}</Button>);
    }
    buttons.push(<Button onClick={onClose}>{t('Close')}</Button>);
    // if (action.status === 'declared') {
    // }
    if (action.status !== 'completed') {
      buttons.push(
        <Button variant="contained" color="success" onClick={onApply}>
          {t('Apply attack')}
        </Button>
      );
    }
    return buttons;
  };

  const validateForm = () => {
    if (!formData || !formData.attacks || formData.attacks.length < 1) return false;
    const attack = formData.attacks[0];
    if (!attack.modifiers) return false;
    if (!attack.modifiers.targetId) return false;
    if (!attack.modifiers.range) return false;
    return true;
  };

  const onPrepare = () => {
    prepareAttack(action.id, formData)
      .then((data) => {
        updateAction(data);
        // setFormData(data);
      })
      .catch((err) => showError(err.message));
  };

  const onApply = () => {
    applyAttack(action.id)
      .then((updatedAction) => {
        updateAction(updatedAction);
        refreshActorRounds();
      })
      .catch((err) => showError(err.message));
  };

  const onDelete = () => {
    deleteAction(action.id)
      .then(() => {
        const newActionList = roundActions!.filter((e: Action) => e.id !== action.id);
        setRoundActions(newActionList);
        onClose();
      })
      .catch((err) => showError(err.message));
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

  useEffect(() => {
    setIsValidForm(validateForm());
  }, [formData]);

  useEffect(() => {
    if (!action || !actorRound) return;
    const attacks = actorRound.attacks.filter((a) => a.type === 'melee').map(mapActionAttack);
    setAvailableAttaks(attacks);
    switch (action.status) {
      case 'declared': {
        setActiveStep(0);
        break;
      }
      case 'prepared':
        setFormData({ attacks: action.attacks!, parries: [] });
        setActiveStep(2);
        break;
    }
  }, [action, actorRound]);

  // useEffect(() => {
  //   if (actorRound && formData) {
  //     console.log('Loading attacks from actorRound and formData');
  //     formData.attacks?.forEach((attack) => {
  //       const matchingAttack = actorRound.attacks?.find((a) => a.attackName === attack.attackName);
  //       if (!matchingAttack) {
  //         const newAttacks = formData.attacks?.filter((a) => a.attackName !== attack.attackName) || [];
  //         setFormData({ ...formData, attacks: newAttacks });
  //       }
  //     });
  //   }
  // }, [formData]);

  if (!actorRound || !roundActions || !formData || !strategicGame || !game) return <p>Loading...</p>;

  return (
    <RmuDialog
      title={actorRound.actorName}
      subtitle={`${t('Melee attack X')} (${action.status})`}
      avatarImg={actorRound.imageUrl}
      fullScreen={false}
      open={open}
      buttons={deleting ? buttonsDeleting : getButtons()}
    >
      <>
        {!deleting ? (
          <>
            Active Step: {activeStep}
            <MeleeAttackStepper
              action={action}
              actorRound={actorRound}
              formData={formData}
              activeStep={activeStep}
              availableAttacks={availableAttacks}
              setFormData={setFormData}
            />
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
