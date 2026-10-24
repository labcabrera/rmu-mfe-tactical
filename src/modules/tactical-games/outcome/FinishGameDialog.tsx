import React, { FC, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
import {
  Alert,
  AlertTitle,
  Box,
  Button,
  CircularProgress,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import {
  AtRiskCharacter,
  CharacterFate,
  DataTable,
  fetchFinishPreview,
  finishTacticalGame,
  FinishPreview,
  RmuDialog,
  TacticalGame,
  TacticalGameCharacterOutcome,
} from '@labcabrera-rmu/rmu-react-shared-lib';
import { useTacticalNotify } from '../../services/notify-service';
import { OutcomeConditions, OutcomeHp, OutcomeInjuries, OutcomeItems } from './outcome-view';

const FATES: CharacterFate[] = ['dead', 'permanent-unconscious'];

/**
 * Finishing a tactical game (spec 013, §5): the characters (NPCs are left out) with their hit points at the start
 * and at the end, the injuries taken and their conditions; and a warning with the characters who still bleed or are
 * dying, who are considered dead unless they are healed before finishing. Each one needs a fate: dead (the default)
 * or permanently unconscious. The last round's upkeep is not run (decision 3).
 */
const FinishGameDialog: FC<{
  game: TacticalGame;
  open: boolean;
  onClose: () => void;
  onFinished: (game: TacticalGame) => void;
}> = ({ game, open, onClose, onFinished }) => {
  const { t } = useTranslation();
  const auth = useAuth();
  const notify = useTacticalNotify();
  const [preview, setPreview] = useState<FinishPreview | null>(null);
  const [fates, setFates] = useState<Record<string, CharacterFate>>({});
  const [busy, setBusy] = useState(false);

  const load = () => {
    setPreview(null);
    fetchFinishPreview(game.id, auth)
      .then((data) => {
        setPreview(data);
        setFates((current) =>
          Object.fromEntries(data.atRisk.map((actor) => [actor.actorId, current[actor.actorId] ?? 'dead']))
        );
      })
      .catch((err) => {
        notify.error(err);
        onClose();
      });
  };

  useEffect(() => {
    if (open) load();
    // Loaded each time the dialog opens: the game changes while it is closed.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, game.id]);

  const confirm = () => {
    if (!preview) return;
    setBusy(true);
    const dto = {
      fates: preview.atRisk.map((actor) => ({ actorId: actor.actorId, fate: fates[actor.actorId] ?? 'dead' })),
    };
    finishTacticalGame(game.id, dto, auth)
      .then((finished) => {
        notify.success(t('tactical-game-finished'));
        onFinished(finished);
      })
      .catch((err) => {
        notify.error(err);
        // Someone may be at risk now who was not when the preview was loaded.
        load();
      })
      .finally(() => setBusy(false));
  };

  const riskText = (actor: AtRiskCharacter) =>
    [
      actor.bleeding > 0 ? t('at-risk-bleeding', { value: actor.bleeding }) : undefined,
      actor.dyingRounds !== undefined && actor.dyingRounds !== null
        ? t('at-risk-dying', { count: actor.dyingRounds })
        : undefined,
    ]
      .filter(Boolean)
      .join(' · ');

  return (
    <RmuDialog
      open={open}
      onClose={onClose}
      title={t('finish-tactical-game')}
      subtitle={game.name}
      maxWidth="md"
      buttons={
        <>
          <Button onClick={onClose} disabled={busy}>
            {t('cancel')}
          </Button>
          <Button variant="contained" color="warning" onClick={confirm} disabled={!preview || busy}>
            {t('finish-tactical-game')}
          </Button>
        </>
      }
    >
      {!preview ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Stack spacing={2}>
          <Typography variant="body2" color="text.secondary">
            {t('finish-tactical-game-help')}
          </Typography>
          {preview.atRisk.length > 0 && (
            <Alert severity="warning">
              <AlertTitle>{t('finish-at-risk-title')}</AlertTitle>
              <Typography variant="body2" sx={{ mb: 1.5 }}>
                {t('finish-at-risk-help')}
              </Typography>
              <Stack spacing={1.5}>
                {preview.atRisk.map((actor) => (
                  <Stack
                    key={actor.actorId}
                    direction={{ xs: 'column', sm: 'row' }}
                    spacing={1.5}
                    sx={{ alignItems: { sm: 'center' } }}
                  >
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="subtitle2">{actor.name}</Typography>
                      <Typography variant="caption">{riskText(actor)}</Typography>
                    </Box>
                    <TextField
                      select
                      size="small"
                      label={t('fate')}
                      value={fates[actor.actorId] ?? 'dead'}
                      onChange={(event) =>
                        setFates((current) => ({ ...current, [actor.actorId]: event.target.value as CharacterFate }))
                      }
                      sx={{ minWidth: 220 }}
                    >
                      {FATES.map((fate) => (
                        <MenuItem key={fate} value={fate}>
                          {t(`fate-${fate}`)}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Stack>
                ))}
              </Stack>
            </Alert>
          )}
          {preview.characters.length === 0 ? (
            <Typography color="text.secondary">{t('finish-no-characters')}</Typography>
          ) : (
            <DataTable<TacticalGameCharacterOutcome>
              rows={preview.characters}
              getKey={(character) => character.actorId}
              columns={[
                { key: 'name', header: t('name'), render: (character) => character.name },
                { key: 'hp', header: t('hp'), render: (character) => <OutcomeHp character={character} /> },
                {
                  key: 'injuries',
                  header: t('new-injuries'),
                  render: (character) => <OutcomeInjuries character={character} />,
                },
                {
                  key: 'conditions',
                  header: t('conditions'),
                  render: (character) => <OutcomeConditions character={character} />,
                },
                {
                  key: 'items',
                  header: t('outcome-items'),
                  render: (character) => <OutcomeItems character={character} />,
                },
              ]}
            />
          )}
        </Stack>
      )}
    </RmuDialog>
  );
};

export default FinishGameDialog;
