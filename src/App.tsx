import React from 'react';
import { Route, Routes } from 'react-router-dom';
import { Box, ThemeProvider } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { NotFound } from '@labcabrera-rmu/rmu-react-shared-lib';
import { CombatProvider } from './CombatContext';
import { ErrorProvider } from './ErrorContext';
import CombatDashboard from './modules/combat-dashboard/CombatDashboard';
import TacticalGameCreation from './modules/tactical-games/create/TacticalGameCreation';
import TacticalGameEdit from './modules/tactical-games/edit/TacticalGameEdit';
import TacticalGameList from './modules/tactical-games/list/TacticalGameList';
import TacticalGameView from './modules/tactical-games/view/TacticalGameView';

const App = () => {
  return (
    <ThemeProvider theme={useTheme()}>
      <ErrorProvider>
        <CombatProvider>
          <Box sx={{ p: 2 }}>
            <Routes>
              <Route path="/" element={<TacticalGameList />} />
              <Route path="/games" element={<TacticalGameList />} />
              <Route path="/games/create" element={<TacticalGameCreation />} />
              <Route path="/games/view/:gameId" element={<TacticalGameView />} />
              <Route path="/games/edit/:gameId" element={<TacticalGameEdit />} />
              <Route path="/combat/:gameId" element={<CombatDashboard />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Box>
        </CombatProvider>
      </ErrorProvider>
    </ThemeProvider>
  );
};

export default App;
