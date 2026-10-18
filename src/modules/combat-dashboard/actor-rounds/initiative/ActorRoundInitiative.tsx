import React, { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import ElectricBoltIcon from '@mui/icons-material/ElectricBolt';
import { IconButton, Card, CardContent, Stack, Typography } from '@mui/material';
import { imageBaseUrl } from '@labcabrera-rmu/rmu-react-shared-lib';
import { ActorRound } from '../../../api/actor-rounds.dto';
import InitiativeBar from '../../../shared/generic/InitiativeBar';
import DeclareInitiativeDialog from './DeclareInitiativeDialog';

const ActorRoundInitiative: FC<{
  actorRound: ActorRound;
}> = ({ actorRound }) => {
  const { t } = useTranslation();
  const [dialogOpen, setDialogOpen] = useState(false);
  const isDisabled = actorRound.effects.some((e) => e.status === 'dead' || e.status === 'unconcious');

  const bgUrl = `${imageBaseUrl}images/actions/action-initiative-panoramic-02.png`;

  return (
    <Card
      sx={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'stretch',
        backgroundImage: `url(${bgUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        bgcolor: 'transparent',
      }}
      elevation={0}
    >
      {!isDisabled && (
        <CardContent sx={{ width: '100%', minWidth: 0, p: 1.25, '&:last-child': { pb: 1.25 } }}>
          <Stack direction="column" spacing={0.75} sx={{ width: '100%', minWidth: 0 }}>
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              <Typography variant="body1" color="text.primary">
                {actorRound.initiative.total}
              </Typography>
              <IconButton
                onClick={() => setDialogOpen(true)}
                size="small"
                color="primary"
                aria-label={t('declare-initiative')}
                sx={{ p: 0.25 }}
              >
                <ElectricBoltIcon fontSize="small" />
              </IconButton>
            </Stack>
            {!actorRound.initiative.total && <Typography variant="caption">{t('not-declared')}</Typography>}
            <DeclareInitiativeDialog open={dialogOpen} setOpen={setDialogOpen} actorRound={actorRound} />
            {actorRound.initiative?.roll && (
              <InitiativeBar current={actorRound.initiative.total} max={30} width="100%" />
            )}
          </Stack>
        </CardContent>
      )}
    </Card>
  );
};

export default ActorRoundInitiative;
