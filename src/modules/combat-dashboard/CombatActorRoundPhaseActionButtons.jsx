import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import CircleButtonGroup from '../shared/generic/CircleButtonGroup';
import { CombatContext } from './CombatProvider';

const CombatActorRoundPhaseActionButtons = ({ game, actorRound, character, phaseNumber }) => {
  const navigate = useNavigate();
  const { characters } = useContext(CombatContext);

  const options = [
    {
      src: '/static/images/actions/movement.png',
      alt: 'Movement',
      action: () => {
        navigate(`/tactical/combat/${game.id}/declare-movement?phaseStart=${phaseNumber}`, { state: { game, actorRound } });
        return;
      },
    },
    {
      src: '/static/images/actions/attack.png',
      alt: 'Declare attack',
      action: () => {
        navigate(`/tactical/combat/${game.id}/declare-attack?phaseStart=${phaseNumber}`, { state: { game, actorRound, character, characters } });
        return;
      },
    },
    {
      src: '/static/images/actions/movement-maneuver.png',
      alt: 'Movement maneuver',
      action: () => {
        navigate(`/tactical/combat/${game.id}/declare-movement-maneuver?phaseStart=${phaseNumber}`, { state: { game, character: actorRound } });
        return;
      },
    },
    {
      src: '/static/images/actions/static-maneuver.png',
      alt: 'Static maneuver',
      action: () => {
        navigate(`/tactical/combat/${game.id}/declare-static-maneuver?phaseStart=${phaseNumber}`, { state: { game, character: actorRound } });
        return;
      },
    },
    {
      src: '/static/images/actions/cast-spell.png',
      alt: 'Cast spell',
      action: () => {
        navigate(`/tactical/combat/${game.id}/cast-spell?phaseStart=${phaseNumber}`, { state: { game, character: actorRound } });
        return;
      },
    },
  ];

  if (!game || !actorRound || !phaseNumber) {
    return <p>Loading...</p>;
  }

  return <CircleButtonGroup options={options} initialRotation={3.46} size={70} radius={48} xOffset={35} />;
};

export default CombatActorRoundPhaseActionButtons;
