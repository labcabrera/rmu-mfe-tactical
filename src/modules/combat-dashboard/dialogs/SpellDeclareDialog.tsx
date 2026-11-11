import { FC, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
import { Box, Button, ButtonBase, Chip, Stack, Typography } from '@mui/material';
import {
  Character,
  ChipRow,
  EmptyState,
  fetchCharacterSpells,
  LoadingState,
  RmuDialog,
  SectionLabel,
  selectableSx,
  useApiNotify,
  useSpellName,
} from '@labcabrera-rmu/rmu-react-shared-lib';
import { useQuery } from '@tanstack/react-query';
import { Action } from '../../api/action.dto';
import { ActorRound } from '../../api/actor-rounds.dto';
import { useCombatGame, useCombatRound } from '../../combat/combat-context';
import { isActionOpen } from '../../services/ap-service';

type SpellDeclaration = { listCode: string; spellId: string };

/** Skills whose specialization is a spell list (spec 029). */
const SPELL_LIST_SKILLS = [
  'base-spell-list',
  'open-spell-list',
  'closed-spell-list',
  'arcane-spell-list',
  'restricted-spell-list',
];

/** Strategic character of an actor of the game, when it is a character. */
export const actorCharacter = (actorRound: ActorRound | null, characters: Character[] | null): Character | undefined =>
  actorRound ? characters?.find((c) => c.id === (actorRound.characterId ?? actorRound.actorId)) : undefined;

/** The character casts spells: it has power points or a spell list (spec 029). */
export const isCaster = (character: Character | undefined): boolean =>
  !!character &&
  (!!character.power || character.skills.some((s) => SPELL_LIST_SKILLS.includes(s.skillId) && !!s.specialization));

/** Power points the actor's open casts of the round already take (the API counts them too). */
const committedPower = (actions: Action[], actorId: string): number =>
  actions
    .filter((a) => a.actorId === actorId && a.actionType === 'cast_spell' && isActionOpen(a))
    .reduce((sum, a) => sum + (a.spell?.spell.powerPoints ?? 0), 0);

/**
 * Chooses the spell of a cast (spec 030, decision 20): the lists of the caster's spellbook with the spells it knows,
 * their level, power points, type and instantaneous mark. Spells it cannot pay are disabled, and the overcast ones
 * warned. For an instantaneous cast only instantaneous spells are offered.
 */
const SpellDeclareDialog: FC<{
  open: boolean;
  actorRound: ActorRound | null;
  instant: boolean;
  busy: boolean;
  onClose: () => void;
  onDeclare: (declaration: SpellDeclaration) => void;
}> = ({ open, actorRound, instant, busy, onClose, onDeclare }) => {
  const { t } = useTranslation();
  const spellName = useSpellName();
  const auth = useAuth();
  const notify = useApiNotify();
  const { characters } = useCombatGame();
  const { roundActions } = useCombatRound();
  const character = actorCharacter(actorRound, characters);
  const listsQuery = useQuery({
    queryKey: ['spell-declare', 'character-spells', character?.id],
    queryFn: () => fetchCharacterSpells(character?.id as string, auth),
    enabled: open && !!character,
    gcTime: 0,
  });
  // Read again each time it opens: the spinner stays until then, and a failed read leaves no lists.
  const lists = listsQuery.isFetching ? null : listsQuery.isError ? [] : (listsQuery.data ?? null);
  const [choice, setChoice] = useState<SpellDeclaration | null>(null);

  useEffect(() => {
    if (open && character) setChoice(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, character?.id]);

  useEffect(() => {
    if (listsQuery.error) notify.error(listsQuery.error);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listsQuery.error]);

  const available = (character?.power?.current ?? 0) - committedPower(roundActions ?? [], actorRound?.actorId ?? '');
  const level = character?.experience.level ?? 0;
  const knownLists = (lists ?? []).filter((list) =>
    list.spells.some((known) => !instant || known.spell.modifiers?.instant)
  );

  return (
    <RmuDialog
      open={open}
      onDismiss={onClose}
      maxWidth="md"
      title={t(instant ? 'instant-spell' : 'spell')}
      subtitle={`${actorRound?.actorName ?? ''} · ${t('power-points')}: ${Math.max(0, available)}`}
      buttons={
        <>
          <Button onClick={onClose}>{t('cancel')}</Button>
          <Button variant="contained" disabled={!choice || busy} onClick={() => choice && onDeclare(choice)}>
            {t('declare')}
          </Button>
        </>
      }
    >
      {!lists && <LoadingState variant="inline" />}
      {lists && knownLists.length === 0 && (
        <EmptyState dense title={t(instant ? 'no-instant-spells' : 'no-known-spells')} />
      )}
      <Stack spacing={2}>
        {knownLists.map((list) => (
          <Box key={list.code}>
            <SectionLabel
              sx={{ mb: 0.5 }}
              actions={
                <ChipRow>
                  <Chip size="small" label={t(list.skillId)} />
                  <Chip size="small" variant="outlined" label={`${t('ranks')}: ${list.ranks}`} />
                </ChipRow>
              }
            >
              {list.name ? spellName(list.name) : list.code}
            </SectionLabel>
            <Box
              role="radiogroup"
              aria-label={list.name ? spellName(list.name) : list.code}
              sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 1 }}
            >
              {list.spells
                .filter((known) => !instant || known.spell.modifiers?.instant)
                .map((known) => {
                  const spell = known.spell;
                  const selected = choice?.listCode === list.code && choice.spellId === spell.id;
                  const affordable = known.powerPoints <= available;
                  const overcast = spell.level > level;
                  return (
                    <ButtonBase
                      key={spell.id}
                      role="radio"
                      aria-checked={selected}
                      disabled={!affordable}
                      onClick={() => setChoice({ listCode: list.code, spellId: spell.id })}
                      onDoubleClick={() => affordable && !busy && onDeclare({ listCode: list.code, spellId: spell.id })}
                      sx={[
                        selectableSx(selected, !affordable),
                        { flexDirection: 'column', alignItems: 'stretch', px: 1.5, py: 1, textAlign: 'left' },
                      ]}
                    >
                      <Stack
                        direction="row"
                        spacing={1}
                        sx={{ alignItems: 'baseline', justifyContent: 'space-between' }}
                      >
                        <Typography variant="body2" sx={{ fontWeight: selected ? 600 : 500 }}>
                          {`${spell.level}. ${spellName(spell.name)}`}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" noWrap>
                          {t('spell-power-points', { count: known.powerPoints })}
                        </Typography>
                      </Stack>
                      <Typography variant="caption" color={overcast ? 'warning.main' : 'text.secondary'}>
                        {[
                          spell.modifiers?.typeCode,
                          spell.modifiers?.instant ? t('instantaneous') : null,
                          overcast ? t('overcast-warning') : null,
                          affordable ? null : t('err-insufficient-power'),
                        ]
                          .filter(Boolean)
                          .join(' · ')}
                      </Typography>
                    </ButtonBase>
                  );
                })}
            </Box>
          </Box>
        ))}
      </Stack>
    </RmuDialog>
  );
};

export default SpellDeclareDialog;
