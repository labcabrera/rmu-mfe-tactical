import * as React from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';

const TacticalGameViewInfo = ({ tacticalGame }) => {
  return (
    <>
      <Box component="form" sx={{ '& > :not(style)': { m: 1, width: '100%' } }}>
        <TextField label="Name" name="name" value={tacticalGame.name} readonly />
        <TextField label="Status" name="status" value={tacticalGame.status} readonly />
        <TextField label="Phase" name="phase" value={tacticalGame.phase} readonly />
        <TextField label="Round" value={tacticalGame.round} readonly />
        <TextField label="Owner" value={tacticalGame.owner} readonly />
        <TextField label="Description" name="description" value={tacticalGame.description} multiline maxRows={4} readonly />
      </Box>
      <pre>{JSON.stringify(tacticalGame, null, 2)}</pre>
      <pre>{JSON.stringify(location.state, null, 2)}</pre>
    </>
  );
};

export default TacticalGameViewInfo;
