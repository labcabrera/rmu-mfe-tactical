import React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Stepper from '@mui/material/Stepper';
import { Action, AttackDeclarationDto } from '../../../api/actions';
import { Character } from '../../../api/characters';
import ResolveAttackSelectAttacks from './ResolveAttackSelectAttacks';
import ResolveAttackTabDeclaration from './ResolveAttackTabDeclaration';

type ResolveAttackStepperProps = {
  formData: AttackDeclarationDto;
  setFormData: (data: AttackDeclarationDto) => void;
  activeStep: number;
  setActiveStep: (step: number) => void;
  onClose: () => void;
  onDeclare: () => void;
  action: Action;
  character: Character;
};

const steps = ['Declare attacks and targets', 'Choose attack options', 'Resolve attacks', 'Results'];

const ResolveAttackStepper: React.FC<ResolveAttackStepperProps> = ({
  formData,
  setFormData,
  activeStep,
  setActiveStep,
  onClose,
  onDeclare,
  action,
  character,
}) => {
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
        <Box sx={{ mt: 5 }}>
          <ResolveAttackSelectAttacks formData={formData} setFormData={setFormData} character={character} />
        </Box>
      )}
      {activeStep === 1 && <ResolveAttackTabDeclaration formData={formData} setFormData={setFormData} />}
      <Box sx={{ display: 'flex', flexDirection: 'row', pt: 2, mt: 'auto' }}>
        <Button color="inherit" disabled={activeStep === 0} onClick={handleBack} sx={{ mr: 1 }}>
          Back
        </Button>
        <Box sx={{ flex: '1 1 auto' }} />
        {activeStep === 1 && action.status === 'declared' && <Button onClick={onDeclare}>Declare</Button>}
        <Button onClick={handleNext} disabled={activeStep !== 0 && action.status !== 'declared'}>
          Next
        </Button>
        <Button onClick={onClose}>Close</Button>
      </Box>
    </Box>
  );
};

export default ResolveAttackStepper;
