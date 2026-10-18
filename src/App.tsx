import React from 'react';
import { Route, Routes } from 'react-router-dom';
import { MfeRoot, NotFound } from '@labcabrera-rmu/rmu-react-shared-lib';
import { CombatProvider } from './CombatContext';
import HomePage from './HomePage';
import CombatDashboard from './modules/combat-dashboard/CombatDashboard';
import TacticalGameFormPage from './modules/tactical-games/form/TacticalGameFormPage';
import TacticalGameListPage from './modules/tactical-games/list/TacticalGameListPage';
import TacticalGameViewPage from './modules/tactical-games/view/TacticalGameViewPage';

const App = () => (
  <MfeRoot sx={{ p: 2 }}>
    <CombatProvider>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/games" element={<TacticalGameListPage />} />
        <Route path="/games/create" element={<TacticalGameFormPage mode="create" />} />
        <Route path="/games/view/:gameId" element={<TacticalGameViewPage />} />
        <Route path="/games/edit/:gameId" element={<TacticalGameFormPage mode="edit" />} />
        <Route path="/combat/:gameId" element={<CombatDashboard />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </CombatProvider>
  </MfeRoot>
);

export default App;
