import React, { useState } from 'react';
import { IconButton } from '@mui/material';
import Avatar from '@mui/material/Avatar';
import DeclareInitiativeDialog from './DeclareInitiativeDialog';

const CombatCharacterRoundInitiative = () => {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <>
      <IconButton onClick={() => setDialogOpen(true)}>
        <Avatar src={`/static/images/generic/initiative.png`} />
      </IconButton>
      <DeclareInitiativeDialog open={dialogOpen} setOpen={setDialogOpen} />
    </>
  );
};

export default CombatCharacterRoundInitiative;
