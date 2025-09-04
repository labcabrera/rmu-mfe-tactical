/* eslint-disable react/prop-types */
import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { createAction } from '../api/actions';
import CircleButtonGroup from '../shared/generic/CircleButtonGroup';
import { CombatContext } from './../../CombatContext';

const CombatActorRoundPhaseActionButtons = ({ actorRound, phaseNumber }) => {
  const navigate = useNavigate();
  const { game } = useContext(CombatContext);
  const { roundActions, setRoundActions } = useContext(CombatContext);

  const declareAttack = () => {
    const actionData = {
      gameId: game.id,
      actorId: actorRound.actorId,
      actionType: 'attack',
      phaseStart: phaseNumber,
    };
    declareAction(actionData);
  };

  const declareMovement = () => {
    const actionData = {
      gameId: game.id,
      actorId: actorRound.actorId,
      actionType: 'movement',
      phaseStart: phaseNumber,
    };
    declareAction(actionData);
  };

  const declareAction = (actionData) => {
    createAction(actionData)
      .then((action) => {
        setRoundActions([...roundActions, action]);
      })
      .catch((error) => {
        console.error(`Error declaring ${actionData.actionType} action:`, error);
      });
  };

  const options = [
    {
      src: '/static/images/actions/movement.png',
      alt: 'Movement',
      action: () => {
        declareMovement();
        return;
      },
    },
    {
      src: '/static/images/actions/attack.png',
      alt: 'Declare attack',
      action: () => {
        declareAttack();
        return;
      },
    },
    {
      src: '/static/images/actions/movement-maneuver.png',
      alt: 'Movement maneuver',
      action: () => {
        declareMovement();
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

  return <CircleButtonGroup options={options} initialRotation={3.46} size={60} radius={40} xOffset={-70} yOffset={-110} />;
};

export default CombatActorRoundPhaseActionButtons;
