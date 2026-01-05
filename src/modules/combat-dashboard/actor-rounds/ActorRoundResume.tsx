import React, { useContext, useState, useEffect, FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { Paper, Box, IconButton, Typography } from '@mui/material';
import { t } from 'i18next';
import { CombatContext } from '../../../CombatContext';
import { ActorRound } from '../../api/actor-rounds.dto';
import { Character } from '../../api/characters.dto';
import type { Faction } from '../../api/factions';
import ActorRoundAvatar from '../../shared/avatars/ActorRoundAvatar';
import GenericBar from '../../shared/generic/GenericBar';

const barSize = 120;
const colorHpOk = '#144214ff';
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
  const { characters, factions } = useContext(CombatContext)!;
  const [character, setCharacter] = useState<Character | null>(null);
  const [faction, setFaction] = useState<Faction | null>(null);

  const idDead = (): boolean => {
    return actorRound.effects.some((e) => e.status === 'dead');
  };

  const handleCharacterClick = () => {
    if (character) {
      navigate(`/strategic/characters/view/${character.id}`);
    }
  };

  useEffect(() => {
    if (actorRound && characters && factions) {
      const check = characters.find((c: Character) => c.id === actorRound.actorId) || null;
      setCharacter(check);
      setFaction(check ? factions.find((f: Faction) => f.id === check.factionId) || null : null);
    }
  }, [actorRound, characters, factions]);

  if (!character) return <p>CombatCharacterRoundInfo Loading...</p>;

  return (
    <Paper sx={{ p: 1, boxShadow: 'none' }}>
      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
        <IconButton onClick={handleCharacterClick} size="small" sx={{ p: 0.5 }}>
          <ActorRoundAvatar actorRound={actorRound} dead={idDead()} variant="square" size={40} />
        </IconButton>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="body2" color="primary" noWrap>
            {character.name}
          </Typography>
          <Typography variant="caption" color="text.secondary" noWrap>
            {character.info.raceName} · {t(character.info.professionId)} · lvl {character.experience.level} ·{' '}
            {faction?.name}
          </Typography>
        </Box>
      </Box>

      <Box sx={{ mt: 0.5, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
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
      </Box>
    </Paper>
  );
};

export default ActorRoundResume;
