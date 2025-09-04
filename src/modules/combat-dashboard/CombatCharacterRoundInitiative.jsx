/* eslint-disable react/prop-types */
import React, { useState } from 'react';
import { IconButton } from '@mui/material';
import Avatar from '@mui/material/Avatar';
import DeclareInitiativeDialog from './DeclareInitiativeDialog';

const CombatCharacterRoundInitiative = ({ actorRound }) => {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <>
      <IconButton onClick={() => setDialogOpen(true)}>
        <Avatar src={`/static/images/generic/initiative.png`} />
      </IconButton>
      <DeclareInitiativeDialog open={dialogOpen} setOpen={setDialogOpen} actorRound={actorRound} />
      {actorRound.initiative?.roll && <div>{actorRound.initiative.roll}</div>}
    </>
  );
};

export default CombatCharacterRoundInitiative;
