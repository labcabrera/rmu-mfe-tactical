import React, { FC, ReactNode, SyntheticEvent, useState } from 'react';
import { Box, Tab, Tabs } from '@mui/material';
import CombatDashboardActions from './CombatDashboardActions';
import CombatActorRoundList from './actor-rounds/CombatActorRoundList';

type CustomTabPanelProps = {
  children?: ReactNode;
  value: number;
  index: number;
};

function CustomTabPanel(props: CustomTabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div role="tabpanel" hidden={value !== index} id={`simple-tabpanel-${index}`} aria-labelledby={`simple-tab-${index}`} {...other}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

const CombatDashboardTabActions: FC = () => {
  const [value, setValue] = useState<number>(0);

  const handleChange = (_event: SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <>
      <CombatDashboardActions />
      <Box sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
            <Tab label="Dashboard" {...a11yProps(0)} />
            <Tab label="Actions" {...a11yProps(1)} />
            <Tab label="Attacks" {...a11yProps(2)} />
            <Tab label="Log" {...a11yProps(3)} />
          </Tabs>
        </Box>
        <CustomTabPanel value={value} index={0}>
          <CombatActorRoundList />
        </CustomTabPanel>
        <CustomTabPanel value={value} index={1}></CustomTabPanel>
        <CustomTabPanel value={value} index={2}></CustomTabPanel>
        <CustomTabPanel value={value} index={3}></CustomTabPanel>
      </Box>
    </>
  );
};

export default CombatDashboardTabActions;
