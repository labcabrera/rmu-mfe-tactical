import React, { FC, useContext, useEffect, useState } from 'react';
import { Grid, Paper, Button } from '@mui/material';
import { CombatContext } from '../../../CombatContext';
import { Action } from '../../api/action.dto';
import { ActorRound } from '../../api/actor-rounds.dto';
import type { Character } from '../../api/characters';
import type { TacticalGame } from '../../api/tactical-games';
import ResolveActionDialog from '../resolve-action-dialog/ResolveActionDialog';
import ActorRoundEffects from './ActorRoundEffects';
import CombatActorRoundListItemCharacter from './CombatActorRoundListItemCharacter';
import CombatCharacterRoundInitiative from './CombatCharacterRoundInitiative';
import DeclareActionDialog from './DeclareActionDialog';

const CombatActorRoundListItem: FC<{
  actorRound: ActorRound;
}> = ({ actorRound }) => {
  const [character, setCharacter] = useState<Character | undefined>();
  const { characters, game, roundActions } = useContext(CombatContext)!;
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
        <PhaseOptions
          actorRound={actorRound}
          character={character}
          game={game}
          roundActions={roundActions}
          phase={1}
          onActionClick={(action) => {
            setSelectedAction(action);
            setResolveDialogOpen(true);
          }}
        />
        <PhaseOptions
          actorRound={actorRound}
          character={character}
          game={game}
          roundActions={roundActions}
          phase={2}
          onActionClick={(action) => {
            setSelectedAction(action);
            setResolveDialogOpen(true);
          }}
        />
        <PhaseOptions
          actorRound={actorRound}
          character={character}
          game={game}
          roundActions={roundActions}
          phase={3}
          onActionClick={(action) => {
            setSelectedAction(action);
            setResolveDialogOpen(true);
          }}
        />
        <PhaseOptions
          actorRound={actorRound}
          character={character}
          game={game}
          roundActions={roundActions}
          phase={4}
          onActionClick={(action) => {
            setSelectedAction(action);
            setResolveDialogOpen(true);
          }}
        />
        <Grid size={2}></Grid>
        <Grid size={2}>
          <ActorRoundEffects actorRound={actorRound} />
        </Grid>
      </Grid>

      {selectedAction && (
        <ResolveActionDialog
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

const PhaseOptions: FC<{
  actorRound: ActorRound;
  character: Character;
  game: TacticalGame;
  roundActions: Action[];
  phase: number;
  onActionClick: (action: Action) => void;
}> = ({ actorRound, game, roundActions, phase, onActionClick }) => {
  const [declareActionDialogOpen, setDeclareActionDialogOpen] = useState(false);

  if (!roundActions || !game) return <p>Loading...</p>;

  const gamePhaseAsInt = game.phase.startsWith('phase_') ? parseInt(game.phase.replace('phase_', '')) : 5;

  const getActiveActionByPhase = (phase: number): Action[] => {
    return roundActions
      .filter(() => phase <= gamePhaseAsInt)
      .filter((action) => action.actorId === actorRound.actorId)
      .filter((action) => phase >= action.phaseStart)
      .filter((action) => !action.phaseEnd || action.phaseEnd >= phase);
  };

  return (
    <>
      <Grid size={1}>
        <Paper
          elevation={game.phase === `phase_${phase}` ? 2 : 0}
          style={{
            height: '100%',
            padding: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Grid container spacing={1} justifyContent="center">
            {getActiveActionByPhase(phase).map((action) => (
              <Grid key={action.id}>
                <Button
                  variant="contained"
                  color={action.status === 'completed' ? 'primary' : 'warning'}
                  onClick={() => onActionClick && onActionClick(action)}
                >
                  {action.actionType}
                </Button>
              </Grid>
            ))}
            {game.phase === `phase_${phase}` && (
              <Grid>
                <Button onClick={() => setDeclareActionDialogOpen(true)}>Declare Action</Button>
              </Grid>
            )}
          </Grid>
        </Paper>
      </Grid>
      <DeclareActionDialog
        actorRound={actorRound}
        phaseNumber={phase}
        open={declareActionDialogOpen}
        setOpen={setDeclareActionDialogOpen}
      />
    </>
  );
};

export default CombatActorRoundListItem;
