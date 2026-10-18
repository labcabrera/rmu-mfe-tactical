/* eslint-disable react-hooks/exhaustive-deps */
import React, { FC, useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
import { Button, Typography } from '@mui/material';
import { RmuDialog, TechnicalInfo, useNotify } from '@labcabrera-rmu/rmu-react-shared-lib';
import { CombatContext } from '../../../../CombatContext';
import { applyAttack, deleteAction, prepareAttack } from '../../../api/action';
import { Action, ActionAttack, AttackDeclaration } from '../../../api/action.dto';
import { ActorRound, ActorRoundAttack } from '../../../api/actor-rounds.dto';
import { isDevelopment } from '../../../services/action-service';
import { findMaxActorRoundPace } from '../../../services/actor-round-service';
import RangedAttackForm from './RangedAttackForm';

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
  const notify = useNotify();
  const [formData, setFormData] = useState<AttackDeclaration>({ attacks: [], parries: [] });
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
    if (action.status === 'declared') {
      buttons.push(
        <Button variant="contained" color="success" onClick={onPrepare} disabled={!isValidForm}>
          {t('prepare')}
        </Button>
      );
    }
    if (action.status !== 'completed' && action.status !== 'declared') {
      buttons.push(
        <Button variant="contained" color="success" onClick={onApply} disabled={action.status !== 'pending_apply'}>
          {t('apply-attack')}
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

  // Only the attacks with a target are declared.
  const targetedAttacks = (data: AttackDeclaration) => (data.attacks || []).filter((a) => !!a.modifiers?.targetId);

  const validateForm = () => {
    if (!formData) return false;
    const attacks = targetedAttacks(formData);
    if (attacks.length < 1) return false;
    return attacks.every((attack) => !!attack.modifiers.range);
  };

  const onPrepare = () => {
    prepareAttack(action.id, { ...formData, attacks: targetedAttacks(formData) }, auth)
      .then((data) => updateAction(data))
      .catch((err) => notify.error(err));
  };

  const onApply = () => {
    applyAttack(action.id, auth)
      .then((updatedAction) => {
        updateAction(updatedAction);
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

  useEffect(() => {
    setIsValidForm(validateForm());
  }, [formData]);

  useEffect(() => {
    if (!action || !actorRound) return;
    loadAction(action);
  }, [action, actorRound]);

  if (!actorRound || !roundActions || !formData || !strategicGame || !game) return null;

  return (
    <RmuDialog
      title={actorRound.actorName}
      subtitle={`${t('ranged-attack')} (${t(`action-status-${action.status}`)})`}
      avatarImg={actorRound.imageUrl}
      open={open}
      buttons={deleting ? buttonsDeleting : getButtons()}
    >
      <>
        {!deleting ? (
          <>
            <RangedAttackForm actorRound={actorRound} action={action} formData={formData} setFormData={setFormData} />

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

export default RangedAttackDialog;
