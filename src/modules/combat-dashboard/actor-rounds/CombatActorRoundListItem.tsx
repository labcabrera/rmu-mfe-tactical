import React, { FC, useContext, useEffect, useState } from 'react';
import { Grid } from '@mui/material';
import { CombatContext } from '../../../CombatContext';
import { Action } from '../../api/action.dto';
import { ActorRound } from '../../api/actor-rounds.dto';
import { Character } from '../../api/characters.dto';
import ActionDialog from '../action-dialogs/ActionDialog';
import ActorActions from './ActorActions';
import ActorRoundEffects from './ActorRoundEffects';
import ActorRoundInitiative from './ActorRoundInitiative';
import ActorRoundResume from './ActorRoundResume';

const CombatActorRoundListItem: FC<{
  actorRound: ActorRound;
}> = ({ actorRound }) => {
  const [character, setCharacter] = useState<Character | undefined>();
  const { characters, game, roundActions } = useContext(CombatContext)!;
  const [resolveDialogOpen, setResolveDialogOpen] = useState(false);
  const [selectedActionId, setSelectedActionId] = useState<string | null>(null);

  useEffect(() => {
    if (actorRound && characters) {
      setCharacter(characters.find((item: Character) => item.id === actorRound.actorId));
    }
  }, [actorRound, characters]);

  if (!actorRound || !character || !game) return <p>CombatActorRoundListItem: loading...</p>;

  return (
    <>
      <Grid container spacing={1} mt={1} sx={{ borderBottom: '1px solid #282e2f', pb: 1 }}>
        <Grid size={2}>
          <ActorRoundResume actorRound={actorRound} />
        </Grid>
        <Grid size={1}>
          <ActorRoundInitiative actorRound={actorRound} />
        </Grid>
        <Grid size={5}>
          <ActorActions
            actorId={actorRound.actorId}
            currentPhase={game.phase.startsWith('phase_') ? parseInt(game.phase.replace('phase_', '')) : 5}
            onActionClick={(action) => {
              setSelectedActionId(action.id);
              setResolveDialogOpen(true);
            }}
          />
        </Grid>
        <Grid size={2}>
          <ActorRoundEffects actorRound={actorRound} />
        </Grid>
        <Grid size={1}></Grid>
      </Grid>

      {selectedActionId && (
        <ActionDialog
          action={(roundActions || []).find((a: Action) => a.id === selectedActionId) || (null as any)}
          actorRound={actorRound}
          character={character}
          open={resolveDialogOpen}
          onClose={() => {
            setResolveDialogOpen(false);
            setSelectedActionId(null);
          }}
        />
      )}
    </>
  );
};

export default CombatActorRoundListItem;
