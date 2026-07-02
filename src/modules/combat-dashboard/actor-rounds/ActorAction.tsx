import React from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Card, CardActionArea, CardContent, Typography } from '@mui/material';
import type { Action } from '../../api/action.dto';
import { imageBaseUrl } from '../../services/config';

export default function ActorAction({
  action,
  completed,
  onClick,
}: {
  action: Action;
  completed: boolean;
  onClick: () => void;
}) {
  const { t } = useTranslation();
  const getActionImage = () => {
    if (action.actionType === 'ranged_attack') {
      return `${imageBaseUrl}images/actions/action-ranged-panoramic-01.png`;
    } else if (action.actionType === 'movement') {
      return `${imageBaseUrl}images/actions/action-movement-panoramic-02.png`;
    }
    return `${imageBaseUrl}images/actions/action-melee-panoramic-01.png`;
  };

  const getActionName = () => {
    let name = '';
    if (action.maneuver) {
      name = t(action.maneuver?.modifiers?.skillId || 'maneuver');
    } else if (action.movement) {
      name = `${t('movement')}${action.movement.calculated?.distanceAdjusted ? `: ${action.movement.calculated.distanceAdjusted}` : ''}`;
    } else {
      name = t(action.actionType);
    }
    return action.freeAction ? `${t('Free ')} ${name}` : name;
  };

  const bg = getActionImage();
  const actionName = getActionName();
  const actionOverlay = completed
    ? 'linear-gradient(90deg, rgba(0,0,0,0.58), rgba(0,0,0,0.16))'
    : 'linear-gradient(90deg, rgba(15,31,24,0.62), rgba(80,142,103,0.12)), linear-gradient(0deg, rgba(87,145,104,0.08), rgba(87,145,104,0.08))';

  return (
    <Card
      sx={{
        width: '100%',
        height: '100%',
        boxShadow: 1,
        borderRadius: 0.5,
        border: 1,
        borderColor: 'black',
        overflow: 'hidden',
        backgroundColor: completed ? 'secondary.main' : 'primary.main',
        backgroundImage: bg ? `${actionOverlay}, url(${bg})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'right center',
        backgroundRepeat: 'no-repeat',
      }}
      onClick={onClick}
    >
      <CardActionArea sx={{ height: '100%' }} onClick={onClick}>
        <CardContent
          sx={{
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            p: 1,
            bgcolor: 'rgba(0,0,0,0)',
            '&:last-child': { pb: 1 },
          }}
        >
          <Box sx={{ width: '100%', minWidth: 0 }}>
            <Typography
              variant="caption"
              noWrap
              sx={{
                color: completed ? 'secondary' : 'primary',
                textTransform: 'none',
                fontWeight: 700,
              }}
            >
              {actionName}
              {completed ? '' : '...'}
            </Typography>
          </Box>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
