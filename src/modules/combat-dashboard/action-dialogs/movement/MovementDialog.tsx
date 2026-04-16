/* eslint-disable react-hooks/exhaustive-deps */
import React, { FC, useContext, useEffect, useState } from 'react';
import { Button, Typography } from '@mui/material';
import { RmuDialog, TechnicalInfo } from '@labcabrera-rmu/rmu-react-shared-lib';
import { t } from 'i18next';
import { CombatContext } from '../../../../CombatContext';
import { useError } from '../../../../ErrorContext';
import { deleteAction, resolveMovement } from '../../../api/action';
import { Action, ActionMovement, ActionRoll } from '../../../api/action.dto';
import { ActorRound } from '../../../api/actor-rounds.dto';
import MovementModifiersForm from './MovementModifiersForm';
import MovementResult from './MovementResult';

const MovementDialog: FC<{
  action: Action;
  actorRound: ActorRound;
  open: boolean;
  onClose: () => void;
}> = ({ action, actorRound, open, onClose }) => {
  const [deleting, setDeleting] = useState(false);
  const { game, strategicGame, roundActions, setRoundActions, updateAction } = useContext(CombatContext)!;
  const { showError } = useError();
  const [formData, setFormData] = useState<ActionMovement>({} as ActionMovement);
  const [isValidForm, setIsValidForm] = useState<boolean>(false);
  const isCompleted = action.status === 'completed';

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
    buttons.push(<Button onClick={onClose}>{t('Close')}</Button>);
    if (!isCompleted) {
      buttons.push(
        <Button color="success" disabled={!isValidForm} onClick={() => onResolve()}>
          {t('Resolve')}
        </Button>
      );
    }
    return buttons;
  };

  const onResolve = () => {
    resolveMovement(action.id, formData)
      .then((result: Action) => {
        updateAction(result);
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

  const validateForm = () => {
    if (!formData || !formData.modifiers) return false;
    if (!formData.modifiers.pace) return false;
    if (!formData.modifiers.requiredManeuver) return true;
    if (!formData.roll || !formData.roll.roll) return false;
    if (!formData.modifiers.difficulty) return false;
    return true;
  };

  useEffect(() => {
    setIsValidForm(validateForm());
  }, [formData]);

  useEffect(() => {
    if (action.movement) {
      setFormData(() => ({
        modifiers: action.movement!.modifiers,
        roll: action.movement?.roll || ({} as ActionRoll),
      }));
    } else {
      setFormData(() => ({
        modifiers: {
          pace: '',
          requiredManeuver: false,
          skillId: 'running',
          difficulty: actorRound.movement?.baseDifficulty || '',
          customBonus: null,
        },
        roll: {
          roll: null,
        },
      }));
    }
  }, [action]);

  if (!actorRound || !roundActions || !formData || !strategicGame || !game) return <p>Loading...</p>;

  return (
    <RmuDialog
      title={actorRound.actorName}
      subtitle={t('Movement')}
      avatarImg={actorRound.imageUrl}
      fullScreen={false}
      open={open}
      buttons={deleting ? buttonsDeleting : getButtons()}
    >
      <>
        {!deleting ? (
          <>
            <MovementModifiersForm
              formData={formData}
              setFormData={setFormData}
              actorRound={actorRound}
              strategicGame={strategicGame}
              action={action}
              game={game}
            />
            <MovementResult action={action} />
            <TechnicalInfo>
              <pre>FormData: {JSON.stringify(formData, null, 2)}</pre>
              <pre>Action: {JSON.stringify(action, null, 2)}</pre>
            </TechnicalInfo>
          </>
        ) : (
          <Typography>Are you sure you want to delete this action?</Typography>
        )}
      </>
    </RmuDialog>
  );
};

export default MovementDialog;
