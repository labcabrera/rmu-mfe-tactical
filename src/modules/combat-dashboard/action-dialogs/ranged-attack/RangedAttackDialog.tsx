/* eslint-disable react-hooks/exhaustive-deps */
import React, { FC, useContext, useEffect, useState } from 'react';
import { Button, Typography } from '@mui/material';
import { RmuDialog, TechnicalInfo } from '@labcabrera-rmu/rmu-react-shared-lib';
import { CombatContext } from '../../../../CombatContext';
import { useError } from '../../../../ErrorContext';
import { applyAttack, deleteAction, prepareAttack } from '../../../api/action';
import { Action, ActionAttack, AttackDeclaration } from '../../../api/action.dto';
import { ActorRound, ActorRoundAttack } from '../../../api/actor-rounds.dto';
import { findMaxActorRoundPace } from '../../../services/actor-round-service';
import RangedAttackForm from './RangedAttackForm';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';

const RangedAttackDialog: FC<{
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
  const { showError } = useError();
  const [formData, setFormData] = useState<AttackDeclaration>({ attacks: [], parries: [] });
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
    if (action.status === 'declared') {
      buttons.push(
        <Button variant="contained" color="success" onClick={onPrepare} disabled={!isValidForm}>
          {t('Prepare')}
        </Button>
      );
    }
    if (action.status !== 'completed') {
      buttons.push(
        <Button variant="contained" color="success" onClick={onApply}>
          {t('Apply attack')}
        </Button>
      );
    }
    return buttons;
  };

  const loadAction = (action: Action) => {
    if (!actorRound) return;
    if (action.attacks && action.attacks.length > 0) {
      setFormData({ attacks: action.attacks || [], parries: action.parries || [] });
    } else {
      const maxPace = findMaxActorRoundPace(actorRound.actorId, roundActions || []);
      const attacks = actorRound.attacks.filter((a) => a.type === 'ranged').map((e) => mapActionAttack(e, maxPace));
      setFormData({ attacks: attacks || [], parries: action.parries || [] });
    }
  };

  const mapActionAttack = (a: ActorRoundAttack, maxPace: string): ActionAttack => {
    return {
      attackName: a.attackName,
      modifiers: {
        targetId: '',
        bo: a.currentBo,
        disabledDB: false,
        disabledShield: false,
        restrictedParry: false,
        customBonus: 0,
        cover: 'none',
        restrictedQuarters: 'none',
        calledShot: 'none',
        dodge: 'none',
        attackerInMelee: false,
        stunnedFoe: false,
        proneSource: false,
        proneTarget: false,
        ambush: false,
        pace: maxPace,
      },
    } as ActionAttack;
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
    prepareAttack(action.id, formData, auth)
      .then((data) => {
        updateAction(data);
        // setFormData(data);
      })
      .catch((err) => showError(err.message));
  };

  const onApply = () => {
    applyAttack(action.id, auth)
      .then((updatedAction) => {
        updateAction(updatedAction);
        refreshActorRounds();
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

  useEffect(() => {
    setIsValidForm(validateForm());
  }, [formData]);

  useEffect(() => {
    if (action && action.attacks) {
      if (action.attacks.length > 0) {
        setFormData({ attacks: action.attacks, parries: [] });
      }
    }
  }, [action]);

  useEffect(() => {
    if (!action || !actorRound) return;
    loadAction(action);
  }, [action, actorRound]);

  if (!actorRound || !roundActions || !formData || !strategicGame || !game) return <p>Loading...</p>;

  return (
    <RmuDialog
      title={actorRound.actorName}
      subtitle={`${t('Ranged attack')} (${action.status})`}
      avatarImg={actorRound.imageUrl}
      fullScreen={false}
      open={open}
      buttons={deleting ? buttonsDeleting : getButtons()}
    >
      <>
        {!deleting ? (
          <>
            <RangedAttackForm actorRound={actorRound} action={action} formData={formData} setFormData={setFormData} />

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

export default RangedAttackDialog;
