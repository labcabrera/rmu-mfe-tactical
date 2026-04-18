import React, { Dispatch, FC, SetStateAction } from 'react';
import { Box, Step, StepLabel, Stepper } from '@mui/material';
import { Action, ActionAttack, AttackDeclaration } from '../../../api/action.dto';
import { ActorRound } from '../../../api/actor-rounds.dto';
import MeleeAttackDeclaration from './MeleeAttackDeclaration';
import MeleeAttackSelectAttacks from './MeleeAttackSelectAttacks';
import ResolveAttackParry from './ResolveAttackParry';
import ResolveAttackTabRoll from './ResolveAttackRoll';

const steps = ['Select targets', 'Choose attack options', 'Declare parry', 'Resolve attacks'];

const MeleeAttackStepper: FC<{
  action: Action;
  actorRound: ActorRound;
  formData: AttackDeclaration;
  activeStep: number;
  availableAttacks: ActionAttack[];
  setFormData: Dispatch<SetStateAction<AttackDeclaration>>;
}> = ({ action, actorRound, formData, activeStep, availableAttacks, setFormData }) => {
  if (!actorRound) return <p>Loading... (melee attack stepper)</p>;

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
        <MeleeAttackSelectAttacks
          formData={formData}
          setFormData={setFormData}
          actorRound={actorRound}
          availableAttacks={availableAttacks}
        />
      )}
      {activeStep === 1 && <MeleeAttackDeclaration formData={formData} setFormData={setFormData} />}
      {activeStep === 2 && <ResolveAttackParry action={action} formData={formData} setFormData={setFormData} />}
      {activeStep === 3 && <ResolveAttackTabRoll formData={formData} action={action} setFormData={setFormData} />}
    </Box>
  );
};

export default MeleeAttackStepper;
