/* eslint-disable react-hooks/exhaustive-deps */
import React, { FC, useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
import { Button, Typography } from '@mui/material';
import { RmuDialog, TechnicalInfo, useNotify } from '@labcabrera-rmu/rmu-react-shared-lib';
import { CombatContext } from '../../../../CombatContext';
import { deleteAction, resolveMovement } from '../../../api/action';
import { Action, ActionMovement, ActionRoll } from '../../../api/action.dto';
import { ActorRound } from '../../../api/actor-rounds.dto';
import { isDevelopment } from '../../../services/action-service';
import MovementModifiersForm from './MovementModifiersForm';
import MovementResult from './MovementResult';

const MovementDialog: FC<{
  action: Action;
  actorRound: ActorRound;
  open: boolean;
  onClose: () => void;
}> = ({ action, actorRound, open, onClose }) => {
  const auth = useAuth();
  const { t } = useTranslation();
  const [deleting, setDeleting] = useState(false);
  const { game, strategicGame, roundActions, setRoundActions, updateAction, refreshActorRounds } =
    useContext(CombatContext)!;
  const notify = useNotify();
  const [formData, setFormData] = useState<ActionMovement>({} as ActionMovement);
  const [isValidForm, setIsValidForm] = useState<boolean>(false);
  const isCompleted = action.status === 'completed';

  const buttonsDeleting = [
    <Button color="error" onClick={() => onDelete()}>
      {t('confirm')}
    </Button>,
    <Button onClick={() => setDeleting(false)}>{t('cancel')}</Button>,
  ];

  const getButtons = () => {
    const buttons = [];
    if (!isCompleted) {
      buttons.push(
        <Button color="error" onClick={() => setDeleting(true)}>
          {t('delete')}
        </Button>
      );
    }
    buttons.push(<Button onClick={onClose}>{t('close')}</Button>);
    if (!isCompleted) {
      buttons.push(
        <Button color="success" disabled={!isValidForm} onClick={() => onResolve()}>
          {t('resolve')}
        </Button>
      );
    }
    return buttons;
  };

  const onResolve = () => {
    resolveMovement(action.id, formData, auth)
      .then((result: Action) => {
        updateAction(result);
        refreshActorRounds();
      })
      .catch((err) => notify.error(err));
  };

  const onDelete = () => {
    deleteAction(action.id, auth)
      .then(() => {
        const newActionList = roundActions!.filter((e: Action) => e.id !== action.id);
        setRoundActions(newActionList);
        onClose();
      })
      .catch((err) => notify.error(err));
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

  if (!actorRound || !roundActions || !formData || !strategicGame || !game) return null;

  return (
    <RmuDialog
      title={actorRound.actorName}
      subtitle={t('movement')}
      avatarImg={actorRound.imageUrl}
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
            {isDevelopment && (
              <TechnicalInfo>
                <pre>{JSON.stringify({ formData, action }, null, 2)}</pre>
              </TechnicalInfo>
            )}
          </>
        ) : (
          <Typography>{t('delete-action-confirmation')}</Typography>
        )}
      </>
    </RmuDialog>
  );
};

export default MovementDialog;
