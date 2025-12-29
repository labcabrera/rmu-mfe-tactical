import React, { Dispatch, FC, SetStateAction } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Button, Step, StepLabel, Stepper } from '@mui/material';
import { Action, AttackDeclaration } from '../../../api/action.dto';
import { ActorRound } from '../../../api/actor-rounds.dto';
import MeleeAttackDeclaration from './MeleeAttackDeclaration';
import MeleeAttackSelectAttacks from './MeleeAttackSelectAttacks';
import ResolveAttackParry from './ResolveAttackParry';
import ResolveAttackTabRoll from './ResolveAttackRoll';

const steps = ['Select targets', 'Choose attack options', 'Declare parry', 'Resolve attacks'];

const MeleeAttackStepper: FC<{
  formData: AttackDeclaration;
  setFormData: Dispatch<SetStateAction<AttackDeclaration>>;
  activeStep: number;
  setActiveStep: Dispatch<SetStateAction<number>>;
  onDeclare: () => void;
  onParry: () => void;
  onApply: () => void;
  action: Action;
  actorRound: ActorRound;
  isValidDeclaration: boolean;
}> = ({
  formData,
  setFormData,
  activeStep,
  setActiveStep,
  onDeclare,
  onParry,
  onApply,
  action,
  actorRound,
  isValidDeclaration,
}) => {
  const { t } = useTranslation();

  const handleNext = () => {
    setActiveStep(activeStep + 1);
  };

  const handleBack = () => {
    setActiveStep(activeStep - 1);
  };

  const isDisabledNext = () => {
    if (activeStep === 0 && !isValidDeclaration) return true;
    if (activeStep === 1 && action.status === 'declared') return true;
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
          <MeleeAttackSelectAttacks formData={formData} setFormData={setFormData} actorRound={actorRound} />
        </Box>
      )}

      {activeStep === 1 && <MeleeAttackDeclaration formData={formData} setFormData={setFormData} />}

      {activeStep === 2 && <ResolveAttackParry formData={formData} setFormData={setFormData} />}

      {activeStep === 3 && <ResolveAttackTabRoll formData={formData} action={action} setFormData={setFormData} />}

      <Box sx={{ display: 'flex', flexDirection: 'row', pt: 2, mt: 'auto' }}>
        <Button color="inherit" disabled={activeStep === 0} onClick={handleBack} sx={{ mr: 1 }}>
          {t('back')}
        </Button>
        <Box sx={{ flex: '1 1 auto' }} />
        {activeStep === 1 && (action.status === 'declared' || action.status === 'in_progress') && (
          <Button onClick={onDeclare}>{t('prepare')}</Button>
        )}
        {activeStep === 2 && <Button onClick={onParry}>{t('parry')}</Button>}
        {activeStep === 3 && action.status !== 'completed' && <Button onClick={onApply}>{t('apply')}</Button>}
        <Button onClick={handleNext} disabled={isDisabledNext()}>
          {t('next')}
        </Button>
      </Box>
    </Box>
  );
};

export default MeleeAttackStepper;
