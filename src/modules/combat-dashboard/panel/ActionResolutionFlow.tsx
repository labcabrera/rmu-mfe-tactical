import React, { FC } from 'react';
import { Action, SIMPLE_ACTION_TYPES } from '../../api/action.dto';
import { ActorRound } from '../../api/actor-rounds.dto';
import ManeuverFlow from './flows/ManeuverFlow';
import MovementFlow from './flows/MovementFlow';
import SimpleActionFlow from './flows/SimpleActionFlow';
import AttackFlow from './flows/attack/AttackFlow';
import SpellCastFlow from './flows/spell/SpellCastFlow';

type ActionViewProps = {
  action: Action;
  actorRound: ActorRound;
  onDeleted: () => void;
  onNextPending?: () => void;
};

/** Guided resolution of an action, with the flow of its type (shown in the resolution dialog). */
const ActionResolutionFlow: FC<ActionViewProps> = (props) => {
  if (props.action.actionType === 'movement') return <MovementFlow {...props} />;
  if (props.action.actionType === 'maneuver') return <ManeuverFlow {...props} />;
  if (props.action.actionType === 'cast_spell' && props.action.spell) return <SpellCastFlow {...props} />;
  if (SIMPLE_ACTION_TYPES.includes(props.action.actionType)) return <SimpleActionFlow {...props} />;
  if (props.action.actionType === 'ranged_attack') return <AttackFlow kind="ranged" {...props} />;
  return <AttackFlow kind="melee" {...props} />;
};

export default ActionResolutionFlow;
