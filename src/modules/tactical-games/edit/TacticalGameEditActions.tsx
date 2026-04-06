import React, { FC } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CancelButton,
  RmuBreadcrumbs,
  SaveButton,
  TacticalGame,
  updateTacticalGame,
} from '@labcabrera-rmu/rmu-react-shared-lib';
import { t } from 'i18next';
import { useError } from '../../../ErrorContext';

const TacticalGameEditActions: FC<{
  tacticalGame: TacticalGame;
  formData: TacticalGame;
  isValid: boolean;
}> = ({ tacticalGame, formData, isValid }) => {
  const navigate = useNavigate();
  const { showError } = useError();
  const breadcrumbs = [
    { name: t('Tactical'), link: '/tactical' },
    { name: t('Games'), link: '/tactical/games' },
    { name: t('Edit') },
  ];

  const onUpdate = async () => {
    // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
    const { id, strategicGameId, status, round, phase, factions, actors, owner, ...dto } = formData;
    updateTacticalGame(tacticalGame.id, dto)
      .then((data) => navigate(`/tactical/games/view/${tacticalGame.id}`, { state: { tacticalGame: data } }))
      .catch((err) => showError(err.message));
  };

  const onCancel = () => {
    navigate(`/tactical/games/view/${tacticalGame.id}`, { state: { tacticalGame: tacticalGame } });
    return;
  };

  return (
    <RmuBreadcrumbs items={breadcrumbs}>
      <CancelButton onClick={onCancel} />
      <SaveButton onClick={onUpdate} disabled={!isValid} />
    </RmuBreadcrumbs>
  );
};

export default TacticalGameEditActions;
