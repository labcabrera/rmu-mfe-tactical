import React from 'react';
import { Grid } from '@mui/material';
import type { Action } from '../../../api/action';

type ResolveAttackResultsProps = {
  action: Action;
};

const ResolveAttackResults: React.FC<ResolveAttackResultsProps> = ({ action }) => {
  if (!action?.movement?.calculated) {
    return <div>Unresolved movement</div>;
  }

  return <Grid container spacing={2}></Grid>;
};

export default ResolveAttackResults;
