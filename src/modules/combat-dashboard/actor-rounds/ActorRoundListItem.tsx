import React, { Dispatch, FC, SetStateAction, useContext, useEffect, useState } from 'react';
import { alpha, Box, Paper, Typography } from '@mui/material';
import { Character } from '@labcabrera-rmu/rmu-react-shared-lib';
import { CombatContext } from '../../../CombatContext';
import { Action } from '../../api/action.dto';
import { ActorRound } from '../../api/actor-rounds.dto';
import ActionDialog from '../action-dialogs/ActionDialog';
import MeleeAttackDialog from '../action-dialogs/melee-attack/MeleeAttackDialog';
import MovementDialog from '../action-dialogs/movement/MovementDialog';
import RangedAttackDialog from '../action-dialogs/ranged-attack/RangedAttackDialog';
import ActorActions from './ActorActions';
import ActorRoundDeclarationButtons from './ActorRoundDeclarationButtons';
import ActorRoundEffects from './ActorRoundEffects';
import ActorRoundResume from './ActorRoundResume';
import ActorRoundInitiative from './initiative/ActorRoundInitiative';

const ROUND_GRID_COLUMNS = '6fr 2fr 3fr repeat(4, 3fr) 9fr';

const CombatActorRoundListItem: FC<{
  actorRound: ActorRound;
  index: number;
  displayPhase: string;
  setDisplayPhase: Dispatch<SetStateAction<string>>;
  onActorRoundView: (actorRound: ActorRound) => void;
}> = ({ actorRound, index, displayPhase, onActorRoundView, setDisplayPhase }) => {
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
      <Paper
        elevation={0}
        sx={(theme) => ({
          border: '1px solid',
          borderColor: 'divider',
          bgcolor: alpha(theme.palette.background.paper, 0.72),
          borderRadius: 1,
          overflow: 'hidden',
          boxShadow: 'none',
        })}
      >
        <Box sx={{ display: 'grid', gridTemplateColumns: ROUND_GRID_COLUMNS, columnGap: 1, minHeight: 140 }}>
          <Box sx={{ minWidth: 0 }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: '34px minmax(0, 1fr)', height: '100%' }}>
              <Box
                sx={(theme) => ({
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 1,
                  pt: 1.25,
                  color: 'text.secondary',
                  bgcolor: alpha(theme.palette.common.black, 0.18),
                  borderRight: '1px solid',
                  borderColor: 'divider',
                })}
              >
                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                  {index + 1}
                </Typography>
              </Box>
              <ActorRoundResume actorRound={actorRound} onActorRoundView={() => onActorRoundView(actorRound)} />
            </Box>
          </Box>
          <Box sx={{ minWidth: 0, borderLeft: '1px solid', borderColor: 'divider' }}>
            <ActorRoundInitiative actorRound={actorRound} />
          </Box>
          <Box
            sx={{
              minWidth: 0,
              borderLeft: '1px solid',
              borderColor: 'divider',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              p: 1,
              overflow: 'visible',
            }}
          >
            {displayPhase.startsWith('phase_') && (
              <ActorRoundDeclarationButtons
                actorRound={actorRound}
                currentPhase={parseInt(displayPhase.replace('phase_', ''))}
                setDisplayPhase={setDisplayPhase}
              />
            )}
          </Box>
          <Box sx={{ gridColumn: 'span 4', minWidth: 0, borderLeft: '1px solid', borderColor: 'divider' }}>
            <ActorActions
              actorId={actorRound.actorId}
              currentPhase={displayPhase.startsWith('phase_') ? parseInt(displayPhase.replace('phase_', '')) : 5}
              onActionClick={(action) => {
                setSelectedActionId(action.id);
                setResolveDialogOpen(true);
              }}
            />
          </Box>
          <Box sx={{ minWidth: 0, borderLeft: '1px solid', borderColor: 'divider' }}>
            <ActorRoundEffects actorRound={actorRound} />
          </Box>
        </Box>
      </Paper>

      {selectedActionId &&
        roundActions &&
        (() => {
          const action = roundActions.find((a: Action) => a.id === selectedActionId)!;
          if (action.actionType === 'movement') {
            return (
              <MovementDialog
                action={action}
                actorRound={actorRound}
                open={resolveDialogOpen}
                onClose={() => {
                  setResolveDialogOpen(false);
                  setSelectedActionId(null);
                }}
              />
            );
          } else if (action.actionType === 'melee_attack') {
            return (
              <MeleeAttackDialog
                action={action}
                actorRound={actorRound}
                open={resolveDialogOpen}
                onClose={() => {
                  setResolveDialogOpen(false);
                  setSelectedActionId(null);
                }}
              />
            );
          } else if (action.actionType === 'ranged_attack') {
            return (
              <RangedAttackDialog
                action={action}
                actorRound={actorRound}
                open={resolveDialogOpen}
                onClose={() => {
                  setResolveDialogOpen(false);
                  setSelectedActionId(null);
                }}
              />
            );
          }
          return (
            <ActionDialog
              action={action}
              actorRound={actorRound}
              open={resolveDialogOpen}
              onClose={() => {
                setResolveDialogOpen(false);
                setSelectedActionId(null);
              }}
            />
          );
        })()}
    </>
  );
};

export default CombatActorRoundListItem;
