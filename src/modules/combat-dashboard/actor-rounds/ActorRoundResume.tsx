import React, { useContext, useState, useEffect, FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Stack, Typography } from '@mui/material';
import { t } from 'i18next';
import { CombatContext } from '../../../CombatContext';
import { ActorRound } from '../../api/actor-rounds.dto';
import { Character } from '../../api/characters.dto';
import type { Faction } from '../../api/factions';
import { getPhaseAsNumber } from '../../api/tactical-games';
import ImageCard from '../../shared/cards/ImageCard';
import GenericBar from '../../shared/generic/GenericBar';

const barSize = 96;
const colorHpOk = '#253a4bff';
const colorPowerOk = '#4180d3';
const colorEnduranceOk = '#433a21ff';
const colorEnduranceAccumulator = '#686868';
const colorKo = '#2e140aff';

/**
 * Component that displays general information about the actor, such as their name, health bar, etc.
 */
const ActorRoundResume: FC<{
  actorRound: ActorRound;
}> = ({ actorRound }) => {
  const navigate = useNavigate();
  const { characters, actorRounds, factions, roundActions, game } = useContext(CombatContext)!;
  const [character, setCharacter] = useState<Character | null>(null);
  const [faction, setFaction] = useState<Faction | null>(null);
  const isDead = actorRound.effects.some((e) => e.status === 'dead');

  const handleCharacterClick = () => {
    if (character) {
      navigate(`/strategic/characters/view/${character.id}`);
    }
  };

  const checkInitiative = (): boolean => {
    if (!actorRound.initiative || !actorRound.initiative.total) return false;
    // Exclude actorRounds that already have declared actions for this round
    const currentPhase = getPhaseAsNumber(game);
    const declaredActorIds = (roundActions || [])
      .filter((a) => a && a.status === 'declared' && (!currentPhase || a.phaseStart === currentPhase))
      .map((a) => a.actorId);
    if (declaredActorIds.includes(actorRound.actorId)) return false;
    const eligible = actorRounds.filter(
      (r) => r.initiative && r.initiative.total && !declaredActorIds.includes(r.actorId)
    );
    if (!eligible || eligible.length === 0) return false;
    const topInitiative = eligible.reduce((prev, current) =>
      prev.initiative!.total > current.initiative!.total ? prev : current
    );
    if (!topInitiative || !topInitiative.initiative || !topInitiative.initiative.total) return false;
    if (topInitiative.id !== actorRound.id) return false;
    return true;
  };

  const hasInitiative = checkInitiative();

  useEffect(() => {
    if (actorRound && characters && factions) {
      const check = characters.find((c: Character) => c.id === actorRound.actorId) || null;
      setCharacter(check);
      setFaction(check ? factions.find((f: Faction) => f.id === check.factionId) || null : null);
    }
  }, [actorRound, characters, factions]);

  if (!character) return <p>CombatCharacterRoundInfo Loading...</p>;

  return (
    <ImageCard
      image={actorRound.imageUrl || '/static/images/races/unknown.png'}
      imageSize={140}
      height={140}
      minWidth={hasInitiative ? 440 : 420}
      highlight={hasInitiative}
      disabled={isDead}
      onClick={handleCharacterClick}
    >
      <Box>
        <Typography variant="body2" color="primary" noWrap>
          {character.name}
        </Typography>
        <Typography variant="caption" color="text.secondary" noWrap>
          {character.info.raceName} · {t(character.info.professionId)} · lvl {character.experience.level} ·{' '}
          {faction?.name}
        </Typography>

        <Stack direction="column" spacing={1} alignItems="flex-start">
          <GenericBar
            current={actorRound.hp.current}
            max={actorRound.hp.max}
            title=""
            width={barSize}
            colorOk={colorHpOk}
          />
          {character.power && character.power.max > 0 && (
            <GenericBar
              current={character.power.current}
              max={character.power.max}
              title=""
              width={barSize}
              colorOk={colorPowerOk}
              colorKo={colorEnduranceAccumulator}
            />
          )}
          <GenericBar
            current={Math.round(actorRound.fatigue.accumulator)}
            max={100}
            title=""
            width={barSize}
            colorOk={colorKo}
            colorKo={colorEnduranceOk}
          />
        </Stack>
      </Box>
    </ImageCard>
  );
};

export default ActorRoundResume;
