/* eslint-disable react/prop-types */
import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Stepper from '@mui/material/Stepper';
import ResolveMovementForm from './ResolveAttackForm';
import ResolveAttackTabDeclaration from './ResolveAttackTabDeclaration';

const steps = ['Declare attacks and targets', 'Choose attack options', 'Resolve attacks', 'Results'];

export default function ResolveAttackStepper({
  formData,
  setFormData,
  activeStep,
  setActiveStep,
  onClose,
  onResolve,
  action,
  character,
  game,
  strategicGame,
}) {
  const [skipped, setSkipped] = useState(new Set());

  const handleNext = () => {
    let newSkipped = skipped;
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
    setSkipped(newSkipped);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  return (
    <Box sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', minHeight: 300 }}>
      <Stepper activeStep={activeStep}>
        {steps.map((label, index) => {
          const stepProps = {};
          const labelProps = {};
          return (
            <Step key={index} {...stepProps}>
              <StepLabel {...labelProps}>{label}</StepLabel>
            </Step>
          );
        })}
      </Stepper>
      {activeStep === 0 && (
        <>
          <Box sx={{ mt: 5 }}>
            <ResolveMovementForm
              formData={formData}
              setFormData={setFormData}
              setActiveStep={setActiveStep}
              character={character}
              strategicGame={strategicGame}
              action={action}
              game={game}
            />
          </Box>
        </>
      )}
      {activeStep === 1 && (
        <>
          <ResolveAttackTabDeclaration formData={formData} setFormData={setFormData} />
        </>
      )}
      <Box sx={{ display: 'flex', flexDirection: 'row', pt: 2, mt: 'auto' }}>
        <Button color="inherit" disabled={activeStep === 0} onClick={handleBack} sx={{ mr: 1 }}>
          Back
        </Button>
        <Box sx={{ flex: '1 1 auto' }} />
        {activeStep === 0 && action.status === 'declared' && <Button onClick={onResolve}>Resolve</Button>}
        <Button onClick={handleNext} disabled={activeStep !== 0 && action.status !== 'declared'}>
          Next
        </Button>
        <Button onClick={onClose}>Close</Button>
      </Box>
    </Box>
  );
}
