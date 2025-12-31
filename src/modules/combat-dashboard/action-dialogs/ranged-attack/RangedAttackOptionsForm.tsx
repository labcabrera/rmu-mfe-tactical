import React, { Dispatch, FC, SetStateAction } from 'react';
import { Badge, FormControl, FormLabel, ToggleButtonGroup, ToggleButton } from '@mui/material';
import { t } from 'i18next';
import { AttackDeclaration } from '../../../api/action.dto';

const RangedAttackOptionsForm: FC<{
  formData: AttackDeclaration;
  setFormData: Dispatch<SetStateAction<AttackDeclaration>>;
  index: number;
}> = ({ formData, setFormData, index }) => {
  const labelAttackOptionsId = 'ranged-attack-attack-options-selector-label';

  const attack = formData.attacks?.[index];
  const modifiers = attack?.modifiers;
  const higherGround = modifiers?.higherGround || false;
  const stunnedFoe = modifiers?.stunnedFoe || false;
  const surprisedFoe = modifiers?.surprisedFoe || false;
  const proneSource = modifiers?.proneSource || false;
  const proneTarget = modifiers?.proneTarget || false;
  const attackerInMelee = modifiers?.attackerInMelee || false;
  const ambush = modifiers?.ambush || false;

  const minWidth = 180;

  return (
    <FormControl component="fieldset" variant="standard" sx={{ width: '100%' }}>
      <FormLabel id={labelAttackOptionsId} component="legend" sx={{ mb: 1, typography: 'body1' }}>
        {t('Attack options')}
      </FormLabel>
      <ToggleButtonGroup
        value={[
          higherGround ? 'higherGround' : null,
          stunnedFoe ? 'stunnedFoe' : null,
          surprisedFoe ? 'surprisedFoe' : null,
          proneTarget ? 'proneTarget' : null,
          proneSource ? 'proneSource' : null,
          attackerInMelee ? 'attackerInMelee' : null,
          ambush ? 'ambush' : null,
        ].filter(Boolean)}
        onChange={(_e, newValues: string[]) => {
          const newAttacks = formData.attacks.map((a, i) =>
            i === index
              ? {
                  ...a,
                  modifiers: {
                    ...a.modifiers,
                    higherGround: newValues.includes('higherGround'),
                    stunnedFoe: newValues.includes('stunnedFoe'),
                    surprisedFoe: newValues.includes('surprisedFoe'),
                    proneTarget: newValues.includes('proneTarget'),
                    proneSource: newValues.includes('proneSource'),
                    attackerInMelee: newValues.includes('attackerInMelee'),
                    ambush: newValues.includes('ambush'),
                  },
                }
              : a
          );
          setFormData({ ...formData, attacks: newAttacks });
        }}
        aria-label="attack-options"
      >
        <Badge badgeContent={'+10'} color={'success'}>
          <ToggleButton value="higherGround" sx={{ minWidth }}>
            {t('Higher ground')}
          </ToggleButton>
        </Badge>
        <Badge badgeContent={'+20'} color={'success'}>
          <ToggleButton value="stunnedFoe" sx={{ minWidth }}>
            {t('Stunned foe')}
          </ToggleButton>
        </Badge>
        <Badge badgeContent={'+25'} color={'success'}>
          <ToggleButton value="surprisedFoe" sx={{ minWidth }}>
            {t('Surprised foe')}
          </ToggleButton>
        </Badge>
        <Badge badgeContent={'-30'} color={'error'}>
          <ToggleButton value="proneTarget" sx={{ minWidth }}>
            {t('Prone target')}
          </ToggleButton>
        </Badge>
        <Badge badgeContent={'-50'} color={'error'}>
          <ToggleButton value="proneSource" sx={{ minWidth }}>
            {t('Prone attacker')}
          </ToggleButton>
        </Badge>
        <Badge badgeContent={'-20'} color={'error'}>
          <ToggleButton value="attackerInMelee" sx={{ minWidth }}>
            {t('Attacker in melee')}
          </ToggleButton>
        </Badge>
        <ToggleButton value="ambush" sx={{ minWidth }}>
          {t('Ambush')}
        </ToggleButton>
      </ToggleButtonGroup>
    </FormControl>
  );
};

export default RangedAttackOptionsForm;
