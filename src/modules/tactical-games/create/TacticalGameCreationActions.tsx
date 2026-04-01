import React, { FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { CancelButton, RmuBreadcrumbs, SaveButton } from '@labcabrera-rmu/rmu-react-shared-lib';
import { t } from 'i18next';
import { useError } from '../../../ErrorContext';
import { createTacticalGame } from '../../api/tactical-game';
import { CreateTacticalGameDto, UpdateTacticalGameDto } from '../../api/tactical-game.dto';

const TacticalGameCreationActions: FC<{
  formData: CreateTacticalGameDto;
  isValid?: boolean;
}> = ({ formData, isValid = false }) => {
  const navigate = useNavigate();
  const { showError } = useError();

  const onSave = async () => {
    const dto: UpdateTacticalGameDto = { ...formData };
    createTacticalGame(dto)
      .then((game) => navigate(`/tactical/games/view/${game.id}`))
      .catch((err) => showError(err.message));
  };

  const onCancel = () => {
    navigate(`/tactical/games`);
  };

  return (
    <RmuBreadcrumbs items={[{ name: t('Tactical games'), link: '/tactical' }, { name: t('Create') }]}>
      <CancelButton onClick={() => onCancel()} />
      <SaveButton onClick={() => onSave()} disabled={!isValid} />
    </RmuBreadcrumbs>
  );
};

export default TacticalGameCreationActions;
