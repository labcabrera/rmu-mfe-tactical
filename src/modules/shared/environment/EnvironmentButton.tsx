import React, { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import CloudIcon from '@mui/icons-material/Cloud';
import { Button, Stack } from '@mui/material';
import { RmuDialog, TacticalGame } from '@labcabrera-rmu/rmu-react-shared-lib';
import AmbientLightSelect from '../selects/AmbientLightSelect';
import FogSelect from '../selects/FogSelect';
import ExtremeTemperatureControl from './ExtremeTemperatureControl';
import LightSourceControl from './LightSourceControl';

/**
 * The environment of the combat in a dialog (workspace specs 076 and 079): the ambient light, the fog, the light
 * source and the extreme temperature, which the game master changes during the game. The selects come first and the
 * conditions with their own dialog (a chip and a button) after them.
 */
const EnvironmentButton: FC<{ game: TacticalGame; onChange: (game: TacticalGame) => void }> = ({ game, onChange }) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const active = !!game.environment?.fog || !!game.environment?.extremeTemperature;
  return (
    <>
      <Button
        variant={active ? 'contained' : 'outlined'}
        color={active ? 'warning' : 'primary'}
        startIcon={<CloudIcon />}
        onClick={() => setOpen(true)}
      >
        {t('environment')}
      </Button>
      <RmuDialog
        open={open}
        onDismiss={() => setOpen(false)}
        maxWidth="sm"
        title={t('environment')}
        buttons={[
          <Button key="close" variant="contained" onClick={() => setOpen(false)}>
            {t('close')}
          </Button>,
        ]}
      >
        <Stack spacing={2}>
          <AmbientLightSelect game={game} onChange={onChange} fullWidth />
          <FogSelect game={game} onChange={onChange} fullWidth />
          <LightSourceControl game={game} onChange={onChange} />
          <ExtremeTemperatureControl game={game} onChange={onChange} />
        </Stack>
      </RmuDialog>
    </>
  );
};

export default EnvironmentButton;
