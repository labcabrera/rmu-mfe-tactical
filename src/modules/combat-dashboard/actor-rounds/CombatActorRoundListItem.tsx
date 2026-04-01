import React, { FC, useContext, useEffect, useState } from 'react';
import { Grid } from '@mui/material';
import { CombatContext } from '../../../CombatContext';
import { Action } from '../../api/action.dto';
import { ActorRound } from '../../api/actor-rounds.dto';
import { Character } from '../../api/characters.dto';
import ActionDialog from '../action-dialogs/ActionDialog';
import ActorActions from './ActorActions';
import ActorRoundAlerts from './ActorRoundAlerts';
import ActorRoundEffects from './ActorRoundEffects';
import ActorRoundResume from './ActorRoundResume';
import ActorRoundInitiative from './initiative/ActorRoundInitiative';

const CombatActorRoundListItem: FC<{
  actorRound: ActorRound;
  onActorRoundView: (actorRound: ActorRound) => void;
}> = ({ actorRound, onActorRoundView }) => {
  const [character, setCharacter] = useState<Character | undefined>();
  const { characters, game, roundActions } = useContext(CombatContext)!;
  const [resolveDialogOpen, setResolveDialogOpen] = useState(false);
  const [selectedActionId, setSelectedActionId] = useState<string | null>(null);

  useEffect(() => {
    if (actorRound && characters) {
      setCharacter(characters.find((item: Character) => item.id === actorRound.actorId));
    }
  }, [actorRound, characters]);

  if (!actorRound || !character || !game) return <p>Loading...</p>;

  return (
    <>
      <Grid container spacing={1} sx={{ borderBottom: '1px solid #282e2f', pb: 1 }}>
        <Grid size={3}>
          <ActorRoundResume actorRound={actorRound} onActorRoundView={() => onActorRoundView(actorRound)} />
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
        <Grid size={1}>
          <ActorRoundEffects actorRound={actorRound} />
        </Grid>
        <Grid size={1}>
          <ActorRoundAlerts actorRound={actorRound} />
        </Grid>
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
