import React, { FC, useState } from 'react';
import { Box, Tab, Tabs } from '@mui/material';
import ResolveAttackFormRoll from './ResolveAttackFormRoll';

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

type CustomTabPanelProps = {
  children?: React.ReactNode;
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

const ResolveAttackTabRoll: FC<{
  formData: ActionAttack;
  setFormData: (data: ActionAttack) => void;
  action: Action;
}> = ({ formData, setFormData, action }) => {
  const [tabIndex, setTabIndex] = useState(0);

  const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabIndex(newValue);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabIndex} onChange={handleChange} aria-label="combat dashboard tabs">
          {formData.attacks.map((attack, index) => (
            <Tab key={index} label={attack.modifiers?.attackName} {...a11yProps(index)} />
          ))}
        </Tabs>
      </Box>
      {formData.attacks.map((attack, index) => (
        <CustomTabPanel value={tabIndex} index={index} key={index}>
          <ResolveAttackFormRoll formData={formData} setFormData={setFormData} action={action} index={index} />
        </CustomTabPanel>
      ))}
    </Box>
  );
};

export default ResolveAttackTabRoll;
