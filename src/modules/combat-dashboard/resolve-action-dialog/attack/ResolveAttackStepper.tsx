import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Stepper from '@mui/material/Stepper';
import { Action, AttackDto, ActionAttackParry } from '../../../api/actions';
import { ActorRound } from '../../../api/actor-rounds';
import { Character } from '../../../api/characters';
import ResolveAttackSelectAttacks from './ResolveAttackSelectAttacks';
import ResolveAttackTabDeclaration from './ResolveAttackTabDeclaration';
import ResolveAttackTabParry from './ResolveAttackTabParry';
import ResolveAttackTabRoll from './ResolveAttackTabRoll';

const steps = ['Declare attacks and targets', 'Choose attack options', 'Parry', 'Resolve attacks', 'Results'];

const ResolveAttackStepper: FC<{
  formData: AttackDto;
  setFormData: (data: AttackDto) => void;
  activeStep: number;
  setActiveStep: (step: number) => void;
  onClose: () => void;
  onDeclare: () => void;
  onParry: () => void;
  action: Action;
  actorRound: ActorRound;
  character: Character;
  isValidDeclaration: boolean;
}> = ({ formData, setFormData, activeStep, setActiveStep, onClose, onDeclare, onParry, action, actorRound, character, isValidDeclaration }) => {
  const { t } = useTranslation();

  const handleNext = () => {
    setActiveStep(activeStep + 1);
  };

  const handleBack = () => {
    setActiveStep(activeStep - 1);
  };

  const isDisabledNext = () => {
    if (activeStep === 0 && !isValidDeclaration) return true;
    return false;
  };

  if (!actorRound) return <p>Loading...</p>;

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
        <Box sx={{ mt: 5 }}>
          <ResolveAttackSelectAttacks formData={formData} setFormData={setFormData} actorRound={actorRound} character={character} />
        </Box>
      )}
      {activeStep === 1 && <ResolveAttackTabDeclaration formData={formData} setFormData={setFormData} />}
      {activeStep === 2 && <ResolveAttackTabParry formData={formData} setFormData={setFormData} />}
      {activeStep === 3 && <ResolveAttackTabRoll formData={formData} setFormData={setFormData} />}
      <Box sx={{ display: 'flex', flexDirection: 'row', pt: 2, mt: 'auto' }}>
        <Button color="inherit" disabled={activeStep === 0} onClick={handleBack} sx={{ mr: 1 }}>
          {t('back')}
        </Button>
        <Box sx={{ flex: '1 1 auto' }} />
        {activeStep === 1 && (action.status === 'declared' || action.status === 'in_progress') && <Button onClick={onDeclare}>{t('prepare')}</Button>}
        {activeStep === 2 && action.status === 'in_progress' && <Button onClick={onParry}>{t('parry')}</Button>}
        <Button onClick={handleNext} disabled={isDisabledNext()}>
          {t('next')}
        </Button>
        <Button onClick={onClose}>{t('close')}</Button>
      </Box>
    </Box>
  );
};

export default ResolveAttackStepper;
