import React, { FC, useContext, useEffect, useState } from 'react';
import { Grid, Paper } from '@mui/material';
import { CombatContext } from '../../../CombatContext';
import { Action } from '../../api/action.dto';
import { ActorRound } from '../../api/actor-rounds.dto';
import type { Character } from '../../api/characters';
import ActionDialog from '../action-dialogs/ActionDialog';
import ActorActions from './ActorActions';
import ActorRoundEffects from './ActorRoundEffects';
import CombatActorRoundListItemCharacter from './CombatActorRoundListItemCharacter';
import CombatCharacterRoundInitiative from './CombatCharacterRoundInitiative';

const CombatActorRoundListItem: FC<{
  actorRound: ActorRound;
}> = ({ actorRound }) => {
  const [character, setCharacter] = useState<Character | undefined>();
  const { characters, game } = useContext(CombatContext)!;
  const [resolveDialogOpen, setResolveDialogOpen] = useState(false);
  const [selectedAction, setSelectedAction] = useState<Action | null>(null);

  useEffect(() => {
    if (actorRound && characters) {
      setCharacter(characters.find((item: Character) => item.id === actorRound.actorId));
    }
  }, [actorRound, characters]);

  if (!actorRound || !character || !game) return <p>CombatActorRoundListItem: loading...</p>;

  return (
    <>
      <Grid container spacing={2} columns={12} sx={{ mt: 1, mb: 1 }}>
        <Grid size={3}>
          <CombatActorRoundListItemCharacter actorRound={actorRound} />
        </Grid>
        <Grid size={1}>
          <Paper
            elevation={game.phase === 'declare_initiative' ? 2 : 0}
            style={{
              height: '100%',
              padding: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <CombatCharacterRoundInitiative actorRound={actorRound} />
          </Paper>
        </Grid>
        <Grid size={5}>
          <ActorActions
            actorId={actorRound.actorId}
            currentPhase={game.phase.startsWith('phase_') ? parseInt(game.phase.replace('phase_', '')) : 5}
            onActionClick={(action) => {
              setSelectedAction(action);
              setResolveDialogOpen(true);
            }}
          />
        </Grid>
        <Grid size={2}>
          <ActorRoundEffects actorRound={actorRound} />
        </Grid>
        <Grid size={1}></Grid>
      </Grid>

      {selectedAction && (
        <ActionDialog
          action={selectedAction}
          actorRound={actorRound}
          character={character}
          open={resolveDialogOpen}
          onClose={() => {
            setResolveDialogOpen(false);
            setSelectedAction(null);
          }}
        />
      )}
    </>
  );
};

export default CombatActorRoundListItem;
