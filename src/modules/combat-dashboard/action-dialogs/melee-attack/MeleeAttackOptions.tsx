import React, { Dispatch, FC, SetStateAction } from 'react';
import { Badge, FormControl, FormLabel, Stack, ToggleButtonGroup, ToggleButton } from '@mui/material';
import { t } from 'i18next';
import { AttackDeclaration } from '../../../api/action.dto';

const MeleeAttackOptions: FC<{
  index: number;
  formData: AttackDeclaration;
  setFormData: Dispatch<SetStateAction<AttackDeclaration>>;
}> = ({ formData, setFormData, index }) => {
  const labelId = `melee-attack-options-${index}-label`;
  const attack = formData.attacks?.[index];
  const modifiers = attack?.modifiers;
  const higherGround = modifiers?.higherGround || false;
  const stunnedFoe = modifiers?.stunnedFoe || false;
  const surprisedFoe = modifiers?.surprisedFoe || false;
  const proneSource = modifiers?.proneSource || false;
  const proneTarget = modifiers?.proneTarget || false;
  const offHand = modifiers?.offHand || false;
  const ambush = modifiers?.ambush || false;

  const minWidth = 180;

  return (
    <FormControl component="fieldset" variant="standard" sx={{ width: '100%' }}>
      <FormLabel id={labelId} component="legend" sx={{ mb: 1, typography: 'body1' }}>
        {t('attack-options')}
      </FormLabel>
      <Stack direction="row" spacing={3}>
        <ToggleButtonGroup
          value={[
            higherGround ? 'higherGround' : null,
            stunnedFoe ? 'stunnedFoe' : null,
            surprisedFoe ? 'surprisedFoe' : null,
            proneTarget ? 'proneTarget' : null,
            proneSource ? 'proneSource' : null,
            offHand ? 'offHand' : null,
            ambush ? 'ambush' : null,
          ].filter(Boolean)}
          onChange={(_, newValues: string[]) => {
            const enabled = new Set(newValues || []);
            setFormData((prev) => {
              const newAttacks = prev.attacks.map((a, i) =>
                i === index
                  ? {
                      ...a,
                      modifiers: {
                        ...a.modifiers,
                        higherGround: enabled.has('higherGround'),
                        stunnedFoe: enabled.has('stunnedFoe'),
                        surprisedFoe: enabled.has('surprisedFoe'),
                        proneTarget: enabled.has('proneTarget'),
                        proneSource: enabled.has('proneSource'),
                        offHand: enabled.has('offHand'),
                        ambush: enabled.has('ambush'),
                      },
                    }
                  : a
              );
              return { ...prev, attacks: newAttacks } as AttackDeclaration;
            });
          }}
        >
          <Badge badgeContent={'+10'} color="success">
            <ToggleButton value="higherGround" sx={{ minWidth: minWidth }}>
              Higher ground
            </ToggleButton>
          </Badge>
          <Badge badgeContent={'+20'} color="success">
            <ToggleButton value="stunnedFoe" sx={{ minWidth: minWidth }}>
              Stunned foe
            </ToggleButton>
          </Badge>
          <Badge badgeContent={'+25'} color="success">
            <ToggleButton value="surprisedFoe" sx={{ minWidth: minWidth }}>
              Surprised foe
            </ToggleButton>
          </Badge>
          <Badge badgeContent={'+30'} color="success">
            <ToggleButton value="proneTarget" sx={{ minWidth: minWidth }}>
              Prone target
            </ToggleButton>
          </Badge>
          <Badge badgeContent={'-50'} color="error">
            <ToggleButton value="proneSource" sx={{ minWidth: minWidth }}>
              Prone attacker
            </ToggleButton>
          </Badge>
          <Badge badgeContent={'-20'} color="error">
            <ToggleButton value="offHand" sx={{ minWidth: minWidth }}>
              Off-hand
            </ToggleButton>
          </Badge>
          <ToggleButton value="ambush" sx={{ minWidth: minWidth }}>
            Ambush
          </ToggleButton>
        </ToggleButtonGroup>
      </Stack>
    </FormControl>
  );
};

export default MeleeAttackOptions;
