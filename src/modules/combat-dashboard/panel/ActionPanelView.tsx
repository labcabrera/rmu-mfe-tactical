import React, { FC } from 'react';
import { Action, SIMPLE_ACTION_TYPES } from '../../api/action.dto';
import { ActorRound } from '../../api/actor-rounds.dto';
import ManeuverFlow from './flows/ManeuverFlow';
import MovementFlow from './flows/MovementFlow';
import SimpleActionFlow from './flows/SimpleActionFlow';
import AttackFlow from './flows/attack/AttackFlow';

type ActionViewProps = {
  action: Action;
  actorRound: ActorRound;
  onDeleted: () => void;
  onNextPending?: () => void;
};

/** An action in the side panel, with the flow of its type. */
const ActionPanelView: FC<ActionViewProps> = (props) => {
  if (props.action.actionType === 'movement') return <MovementFlow {...props} />;
  if (props.action.actionType === 'maneuver') return <ManeuverFlow {...props} />;
  if (SIMPLE_ACTION_TYPES.includes(props.action.actionType)) return <SimpleActionFlow {...props} />;
  if (props.action.actionType === 'ranged_attack') return <AttackFlow kind="ranged" {...props} />;
  return <AttackFlow kind="melee" {...props} />;
};

export default ActionPanelView;
