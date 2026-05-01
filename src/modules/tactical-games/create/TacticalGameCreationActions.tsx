import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
import { useNavigate } from 'react-router-dom';
import {
  CancelButton,
  createTacticalGame,
  CreateTacticalGameDto,
  RmuBreadcrumbs,
  SaveButton,
  UpdateTacticalGameDto,
} from '@labcabrera-rmu/rmu-react-shared-lib';
import { useError } from '../../../ErrorContext';

const TacticalGameCreationActions: FC<{
  formData: CreateTacticalGameDto;
  isValid?: boolean;
}> = ({ formData, isValid = false }) => {
  const auth = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { showError } = useError();

  const onSave = async () => {
    const dto: UpdateTacticalGameDto = { ...formData };
    createTacticalGame(dto, auth)
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
