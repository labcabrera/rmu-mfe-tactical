import React from 'react';
import { Route, Routes } from 'react-router-dom';
import './i18n';
import './index.css';
import AttackDeclaration from './modules/combat-actions/attack/AttackDeclaration';
import AttackResolution from './modules/combat-actions/attack/AttackResolution';
import TacticalMovementCreation from './modules/combat-actions/movement/TacticalMovementCreation';
import CombatDashboard from './modules/combat-dashboard/CombatDashboard';
import ForgeItem from './modules/items/ForgeItem';
import TacticalGameCreation from './modules/tactical-games/create/TacticalGameCreation';
import TacticalGameEdit from './modules/tactical-games/edit/TacticalGameEdit';
import TacticalGameList from './modules/tactical-games/list/TacticalGameList';
import TacticalGameView from './modules/tactical-games/view/TacticalGameView';

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<TacticalGameList />} />
      <Route path="/games" element={<TacticalGameList />} />
      <Route path="/games/create" element={<TacticalGameCreation />} />
      <Route path="/games/view/:gameId" element={<TacticalGameView />} />
      <Route path="/games/edit/:gameId" element={<TacticalGameEdit />} />
      <Route path="/combat/:gameId" element={<CombatDashboard />} />
      <Route path="/combat/:gameId/declare-attack" element={<AttackDeclaration />} />
      <Route path="/combat/:gameId/resolve-attack/:actionId" element={<AttackResolution />} />
      <Route path="/combat/:gameId/declare-movement" element={<TacticalMovementCreation />} />
      <Route path="/forge/:gameId" element={<ForgeItem />} />
    </Routes>
  );
};

export default App;
