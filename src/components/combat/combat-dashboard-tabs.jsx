import * as React from "react";
import PropTypes from "prop-types";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

import CombatDashboardTabActions from './combat-dashboard-tab-action-rounds';

// Helper function for accessibility props
function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

// Custom Tab Panel component
function CustomTabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

CustomTabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

// Componente placeholder para Iniciativa
const InitiativeComponent = ({ game, characters, actions }) => {
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Combat Initiative
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Aquí se mostraría el componente de iniciativa del combate.
      </Typography>
      {/* TODO: Implementar componente de iniciativa */}
    </Box>
  );
};

// Componente placeholder para Ataques
const AttacksComponent = ({ game, characters, actions }) => {
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Combat Attacks
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Aquí se mostraría el componente de ataques del combate.
      </Typography>
      {/* TODO: Implementar componente de ataques */}
    </Box>
  );
};

// Componente Debug que muestra el JSON
const DebugComponent = ({ game, characters, actions }) => {
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Debug Information
      </Typography>
      <Box sx={{ mt: 2 }}>
        <Typography variant="subtitle1" gutterBottom>
          Game Data:
        </Typography>
        <Box component="pre" sx={{ 
          backgroundColor: '#f5f5f5', 
          p: 2, 
          borderRadius: 1, 
          overflow: 'auto',
          fontSize: '12px',
          mb: 2
        }}>
          {JSON.stringify(game, null, 2)}
        </Box>
      </Box>
      <Box sx={{ mt: 2 }}>
        <Typography variant="subtitle1" gutterBottom>
          Characters Data:
        </Typography>
        <Box component="pre" sx={{ 
          backgroundColor: '#f5f5f5', 
          p: 2, 
          borderRadius: 1, 
          overflow: 'auto',
          fontSize: '12px',
          mb: 2
        }}>
          {JSON.stringify(characters, null, 2)}
        </Box>
      </Box>
      <Box sx={{ mt: 2 }}>
        <Typography variant="subtitle1" gutterBottom>
          Actions Data:
        </Typography>
        <Box component="pre" sx={{ 
          backgroundColor: '#f5f5f5', 
          p: 2, 
          borderRadius: 1, 
          overflow: 'auto',
          fontSize: '12px'
        }}>
          {JSON.stringify(actions, null, 2)}
        </Box>
      </Box>
    </Box>
  );
};

export default function CombatDashboardTabs({ game, characters, actions }) {
    const [value, setValue] = React.useState(0);

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

  return (
    <Box sx={{ width: "100%" }}>
      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs
          value={value}
          onChange={handleChange}
          aria-label="combat dashboard tabs">
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
        <InitiativeComponent 
          game={game} 
          characters={characters} 
          actions={actions} 
        />
      </CustomTabPanel>
      <CustomTabPanel value={value} index={2}>
        <AttacksComponent 
          game={game} 
          characters={characters} 
          actions={actions} 
        />
      </CustomTabPanel>
      <CustomTabPanel value={value} index={3}>
        <DebugComponent 
          game={game} 
          characters={characters} 
          actions={actions} 
        />
      </CustomTabPanel>
    </Box>
  );
}

