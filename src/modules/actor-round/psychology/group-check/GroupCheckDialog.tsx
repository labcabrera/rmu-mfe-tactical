import { FC, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Checkbox,
  Collapse,
  FormControlLabel,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import {
  CharacterPicker,
  DifficultyPicker,
  NumberPadField,
  OPEN_D100,
  RmuDialog,
  RollField,
  sideStrengthState,
} from '@labcabrera-rmu/rmu-react-shared-lib';
import { groupCheck } from '../../../api/psychology';
import { GroupCheckKind, GroupCheckResult } from '../../../api/psychology.dto';
import { useCombatGame, useCombatRound, useCombatActions } from '../../../combat/combat-context';
import { useActorRoundOption } from '../../../hooks/useActorRoundOption';
import { useBusyAction } from '../../../hooks/useBusyAction';
import { useFrightLevels } from '../../../hooks/useCoreTables';
import { useSides } from '../../../hooks/useSides';
import FrightSourceFields from './FrightSourceFields';
import GroupCheckInfo from './GroupCheckInfo';
import GroupCheckResultView from './GroupCheckResultView';
import MemberRolls from './MemberRolls';
import { fearTriggerLabel } from './fear-triggers';
import {
  GroupCheckForm,
  groupCheckProblem,
  groupMembers,
  initialGroupCheckForm,
  isNpc,
  toGroupCheckRequest,
} from './group-check';

const KINDS: GroupCheckKind[] = ['fear', 'morale', 'rally'];

/**
 * What a suggested check opens the dialog with (workspace spec 068, decision 16): the faction and its fright level, and
 * the alert it answers (workspace spec 087), which the API closes with the first fear check.
 */
type GroupCheckPrefill = {
  kind?: GroupCheckKind;
  factionIds?: string[];
  frightLevel?: number | null;
  alertId?: string;
  /** Workspace spec 100: the side the check was suggested to (its leader leads it) and what triggered it. */
  sideId?: string;
  triggers?: string[];
};

/**
 * Fear, morale and rally checks of a group (workspace spec 022, §14.3), for the game master. The group is the
 * factions and actors picked (several allied factions, or a few actors), or the leader's side when none is. The
 * leader adds its Leadership to the fear RRs of the followers and rolls the morale and rally checks; the fright level
 * comes from Table 14-3a, the Intimidation ranks of an actor or the stat block of an NPC (workspace spec 068). Rolls
 * left empty are rolled by the API. The result lists every actor with its RR and the fear effect it got.
 */
const GroupCheckDialog: FC<{
  open: boolean;
  onClose: () => void;
  prefill?: GroupCheckPrefill;
}> = ({ open, onClose, prefill }) => {
  const { t } = useTranslation();
  const auth = useAuth();
  const { game, factions } = useCombatGame();
  const { actorRounds } = useCombatRound();
  const { updateActorRound } = useCombatActions();
  const [form, setForm] = useState<GroupCheckForm>(() => initialGroupCheckForm());
  const { busy, run } = useBusyAction();
  const [result, setResult] = useState<GroupCheckResult | null>(null);
  const [showInfo, setShowInfo] = useState(false);
  const rounds = actorRounds ?? [];
  const toOption = useActorRoundOption();
  const frightLevels = useFrightLevels();
  const { sides, allyFactionIds, sideLabel } = useSides();
  const allyFactions = (factionId: string) => allyFactionIds(factionId);
  const suggestedSide = sides.find((side) => side.id === prefill?.sideId);
  // A fallen leader gives no bonus (workspace spec 100): it is not proposed, the game master picks another one.
  const sideLeader = rounds.find(
    (actorRound) =>
      actorRound.actorId === suggestedSide?.leaderActorId && sideStrengthState(actorRound) === 'standing'
  );

  const startForm = () =>
    initialGroupCheckForm(prefill?.kind ?? 'fear', {
      ...(prefill?.factionIds ? { factionIds: prefill.factionIds } : {}),
      ...(sideLeader ? { leaderId: sideLeader.actorId } : {}),
      ...(prefill?.frightLevel !== undefined && prefill.frightLevel !== null
        ? { frightLevel: prefill.frightLevel }
        : {}),
    });

  useEffect(() => {
    if (!open) return;
    setForm(startForm());
    setResult(null);
    setShowInfo(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (!game) return null;

  const change = (patch: Partial<GroupCheckForm>) => setForm((prev) => ({ ...prev, ...patch }));
  const factionIds = [...new Set(rounds.map((actorRound) => actorRound.factionId))];
  const factionName = (id: string) => factions?.find((faction) => faction.id === id)?.name ?? id;
  const actorById = (id: string | null) => rounds.find((actorRound) => actorRound.actorId === id);
  const leader = actorById(form.leaderId);
  const npcOptions = rounds
    .filter((actorRound) => actorRound.actorType === 'npc')
    .map((actorRound) => toOption(actorRound));
  const members = groupMembers(form, rounds, allyFactions);
  const problem = groupCheckProblem(form, rounds, allyFactions);

  // A second check of the same dialog, or a morale or rally check, no longer answers the suggested alert
  const alertId = prefill?.alertId;
  const answersAlert =
    form.kind === 'fear' &&
    !!alertId &&
    rounds.some((actorRound) => actorRound.alerts?.some((a) => a.id === alertId && a.status === 'pending'));

  const submit = () => {
    run(
      groupCheck(
        game.id,
        form.kind,
        { ...toGroupCheckRequest(form, rounds, allyFactions), ...(answersAlert ? { alertId } : {}) },
        auth
      ).then((response) => {
        response.actorRounds.forEach(updateActorRound);
        setResult(response);
      })
    );
  };

  const actorOptions = rounds.map((actorRound) => toOption(actorRound));
  const actorSelect = (label: string, value: string | null, onChange: (id: string | null) => void) => (
    <Box sx={{ minWidth: 260 }}>
      <CharacterPicker
        variant="compact"
        clearable
        label={label}
        options={actorOptions}
        groupByFaction
        value={value}
        onChange={onChange}
        disabled={busy}
      />
    </Box>
  );

  const triggers = prefill?.triggers ?? [];
  const content = (
    <Stack spacing={2}>
      {answersAlert && (suggestedSide || triggers.length > 0) && (
        <Alert severity="warning" variant="outlined">
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {suggestedSide
              ? t('fear-check-suggested-side', { side: sideLabel(suggestedSide) })
              : t('alert-fear-check-suggested')}
          </Typography>
          {triggers.length > 0 && (
            <Box component="ul" sx={{ m: 0, pl: 2.5 }}>
              {triggers.map((trigger) => (
                <Typography component="li" variant="body2" key={trigger}>
                  {fearTriggerLabel(trigger, t)}
                </Typography>
              ))}
            </Box>
          )}
        </Alert>
      )}
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={{ xs: 0, sm: 1 }}
        sx={{ alignItems: { xs: 'flex-start', sm: 'center' }, borderBottom: 1, borderColor: 'divider' }}
      >
        <Tabs
          value={form.kind}
          onChange={(_, kind: GroupCheckKind) => change({ kind })}
          variant="scrollable"
          scrollButtons="auto"
          aria-label={t('group-checks')}
          sx={{ flexGrow: 1, minWidth: 0, maxWidth: '100%' }}
        >
          {KINDS.map((kind) => (
            <Tab key={kind} value={kind} label={t(`group-check-${kind}`)} disabled={busy} />
          ))}
        </Tabs>
        <Button
          size="small"
          startIcon={<InfoOutlinedIcon />}
          aria-expanded={showInfo}
          onClick={() => setShowInfo((value) => !value)}
          sx={{ flexShrink: 0 }}
        >
          {t('group-check-info')}
        </Button>
      </Stack>
      <Typography variant="caption" color="text.secondary">
        {t(`group-check-${form.kind}-help`)}
      </Typography>
      <Collapse in={showInfo} unmountOnExit>
        <GroupCheckInfo kind={form.kind} />
      </Collapse>

      <Stack spacing={1.5}>
        <Typography variant="subtitle2">{t('group')}</Typography>
        <Autocomplete
          multiple
          size="small"
          options={factionIds}
          value={form.factionIds}
          getOptionLabel={factionName}
          onChange={(_, value) => change({ factionIds: value })}
          renderInput={(params) => <TextField {...params} label={t('factions')} />}
          disabled={busy}
        />
        <CharacterPicker
          mode="multiple"
          variant="compact"
          label={t('actors')}
          options={actorOptions}
          groupByFaction
          value={form.actorIds}
          onChange={(actorIds) => change({ actorIds })}
          disabled={busy}
        />
        <Typography variant="caption" color="text.secondary">
          {members.length > 0
            ? t('group-members-n', { count: members.length, names: members.map((m) => m.actorName).join(', ') })
            : t('group-default-help')}
        </Typography>
      </Stack>

      <Stack spacing={1.5}>
        <Typography variant="subtitle2">{t('leader')}</Typography>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ alignItems: { sm: 'center' } }}>
          {actorSelect(t('leader'), form.leaderId, (leaderId) => change({ leaderId }))}
          <FormControlLabel
            control={
              <Checkbox
                checked={form.recognized}
                onChange={(event) => change({ recognized: event.target.checked })}
                disabled={busy || !leader}
              />
            }
            label={t('leader-recognized')}
          />
        </Stack>
        {isNpc(leader) && (
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <NumberPadField
              label={t('leadership-ranks')}
              value={form.leadershipRanks}
              onChange={(leadershipRanks) => change({ leadershipRanks })}
              integer
              min={0}
              disabled={busy}
            />
            {form.kind !== 'fear' && (
              <NumberPadField
                steps={[-10, -5, 5, 10]}
                label={t('leadership-bonus')}
                value={form.leadershipBonus}
                onChange={(leadershipBonus) => change({ leadershipBonus })}
                integer
                allowNegatives
                disabled={busy}
              />
            )}
          </Stack>
        )}
        <Typography variant="caption" color="text.secondary">
          {t(form.kind === 'fear' ? 'leader-fear-help' : 'leader-roll-help')}
        </Typography>
      </Stack>

      {form.kind === 'fear' && (
        <FrightSourceFields
          form={form}
          onChange={change}
          busy={busy}
          npcOptions={npcOptions}
          frightSource={actorById(form.frightSourceId)}
          intimidator={actorById(form.intimidatorId)}
          frightModifiers={frightLevels?.frightLevelModifiers ?? []}
          actorSelect={actorSelect}
        />
      )}

      {form.kind === 'morale' && (
        <DifficultyPicker value={form.difficulty} onChange={(difficulty) => change({ difficulty })} />
      )}

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        {form.kind !== 'fear' && (
          <RollField
            spec={OPEN_D100}
            label={t('leader-roll')}
            value={form.roll}
            onChange={(roll) => change({ roll: roll.total, unmodified: roll.unmodified })}
            onClear={() => change({ roll: null, unmodified: null })}
            placeholder={t('roll-by-server')}
            disabled={busy}
          />
        )}
        <NumberPadField
          steps={[-10, -5, 5, 10]}
          label={t('custom-bonus')}
          value={form.modifier}
          onChange={(modifier) => change({ modifier })}
          integer
          allowNegatives
          disabled={busy}
        />
      </Stack>
      {form.kind !== 'fear' && (
        <Typography variant="caption" color="text.secondary">
          {t('group-check-roll-help')}
        </Typography>
      )}

      {form.kind !== 'rally' && members.length > 0 && (
        <MemberRolls form={form} members={members} leaderId={form.leaderId} onChange={change} disabled={busy} />
      )}
    </Stack>
  );

  return (
    <RmuDialog
      open={open}
      onDismiss={onClose}
      title={t('group-checks')}
      subtitle={result ? t(`group-check-${form.kind}`) : undefined}
      maxWidth="md"
      buttons={
        result ? (
          <>
            <Button onClick={() => setResult(null)}>{t('new-check')}</Button>
            <Button variant="contained" onClick={onClose}>
              {t('close')}
            </Button>
          </>
        ) : (
          <>
            {problem && (
              <Typography variant="caption" color="warning.main" sx={{ mr: 'auto' }}>
                {t(problem)}
              </Typography>
            )}
            <Button onClick={onClose} disabled={busy}>
              {t('cancel')}
            </Button>
            <Button variant="contained" onClick={submit} disabled={!!problem || busy}>
              {t('roll')}
            </Button>
          </>
        )
      }
    >
      {result ? <GroupCheckResultView result={result} factionName={factionName} /> : content}
    </RmuDialog>
  );
};

export default GroupCheckDialog;
