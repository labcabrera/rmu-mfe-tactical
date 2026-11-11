import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Typography } from '@mui/material';
import { CategorySeparator } from '@labcabrera-rmu/rmu-react-shared-lib';
import { ActionAttack } from '../../../api/action.dto';
import { ActorRound } from '../../../api/actor-rounds.dto';
import { attackLabel } from '../../../services/attack-label';
import AttackSizeVsTarget from './AttackSizeVsTarget';

const AttackTitle: FC<{
  attack: ActionAttack;
  target: ActorRound;
  /** Size of the attack in steps from Medium (spec 075): shown against the target's when not 0. */
  attackSize?: number;
}> = ({ attack, target, attackSize = 0 }) => {
  const { t } = useTranslation();
  if (!attack || !target) return null;

  const getFormattedArmor = (): string => {
    if (!target || !target.defense) return '';
    if (target.defense.at !== undefined && target.defense.at !== null) return String(target.defense.at);
    return `${target.defense.headAt} / ${target.defense.bodyAt} / ${target.defense.armsAt} / ${target.defense.legsAt}`;
  };

  const getAttackDetail = (): string => {
    return `${t('bo')}: ${attack.modifiers.bo}  •  ${t('bd')}: ${target.defense.bd}  •  ${t('armor')}: ${getFormattedArmor()}`;
  };

  return (
    <>
      <CategorySeparator text={`${attackLabel(attack.attackName, t)} → ${target?.actorName}`} />
      <Typography variant="body2" color="primary">
        {getAttackDetail()}
      </Typography>
      <AttackSizeVsTarget attackSize={attackSize} target={target} />
    </>
  );
};

export default AttackTitle;
