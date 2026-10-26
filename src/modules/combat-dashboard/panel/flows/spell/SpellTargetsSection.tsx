import React, { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Button, Checkbox, FormControlLabel, MenuItem, Stack, TextField, Typography } from '@mui/material';
import { OPEN_D100, RollField } from '@labcabrera-rmu/rmu-react-shared-lib';
import { ActionSpell, SpellTargetConditions, SpellTargetRoll } from '../../../../api/action.dto';
import { ActorRound } from '../../../../api/actor-rounds.dto';

const COVERS = ['none', 'partial', 'full'] as const;
const RANGES = ['touch', 'close', 'normal', 'far'] as const;
const PROTECTIONS = ['none', 'organic', 'metal'] as const;

type TargetForm = { roll: number | null; conditions: SpellTargetConditions };

const Condition: FC<{
  label: string;
  value: string;
  values: readonly string[];
  prefix: string;
  onChange: (value: string) => void;
}> = ({ label, value, values, prefix, onChange }) => {
  const { t } = useTranslation();
  return (
    <TextField select size="small" label={label} value={value} onChange={(e) => onChange(e.target.value)} sx={{ minWidth: 130 }}>
      {values.map((each) => (
        <MenuItem key={each} value={each}>
          {t(`${prefix}-${each}`)}
        </MenuItem>
      ))}
    </TextField>
  );
};

/**
 * Resistance rolls of the targets of a successful cast (Spell Law 4.5): the actors it affects, each with its roll and
 * the Table 4-5 conditions. A willing target of a Utility spell takes no roll.
 */
const SpellTargetsSection: FC<{
  spell: ActionSpell;
  candidates: ActorRound[];
  busy: boolean;
  onResolve: (targets: SpellTargetRoll[]) => void;
}> = ({ spell, candidates, busy, onResolve }) => {
  const { t } = useTranslation();
  const [forms, setForms] = useState<Record<string, TargetForm>>(() =>
    Object.fromEntries(
      (spell.targets ?? []).map((target) => [target.actorId, { roll: target.roll, conditions: target.conditions }])
    )
  );
  const realms = spell.spell.listRealms;
  const allowsWilling = spell.spell.resistance?.kind === 'willing';

  const toggle = (actorId: string, checked: boolean) =>
    setForms((prev) => {
      const next = { ...prev };
      if (checked) next[actorId] = { roll: null, conditions: {} };
      else delete next[actorId];
      return next;
    });
  const change = (actorId: string, patch: Partial<TargetForm>) =>
    setForms((prev) => ({ ...prev, [actorId]: { ...prev[actorId], ...patch } }));
  const changeConditions = (actorId: string, patch: Partial<SpellTargetConditions>) =>
    setForms((prev) => ({ ...prev, [actorId]: { ...prev[actorId], conditions: { ...prev[actorId].conditions, ...patch } } }));

  const chosen = Object.entries(forms);
  const ready =
    chosen.length > 0 && chosen.every(([, form]) => form.roll !== null || (allowsWilling && form.conditions.willing));

  const resolve = () =>
    onResolve(
      chosen.map(([actorId, form]) => ({
        actorId,
        roll: form.roll ?? undefined,
        conditions: form.conditions,
      }))
    );

  return (
    <Stack spacing={1.5}>
      <Typography variant="subtitle2">{t('spell-resistance-rolls')}</Typography>
      {candidates.map((candidate) => {
        const form = forms[candidate.actorId];
        const willing = allowsWilling && !!form?.conditions.willing;
        return (
          <Box key={candidate.actorId}>
            <FormControlLabel
              control={<Checkbox checked={!!form} onChange={(e) => toggle(candidate.actorId, e.target.checked)} />}
              label={candidate.actorName}
            />
            {form && (
              <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 2, alignItems: 'center', pl: 4 }}>
                {allowsWilling && (
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={willing}
                        onChange={(e) => changeConditions(candidate.actorId, { willing: e.target.checked })}
                      />
                    }
                    label={t('spell-willing')}
                  />
                )}
                {!willing && (
                  <>
                    <Box sx={{ width: 180 }}>
                      <RollField
                        spec={OPEN_D100}
                        label={t('resistance-roll')}
                        value={form.roll}
                        onChange={(roll) => change(candidate.actorId, { roll: roll.total })}
                        onClear={() => change(candidate.actorId, { roll: null })}
                      />
                    </Box>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={!!form.conditions.surprisedOrStunned}
                          onChange={(e) => changeConditions(candidate.actorId, { surprisedOrStunned: e.target.checked })}
                        />
                      }
                      label={t('spell-surprised-stunned')}
                    />
                    <Condition
                      label={t('spell-cover')}
                      value={form.conditions.cover ?? 'none'}
                      values={COVERS}
                      prefix="spell-cover"
                      onChange={(cover) => changeConditions(candidate.actorId, { cover: cover as SpellTargetConditions['cover'] })}
                    />
                    <Condition
                      label={t('spell-range')}
                      value={form.conditions.range ?? 'normal'}
                      values={RANGES}
                      prefix="spell-range"
                      onChange={(range) => changeConditions(candidate.actorId, { range: range as SpellTargetConditions['range'] })}
                    />
                    {realms.some((realm) => realm !== 'mentalism') && (
                      <Condition
                        label={t('spell-armor')}
                        value={form.conditions.armor ?? 'none'}
                        values={PROTECTIONS}
                        prefix="spell-protection"
                        onChange={(armor) =>
                          changeConditions(candidate.actorId, { armor: armor as SpellTargetConditions['armor'] })
                        }
                      />
                    )}
                    {realms.includes('mentalism') && (
                      <Condition
                        label={t('spell-helmet')}
                        value={form.conditions.helmet ?? 'none'}
                        values={PROTECTIONS}
                        prefix="spell-protection"
                        onChange={(helmet) =>
                          changeConditions(candidate.actorId, { helmet: helmet as SpellTargetConditions['helmet'] })
                        }
                      />
                    )}
                  </>
                )}
              </Stack>
            )}
          </Box>
        );
      })}
      <Box>
        <Button variant="outlined" disabled={!ready || busy} onClick={resolve}>
          {t('spell-resolve-resistance')}
        </Button>
      </Box>
    </Stack>
  );
};

export default SpellTargetsSection;
