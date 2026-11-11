import { lazy } from 'react';
import { Route, Routes } from 'react-router-dom';
import { MfeRoot, NotFound } from '@labcabrera-rmu/rmu-react-shared-lib';
import { CombatProvider } from './modules/combat/CombatProvider';

// Workspace spec 091, E1: every page is its own chunk; the Suspense is in MfeRoot / the shell layout.
const HomePage = lazy(() => import('./HomePage'));
const CombatDashboard = lazy(() => import('./modules/combat-dashboard/CombatDashboard'));
const TacticalGameFormPage = lazy(() => import('./modules/tactical-games/form/TacticalGameFormPage'));
const TacticalGameListPage = lazy(() => import('./modules/tactical-games/list/TacticalGameListPage'));
const TacticalGameViewPage = lazy(() => import('./modules/tactical-games/view/TacticalGameViewPage'));

const App = () => (
  <MfeRoot sx={{ p: 2 }} namespace="tactical">
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
