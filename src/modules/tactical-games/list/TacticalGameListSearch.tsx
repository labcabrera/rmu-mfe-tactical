import React, { Dispatch, SetStateAction, useEffect } from 'react';
import { Grid } from '@mui/material';
import { ClearableTextField } from '@labcabrera-rmu/rmu-react-shared-lib';

export default function TacticalGameListSearch({
  setQueryString,
}: {
  setQueryString: Dispatch<SetStateAction<string>>;
}) {
  const [searchName, setSearchName] = React.useState('');

  useEffect(() => {
    let queryString = ``;
    if (searchName) {
      queryString += `name=re=${searchName}`;
    }
    setQueryString(queryString);
  }, [searchName]);

  return (
    <Grid container spacing={1}>
      <Grid size={{ xs: 12, md: 3 }}>
        <ClearableTextField
          label="Name"
          name="name"
          value={searchName}
          onChange={(e) => setSearchName(e.target.value)}
        />
      </Grid>
    </Grid>
  );
}
