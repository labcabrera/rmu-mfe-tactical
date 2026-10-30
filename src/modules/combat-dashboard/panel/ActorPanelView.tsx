import React, { FC, MouseEvent, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import AddIcon from '@mui/icons-material/Add';
import OpenInFullIcon from '@mui/icons-material/OpenInFull';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { Alert, Box, Button, Divider, Stack, Typography } from '@mui/material';
import { CombatContext } from '../../../CombatContext';
import ActorRoundBars from '../../actor-round/ActorRoundBars';
import ActorRoundDefenseMode from '../../actor-round/ActorRoundDefenseMode';
import { Action } from '../../api/action.dto';
import { ActorRound } from '../../api/actor-rounds.dto';
import { frenzyLevel, isFrenzyDying } from '../../services/frenzy-service';
import ActorAction from '../actor-rounds/ActorAction';
import ActorRoundEffects from '../actor-rounds/ActorRoundEffects';

/**
 * An actor in the side panel, with what changes every round (spec 045): its actions this round (to open them), a
 * button to declare a new one, its hit points and fatigue, its defense mode and its active effects. The rest is in
 * the full sheet (a dialog with tabs) and in its character sheet, opened in a new tab (the combat stays open).
 */
const ActorPanelView: FC<{
  actorRound: ActorRound;
  /** Set while the actor can declare (an action phase of the current round). */
  onDeclare?: (event: MouseEvent<HTMLElement>) => void;
  onOpenAction: (action: Action) => void;
  onOpenDetail: () => void;
}> = ({ actorRound, onDeclare, onOpenAction, onOpenDetail }) => {
  const { t } = useTranslation();
  const { roundActions } = useContext(CombatContext)!;
  const actions = (roundActions ?? []).filter((a) => a.actorId === actorRound.actorId);
  const frenzy = frenzyLevel(actorRound);

  return (
    <Stack spacing={2} sx={{ p: 2 }}>
      <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', rowGap: 1 }}>
        {onDeclare && (
          <Button variant="contained" startIcon={<AddIcon />} onClick={onDeclare}>
            {t('declare-action')}
          </Button>
        )}
        <Button variant="outlined" startIcon={<OpenInFullIcon />} onClick={onOpenDetail}>
          {t('actor-detail')}
        </Button>
        {/* An NPC (spec 055) has no character sheet. */}
        {actorRound.actorType !== 'npc' && (
          <Button
            startIcon={<OpenInNewIcon />}
            href={`/strategic/characters/view/${actorRound.actorId}`}
            target="_blank"
            rel="noopener"
          >
            {t('view-character')}
          </Button>
        )}
      </Stack>
      {/* Spec 040, decision 15: the frenzied actor attacks the nearest creature; the board only reminds it. */}
      {frenzy > 0 && (
        <Alert severity="warning">
          {t(frenzy === 2 ? 'frenzy-greater' : 'frenzy')} · {t('frenzy-attack-nearest')}
        </Alert>
      )}
      {isFrenzyDying(actorRound) && <Alert severity="error">{t('frenzy-dying')}</Alert>}
      <Box>
        <Typography variant="overline" color="text.secondary">
          {t('round-actions')}
        </Typography>
        <Stack spacing={0.75}>
          {actions.length === 0 && (
            <Typography variant="body2" color="text.secondary">
              {t('no-actions-in-round')}
            </Typography>
          )}
          {actions.map((action) => (
            <Box key={action.id} sx={{ height: 40 }}>
              <ActorAction action={action} onClick={() => onOpenAction(action)} />
            </Box>
          ))}
        </Stack>
      </Box>
      <Divider />
      <ActorRoundBars actorRound={actorRound} />
      <Divider />
      <ActorRoundDefenseMode actorRound={actorRound} />
      <Divider />
      <Box>
        <Typography variant="overline" color="text.secondary">
          {t('effects-states')}
        </Typography>
        <ActorRoundEffects actorRound={actorRound} />
      </Box>
    </Stack>
  );
};

export default ActorPanelView;
