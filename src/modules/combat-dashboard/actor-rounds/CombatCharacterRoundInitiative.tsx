import React, { useState } from 'react';
import { IconButton } from '@mui/material';
import Avatar from '@mui/material/Avatar';
import type { ActorRound } from '../../api/actor-rounds';
import DeclareInitiativeDialog from './DeclareInitiativeDialog';

type CombatCharacterRoundInitiativeProps = {
  actorRound: ActorRound;
};

const CombatCharacterRoundInitiative: React.FC<CombatCharacterRoundInitiativeProps> = ({ actorRound }) => {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <>
      <IconButton onClick={() => setDialogOpen(true)}>
        <Avatar src={`/static/images/generic/initiative.png`} sx={{ width: 50, height: 50 }} />
      </IconButton>
      <DeclareInitiativeDialog open={dialogOpen} setOpen={setDialogOpen} actorRound={actorRound} />
      {actorRound.initiative?.roll && <div>{actorRound.initiative.total}</div>}
    </>
  );
};

export default CombatCharacterRoundInitiative;
