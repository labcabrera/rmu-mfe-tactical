import React, { FC } from 'react';
import { Grid } from '@mui/material';
import { Action } from '../../../api/action.dto';

const ResolveAttackResults: FC<{
  action: Action;
}> = ({ action }) => {
  if (!action?.movement?.calculated) {
    return <div>Unresolved movement</div>;
  }

  return <Grid container spacing={2}></Grid>;
};

export default ResolveAttackResults;
