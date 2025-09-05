/* eslint-disable react/prop-types */
import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Stepper from '@mui/material/Stepper';
import ResolveMovementForm from './ResolveMovementForm';
import ResolveMovementResults from './ResolveMovementResults';

const steps = ['Resolve', 'Results'];

export default function ResolveMovementStepper({ formData, setFormData, activeStep, setActiveStep, action, character, game, strategicGame }) {
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
    <Box sx={{ width: '100%' }}>
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
          <ResolveMovementForm
            formData={formData}
            setFormData={setFormData}
            setActiveStep={setActiveStep}
            character={character}
            strategicGame={strategicGame}
            action={action}
            game={game}
          />
        </>
      )}
      {activeStep === 1 && (
        <>
          <ResolveMovementResults action={action} />
        </>
      )}
      <>
        <Box sx={{ display: 'flex', flexDirection: 'row', pt: 2 }}>
          <Button color="inherit" disabled={activeStep === 0} onClick={handleBack} sx={{ mr: 1 }}>
            Back
          </Button>
          <Box sx={{ flex: '1 1 auto' }} />
          <Button onClick={handleNext} disabled={activeStep === 1}>
            Next
          </Button>
        </Box>
      </>
    </Box>
  );
}
