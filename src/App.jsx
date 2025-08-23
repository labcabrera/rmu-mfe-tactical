import React from 'react';
import { Route, Routes } from 'react-router-dom';

import AttackDeclaration from './components/combat-actions/attack/AttackDeclaration';
import TacticalMovementCreation from './components/combat-actions/movement/TacticalMovementCreation';
import CombatDashboard from './components/combat/combat-dashboard';
import ForgeItem from './components/items/forge-item';
import CharacterCreation from './components/tactical-character/creation/character-creation';
import CharacterEdit from './components/tactical-character/edit/character-edit';
import GameCreation from './components/tactical-game/create/game-creation';
import TacticalGameEdit from './components/tactical-game/edit/game-edit';
import TacticalGameList from './components/tactical-game/list/TacticalGameList';
import TacticalGameView from './components/tactical-game/view/TacticalGameView';
import AttackResolution from './components/combat-actions/attack/AttackResolution';

import './i18n';
import './index.css';

const App = () => {

  return (
    <Routes>
      <Route path='/' element={<TacticalGameList />} />
      <Route path='/games/view/:gameId' element={<TacticalGameView />} />
      <Route path='/games/edit/:gameId' element={<TacticalGameEdit />} />
      <Route path='/combat/:gameId' element={<CombatDashboard />} />
      <Route path='/combat/:gameId/declare-attack' element={<AttackDeclaration />} />
      <Route path='/combat/:gameId/resolve-attack/:actionId' element={<AttackResolution />} />
      <Route path='/combat/:gameId/declare-movement' element={<TacticalMovementCreation />} />
      <Route path='/creation' element={<GameCreation />} />
      <Route path='/characters/creation' element={<CharacterCreation />} />
      <Route path='/characters/edit/:characterId' element={<CharacterEdit />} />
      <Route path='/forge/:gameId' element={<ForgeItem />} />
    </Routes>
  );
};

export default App;
