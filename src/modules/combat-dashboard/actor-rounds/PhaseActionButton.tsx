import React, { FC, useState } from 'react';
import { Button } from '@mui/material';
import { ActorRound } from '../../api/actor-rounds.dto';
import DeclareActionDialog from './DeclareActionDialog';

const PhaseActionButton: FC<{
  actorRound: ActorRound;
  phaseNumber: number;
}> = ({ actorRound, phaseNumber }) => {
  const [declareActionDialogOpen, setDeclareActionDialogOpen] = useState(false);

  if (!actorRound || !phaseNumber) {
    return <p>Loading...</p>;
  }

  return (
    <>
      <Button onClick={() => setDeclareActionDialogOpen(true)}>Declare Action</Button>
      <DeclareActionDialog
        actorRound={actorRound}
        phaseNumber={phaseNumber}
        open={declareActionDialogOpen}
        setOpen={setDeclareActionDialogOpen}
      />
    </>
  );
};

export default PhaseActionButton;
