import React, { Dispatch, FC, SetStateAction, useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { alpha, Box, Paper, Stack, Typography } from '@mui/material';
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
import { phaseNumber, ROUND_GRID_COLUMNS } from './round-grid';

const CombatActorRoundListItem: FC<{
  actorRound: ActorRound;
  index: number;
  displayPhase: string;
  setDisplayPhase: Dispatch<SetStateAction<string>>;
  onActorRoundView: (actorRound: ActorRound) => void;
  /** Phones: the cells are stacked instead of laid out as a row of the board grid. */
  compact?: boolean;
}> = ({ actorRound, index, displayPhase, onActorRoundView, setDisplayPhase, compact = false }) => {
  const { t } = useTranslation();
  const [character, setCharacter] = useState<Character | undefined>();
  const { characters, game, roundActions } = useContext(CombatContext)!;
  const [resolveDialogOpen, setResolveDialogOpen] = useState(false);
  const [selectedActionId, setSelectedActionId] = useState<string | null>(null);

  useEffect(() => {
    if (actorRound && characters) {
      setCharacter(characters.find((item: Character) => item.id === actorRound.actorId));
    }
  }, [actorRound, characters]);

  if (!actorRound || !character || !game) return null;

  const isActionPhase = displayPhase.startsWith('phase_');
  const currentPhase = phaseNumber(displayPhase);
  const resume = (
    <ActorRoundResume
      actorRound={actorRound}
      compact={compact}
      onActorRoundView={() => onActorRoundView(actorRound)}
    />
  );
  const initiative = <ActorRoundInitiative actorRound={actorRound} />;
  const actions = (
    <ActorActions
      actorId={actorRound.actorId}
      currentPhase={currentPhase}
      onActionClick={(action) => {
        setSelectedActionId(action.id);
        setResolveDialogOpen(true);
      }}
    />
  );
  const effects = <ActorRoundEffects actorRound={actorRound} />;

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
        {compact ? (
          <Stack>
            <Box sx={{ display: 'grid', gridTemplateColumns: '28px minmax(0, 1fr) 96px' }}>
              <IndexCell index={index} />
              {resume}
              <Box sx={{ minWidth: 0, borderLeft: '1px solid', borderColor: 'divider' }}>{initiative}</Box>
            </Box>
            {isActionPhase && (
              <Box sx={{ p: 1, borderTop: '1px solid', borderColor: 'divider' }}>
                <ActorRoundDeclarationButtons
                  actorRound={actorRound}
                  currentPhase={currentPhase}
                  setDisplayPhase={setDisplayPhase}
                  layout="row"
                />
              </Box>
            )}
            <Box sx={{ borderTop: '1px solid', borderColor: 'divider' }}>
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px', px: 1, pt: 0.75 }}>
                {[1, 2, 3, 4].map((phase) => (
                  <Typography
                    key={phase}
                    variant="caption"
                    align="center"
                    color={phase === currentPhase ? 'primary.light' : 'text.secondary'}
                    sx={{ fontWeight: phase === currentPhase ? 700 : 400 }}
                  >
                    {t('phase-n', { phase })}
                  </Typography>
                ))}
              </Box>
              {actions}
            </Box>
            <Box sx={{ borderTop: '1px solid', borderColor: 'divider' }}>{effects}</Box>
          </Stack>
        ) : (
          <Box sx={{ display: 'grid', gridTemplateColumns: ROUND_GRID_COLUMNS, columnGap: 1, minHeight: 140 }}>
            <Box sx={{ minWidth: 0 }}>
              <Box sx={{ display: 'grid', gridTemplateColumns: '34px minmax(0, 1fr)', height: '100%' }}>
                <IndexCell index={index} />
                {resume}
              </Box>
            </Box>
            <Box sx={{ minWidth: 0, borderLeft: '1px solid', borderColor: 'divider' }}>{initiative}</Box>
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
              {isActionPhase && (
                <ActorRoundDeclarationButtons
                  actorRound={actorRound}
                  currentPhase={currentPhase}
                  setDisplayPhase={setDisplayPhase}
                />
              )}
            </Box>
            <Box sx={{ gridColumn: 'span 4', minWidth: 0, borderLeft: '1px solid', borderColor: 'divider' }}>
              {actions}
            </Box>
            <Box sx={{ minWidth: 0, borderLeft: '1px solid', borderColor: 'divider' }}>{effects}</Box>
          </Box>
        )}
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

const IndexCell: FC<{ index: number }> = ({ index }) => (
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
);

export default CombatActorRoundListItem;
