/* eslint-disable react/prop-types */
import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import ResolveAttackFormModifiers from './ResolveAttackFormModifiers';

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

export default function ResolveAttackTabDeclaration({ formData, setFormData }) {
  const [tabIndex, setTabIndex] = useState(0);

  const handleChange = (event, newValue) => {
    setTabIndex(newValue);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabIndex} onChange={handleChange} aria-label="combat dashboard tabs">
          {formData.attacks.map((attack, index) => (
            <Tab key={index} label={attack.attackName} {...a11yProps(index)} />
          ))}
        </Tabs>
      </Box>
      {formData.attacks.map((attack, index) => (
        <CustomTabPanel value={tabIndex} index={index} key={index}>
          <ResolveAttackFormModifiers formData={formData} setFormData={setFormData} attack={attack} index={index} />
        </CustomTabPanel>
      ))}
    </Box>
  );
}
