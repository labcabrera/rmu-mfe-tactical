import React, { Dispatch, FC, SetStateAction } from 'react';
import { useTranslation } from 'react-i18next';
import { alpha, Box, Step, StepLabel, Stepper } from '@mui/material';
import { Action, ActionAttack, AttackDeclaration } from '../../../api/action.dto';
import { ActorRound } from '../../../api/actor-rounds.dto';
import MeleeAttackDeclaration from './MeleeAttackDeclaration';
import MeleeAttackSelectAttacks from './MeleeAttackSelectAttacks';
import ResolveAttackParry from './ResolveAttackParry';
import ResolveAttackTabRoll from './ResolveAttackRoll';

const steps = ['select-targets', 'attack-options', 'parry', 'resolve'];

const MeleeAttackStepper: FC<{
  action: Action;
  actorRound: ActorRound;
  formData: AttackDeclaration;
  activeStep: number;
  availableAttacks: ActionAttack[];
  setFormData: Dispatch<SetStateAction<AttackDeclaration>>;
}> = ({ action, actorRound, formData, activeStep, availableAttacks, setFormData }) => {
  const { t } = useTranslation();
  if (!actorRound) return null;

  return (
    <Box sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', minHeight: 300 }}>
      <Stepper
        activeStep={activeStep}
        sx={(theme) => ({
          mb: 2,
          px: 0.5,
          '& .MuiStepConnector-line': {
            borderColor: alpha(theme.palette.primary.light, 0.28),
          },
          '& .MuiStepIcon-root': {
            color: alpha(theme.palette.text.secondary, 0.38),
          },
          '& .MuiStepIcon-root.Mui-active': {
            color: theme.palette.primary.main,
          },
          '& .MuiStepIcon-root.Mui-completed': {
            color: theme.palette.success.dark,
          },
          '& .MuiStepLabel-label': {
            color: theme.palette.text.secondary,
            fontSize: '0.78rem',
          },
          '& .MuiStepLabel-label.Mui-active': {
            color: theme.palette.primary.light,
            fontWeight: 700,
          },
        })}
      >
        {steps.map((label, index) => {
          const stepProps: Record<string, unknown> = {};
          const labelProps: Record<string, unknown> = {};
          return (
            <Step key={index} {...stepProps}>
              <StepLabel {...labelProps}>{t(label)}</StepLabel>
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
