import React, { FC, ReactNode, SyntheticEvent, useState } from 'react';
import { Box, Paper, Tab, Tabs } from '@mui/material';
import CombatDashboardActions from './CombatDashboardActions';
import CombatDashboardAttacks from './CombatDashboardAttacks';
import CombatActorRoundList from './actor-rounds/ActorRoundList';

type CustomTabPanelProps = {
  children?: ReactNode;
  value: number;
  index: number;
};

function CustomTabPanel(props: CustomTabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 1.5 }}>{children}</Box>}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

const CombatDashboardTabs: FC = () => {
  const [value, setValue] = useState<number>(0);

  const handleChange = (_event: SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <>
      <CombatDashboardActions />
      <Paper
        elevation={0}
        sx={{
          width: '100%',
          bgcolor: 'background.paper',
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 1,
          overflow: 'hidden',
        }}
      >
        <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 1.5 }}>
          <Tabs value={value} onChange={handleChange} aria-label="combat dashboard tabs">
            <Tab label="Dashboard" {...a11yProps(0)} />
            <Tab label="Actions" {...a11yProps(2)} />
            <Tab label="Attacks" {...a11yProps(3)} />
            <Tab label="Log" {...a11yProps(4)} />
          </Tabs>
        </Box>
        <CustomTabPanel value={value} index={0}>
          <CombatActorRoundList />
        </CustomTabPanel>
        <CustomTabPanel value={value} index={1}>
          TODO: actions
        </CustomTabPanel>
        <CustomTabPanel value={value} index={2}>
          <CombatDashboardAttacks />
        </CustomTabPanel>
        <CustomTabPanel value={value} index={3}>
          TODO: Log
        </CustomTabPanel>
      </Paper>
    </>
  );
};

export default CombatDashboardTabs;
