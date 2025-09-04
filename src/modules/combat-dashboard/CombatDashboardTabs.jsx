/* eslint-disable react/prop-types */
import * as React from 'react';
import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import CombatDashboardTabActions from './combat-dashboard-tab-action-rounds';

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

function CustomTabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div role="tabpanel" hidden={value !== index} id={`simple-tabpanel-${index}`} aria-labelledby={`simple-tab-${index}`} {...other}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export default function CombatDashboardTabs() {
  const [value, setValue] = React.useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={value} onChange={handleChange} aria-label="combat dashboard tabs">
          <Tab label="Actions" {...a11yProps(0)} />
          <Tab label="Initiative" {...a11yProps(1)} />
          <Tab label="Attacks" {...a11yProps(2)} />
          <Tab label="Debug" {...a11yProps(3)} />
        </Tabs>
      </Box>
      <CustomTabPanel value={value} index={0}>
        <CombatDashboardTabActions />
      </CustomTabPanel>
      <CustomTabPanel value={value} index={1}>
        TODO
      </CustomTabPanel>
      <CustomTabPanel value={value} index={2}>
        TODO
      </CustomTabPanel>
      <CustomTabPanel value={value} index={3}>
        TODO
      </CustomTabPanel>
    </Box>
  );
}
