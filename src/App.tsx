import React from 'react';
import { Route, Routes } from 'react-router-dom';
import { Box } from '@mui/material';
import { CombatProvider } from './CombatContext';
import { ErrorProvider } from './ErrorContext';
import './i18n';
import ActorRoundView from './modules/actor-round/ActorRoundView';
import CombatDashboard from './modules/combat-dashboard/CombatDashboard';
import TacticalGameCreation from './modules/tactical-games/create/TacticalGameCreation';
import TacticalGameEdit from './modules/tactical-games/edit/TacticalGameEdit';
import TacticalGameList from './modules/tactical-games/list/TacticalGameList';
import TacticalGameView from './modules/tactical-games/view/TacticalGameView';

const App = () => {
  return (
    <ErrorProvider>
      <CombatProvider>
        <Box sx={{ p: 5 }}>
          <Routes>
            <Route path="/" element={<TacticalGameList />} />
            <Route path="/games" element={<TacticalGameList />} />
            <Route path="/games/create" element={<TacticalGameCreation />} />
            <Route path="/games/view/:gameId" element={<TacticalGameView />} />
            <Route path="/games/edit/:gameId" element={<TacticalGameEdit />} />
            <Route path="/combat/:gameId" element={<CombatDashboard />} />
            <Route path="/actor-rounds/view/:actorRoundId" element={<ActorRoundView />} />
          </Routes>
        </Box>
      </CombatProvider>
    </ErrorProvider>
  );
};

export default App;
