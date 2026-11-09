import { FC, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Stack, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';
import { CharacterOption, CharacterPicker, NumberPadField } from '@labcabrera-rmu/rmu-react-shared-lib';
import { ActorRound } from '../../../api/actor-rounds.dto';
import FrightLevelInput from '../FrightLevelInput';
import { GroupCheckForm, isNpc } from './group-check';

/** Where the fright level of a fear check comes from: a level, the Intimidation of an actor, or the stat block of an NPC. */
const FrightSourceFields: FC<{
  form: GroupCheckForm;
  onChange: (patch: Partial<GroupCheckForm>) => void;
  busy: boolean;
  npcOptions: CharacterOption[];
  frightSource: ActorRound | undefined;
  intimidator: ActorRound | undefined;
  frightModifiers: { key: string; level: number }[];
  actorSelect: (label: string, value: string | null, onChange: (id: string | null) => void) => ReactNode;
}> = ({ form, onChange, busy, npcOptions, frightSource, intimidator, frightModifiers, actorSelect }) => {
  const { t } = useTranslation();
  const sourceLevel = frightSource?.frightLevel ?? null;
  return (
    <Stack spacing={1.5}>
      <Typography variant="subtitle2">{t('fright-level')}</Typography>
      <ToggleButtonGroup
        size="small"
        exclusive
        value={form.frightSource}
        onChange={(_, frightSource) => frightSource && onChange({ frightSource })}
      >
        <ToggleButton value="level">{t('fright-source-level')}</ToggleButton>
        <ToggleButton value="intimidator">{t('fright-source-intimidator')}</ToggleButton>
        <ToggleButton value="npc" disabled={npcOptions.length === 0}>
          {t('fright-source-npc')}
        </ToggleButton>
      </ToggleButtonGroup>
      {form.frightSource === 'level' ? (
        <FrightLevelInput value={form.frightLevel} onChange={(frightLevel) => onChange({ frightLevel })} />
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
              onChange={(frightSourceId) => onChange({ frightSourceId })}
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
              frightLevelModifier !== null && onChange({ frightLevelModifier })
            }
            aria-label={t('fright-level-modifier')}
          >
            <ToggleButton value={0}>{t('none')}</ToggleButton>
            {frightModifiers.map((modifier) => (
              <ToggleButton key={modifier.key} value={modifier.level}>
                {`${t(`fright-${modifier.key}`, { defaultValue: modifier.key })} +${modifier.level}`}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        </Stack>
      ) : (
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          {actorSelect(t('intimidator'), form.intimidatorId, (intimidatorId) => onChange({ intimidatorId }))}
          {isNpc(intimidator) && (
            <NumberPadField
              label={t('intimidation-ranks')}
              value={form.intimidationRanks}
              onChange={(intimidationRanks) => onChange({ intimidationRanks })}
              integer
              min={0}
              disabled={busy}
            />
          )}
        </Stack>
      )}
    </Stack>
  );
};

export default FrightSourceFields;
