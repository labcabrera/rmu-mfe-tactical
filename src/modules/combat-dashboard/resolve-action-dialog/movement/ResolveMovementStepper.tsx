import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Button, Step, StepLabel, Stepper } from '@mui/material';
import type { Action, ResolveMovementDto } from '../../../api/actions';
import type { Character } from '../../../api/characters';
import type { StrategicGame } from '../../../api/strategic-games';
import type { TacticalGame } from '../../../api/tactical-games';
import ResolveMovementForm from './ResolveMovementForm';
import ResolveMovementResults from './ResolveMovementResults';

const steps = ['Resolve', 'Results'];

const ResolveMovementStepper: FC<{
  formData: ResolveMovementDto;
  setFormData: (data: ResolveMovementDto) => void;
  activeStep: number;
  setActiveStep: (step: number) => void;
  onClose: () => void;
  onResolve: () => void;
  isValidForm: boolean;
  action: Action;
  character: Character;
  game: TacticalGame;
  strategicGame: StrategicGame;
}> = ({ formData, setFormData, activeStep, setActiveStep, onClose, onResolve, isValidForm, action, character, game, strategicGame }) => {
  const { t } = useTranslation();

  const handleNext = () => {
    setActiveStep(activeStep + 1);
  };

  const handleBack = () => {
    setActiveStep(activeStep - 1);
  };

  return (
    <Box sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', minHeight: 300 }}>
      <Stepper activeStep={activeStep}>
        {steps.map((label, index) => {
          const stepProps: Record<string, unknown> = {};
          const labelProps: Record<string, unknown> = {};
          return (
            <Step key={index} {...stepProps}>
              <StepLabel {...labelProps}>{label}</StepLabel>
            </Step>
          );
        })}
      </Stepper>
      {activeStep === 0 && (
        <ResolveMovementForm
          formData={formData}
          setFormData={setFormData}
          character={character}
          strategicGame={strategicGame}
          action={action}
          game={game}
          isValidForm={isValidForm}
        />
      )}
      {activeStep === 1 && <ResolveMovementResults action={action} />}
      <Box sx={{ display: 'flex', flexDirection: 'row', pt: 2, mt: 'auto' }}>
        <Button color="inherit" disabled={activeStep === 0} onClick={handleBack} sx={{ mr: 1 }}>
          {t('back')}
        </Button>
        <Box sx={{ flex: '1 1 auto' }} />
        {activeStep === 0 && action.status === 'declared' && (
          <Button onClick={onResolve} disabled={!isValidForm}>
            {t('resolve')}
          </Button>
        )}
        <Button onClick={handleNext} disabled={activeStep !== 0 && action.status !== 'declared'}>
          {t('next')}
        </Button>
        <Button onClick={onClose}>{t('close')}</Button>
      </Box>
    </Box>
  );
};

export default ResolveMovementStepper;
