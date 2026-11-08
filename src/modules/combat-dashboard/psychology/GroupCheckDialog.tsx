import React, { FC, useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
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
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import {
  CharacterPicker,
  DifficultyPicker,
  formatBonus,
  NumberPadField,
  OPEN_D100,
  RmuDialog,
  RollField,
} from '@labcabrera-rmu/rmu-react-shared-lib';
import { CombatContext } from '../../../CombatContext';
import FrightLevelInput from '../../actor-round/psychology/FrightLevelInput';
import { fearBonus } from '../../actor-round/psychology/ResistanceRollDialog';
import { ActorRound } from '../../api/actor-rounds.dto';
import { groupCheck } from '../../api/psychology';
import { GroupCheckKind, GroupCheckResult } from '../../api/psychology.dto';
import { useActorRoundOption } from '../../services/actor-round-option';
import { useFrightLevels } from '../../services/core-tables';
import { useTacticalNotify } from '../../services/notify-service';
import GroupCheckInfo from './GroupCheckInfo';
import GroupCheckResultView from './GroupCheckResultView';
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
export type GroupCheckPrefill = {
  kind?: GroupCheckKind;
  factionIds?: string[];
  frightLevel?: number | null;
  alertId?: string;
};

/**
 * Fear, morale and rally checks of a group (workspace spec 022, §14.3), for the game master. The group is the
 * factions and actors picked (several allied factions, or a few actors), or the leader's faction when none is. The
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
  const notify = useTacticalNotify();
  const { game, actorRounds, factions, updateActorRound } = useContext(CombatContext)!;
  const [form, setForm] = useState<GroupCheckForm>(() => initialGroupCheckForm());
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<GroupCheckResult | null>(null);
  const [showInfo, setShowInfo] = useState(false);
  const rounds = actorRounds ?? [];
  const toOption = useActorRoundOption();
  const frightLevels = useFrightLevels();

  const startForm = () =>
    initialGroupCheckForm(prefill?.kind ?? 'fear', {
      ...(prefill?.factionIds ? { factionIds: prefill.factionIds } : {}),
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
  const intimidator = actorById(form.intimidatorId);
  const frightSource = actorById(form.frightSourceId);
  const sourceLevel = frightSource?.frightLevel ?? null;
  const npcOptions = rounds
    .filter((actorRound) => actorRound.actorType === 'npc')
    .map((actorRound) => toOption(actorRound));
  const members = groupMembers(form, rounds);
  const problem = groupCheckProblem(form, rounds);

  // A second check of the same dialog, or a morale or rally check, no longer answers the suggested alert
  const alertId = prefill?.alertId;
  const answersAlert =
    form.kind === 'fear' &&
    !!alertId &&
    rounds.some((actorRound) => actorRound.alerts?.some((a) => a.id === alertId && a.status === 'pending'));

  const submit = () => {
    setBusy(true);
    groupCheck(game.id, form.kind, { ...toGroupCheckRequest(form, rounds), ...(answersAlert ? { alertId } : {}) }, auth)
      .then((response) => {
        response.actorRounds.forEach(updateActorRound);
        setResult(response);
      })
      .catch((err) => notify.error(err))
      .finally(() => setBusy(false));
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

  const content = (
    <Stack spacing={2}>
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
        <Stack spacing={1.5}>
          <Typography variant="subtitle2">{t('fright-level')}</Typography>
          <ToggleButtonGroup
            size="small"
            exclusive
            value={form.frightSource}
            onChange={(_, frightSource) => frightSource && change({ frightSource })}
          >
            <ToggleButton value="level">{t('fright-source-level')}</ToggleButton>
            <ToggleButton value="intimidator">{t('fright-source-intimidator')}</ToggleButton>
            <ToggleButton value="npc" disabled={npcOptions.length === 0}>
              {t('fright-source-npc')}
            </ToggleButton>
          </ToggleButtonGroup>
          {form.frightSource === 'level' ? (
            <FrightLevelInput value={form.frightLevel} onChange={(frightLevel) => change({ frightLevel })} />
          ) : form.frightSource === 'npc' ? (
            <Stack spacing={1}>
              <Box sx={{ minWidth: 260 }}>
                <CharacterPicker
                  variant="compact"
                  clearable
                  label={t('fright-source-npc')}
                  options={npcOptions}
                  groupByFaction
                  value={form.frightSourceId}
                  onChange={(frightSourceId) => change({ frightSourceId })}
                  disabled={busy}
                />
              </Box>
              {frightSource && (
                <Typography variant="body2" color={sourceLevel === null ? 'warning.main' : 'text.secondary'}>
                  {sourceLevel === null
                    ? t('err-fright-source-no-level')
                    : t('fright-source-npc-level', {
                        level: sourceLevel,
                        total: sourceLevel + form.frightLevelModifier,
                      })}
                </Typography>
              )}
              <ToggleButtonGroup
                size="small"
                exclusive
                value={form.frightLevelModifier}
                onChange={(_, frightLevelModifier: number | null) =>
                  frightLevelModifier !== null && change({ frightLevelModifier })
                }
                aria-label={t('fright-level-modifier')}
              >
                <ToggleButton value={0}>{t('none')}</ToggleButton>
                {(frightLevels?.frightLevelModifiers ?? []).map((modifier) => (
                  <ToggleButton key={modifier.key} value={modifier.level}>
                    {`${t(`fright-${modifier.key}`, { defaultValue: modifier.key })} +${modifier.level}`}
                  </ToggleButton>
                ))}
              </ToggleButtonGroup>
            </Stack>
          ) : (
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              {actorSelect(t('intimidator'), form.intimidatorId, (intimidatorId) => change({ intimidatorId }))}
              {isNpc(intimidator) && (
                <NumberPadField
                  label={t('intimidation-ranks')}
                  value={form.intimidationRanks}
                  onChange={(intimidationRanks) => change({ intimidationRanks })}
                  integer
                  min={0}
                  disabled={busy}
                />
              )}
            </Stack>
          )}
        </Stack>
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

/**
 * Rolls and RR bonuses of each member, optional: the API rolls the missing ones and reads the bonus from the sheet
 * (an NPC needs its bonus, or it is left out of the check).
 */
const MemberRolls: FC<{
  form: GroupCheckForm;
  members: ActorRound[];
  leaderId: string | null;
  onChange: (patch: Partial<GroupCheckForm>) => void;
  disabled: boolean;
}> = ({ form, members, leaderId, onChange, disabled }) => {
  const { t } = useTranslation();
  const followers = members.filter((member) => member.actorId !== leaderId || form.kind === 'fear');
  const missingNpcBonus = followers.filter(
    (member) => fearBonus(member) === undefined && (form.bonuses[member.actorId] ?? null) === null
  ).length;
  return (
    <Accordion disableGutters variant="outlined">
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Stack>
          <Typography variant="body2">{t('member-rolls')}</Typography>
          {missingNpcBonus > 0 && (
            <Typography variant="caption" color="warning.main">
              {t('member-rolls-missing-bonus', { count: missingNpcBonus })}
            </Typography>
          )}
        </Stack>
      </AccordionSummary>
      <AccordionDetails>
        <Stack spacing={1}>
          {followers.map((member) => {
            const sheet = fearBonus(member);
            return (
              <Stack
                key={member.actorId}
                direction={{ xs: 'column', sm: 'row' }}
                spacing={1.5}
                sx={{ alignItems: { sm: 'center' } }}
              >
                <Box sx={{ minWidth: 160 }}>
                  <Typography variant="body2">{member.actorName}</Typography>
                </Box>
                {form.kind === 'fear' && (
                  <RollField
                    spec={OPEN_D100}
                    label={t('roll')}
                    value={form.rolls[member.actorId] ?? null}
                    onChange={(value) => onChange({ rolls: { ...form.rolls, [member.actorId]: value.total } })}
                    onClear={() => onChange({ rolls: { ...form.rolls, [member.actorId]: null } })}
                    placeholder={t('roll-by-server')}
                    disabled={disabled}
                  />
                )}
                <NumberPadField
                  steps={[-10, -5, 5, 10]}
                  label={t('fear-rr-bonus')}
                  value={form.bonuses[member.actorId] ?? null}
                  onChange={(value) => onChange({ bonuses: { ...form.bonuses, [member.actorId]: value } })}
                  placeholder={sheet !== undefined ? formatBonus(sheet) : undefined}
                  error={sheet === undefined && (form.bonuses[member.actorId] ?? null) === null}
                  integer
                  allowNegatives
                  disabled={disabled}
                />
              </Stack>
            );
          })}
        </Stack>
      </AccordionDetails>
    </Accordion>
  );
};

export default GroupCheckDialog;
