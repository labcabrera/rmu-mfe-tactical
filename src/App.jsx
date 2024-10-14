import React from 'react';
import { Route, Routes } from 'react-router-dom';

import AttackDeclaration from './components/combat-actions/attack/AttackDeclaration';
import TacticalMovementCreation from './components/combat-actions/movement/TacticalMovementCreation';
import CombatDashboardParent from './components/combat/CombatDashboardParent';
import ForgeItem from './components/items/ForgeItem';
import CharacterCreation from './components/tactical-character/creation/CharacterCreation';
import CharacterModification from './components/tactical-character/edit/CharacterModification';
import GameCreation from './components/tactical-game/create/GameCreation';
import TacticalGameEdit from './components/tactical-game/edit/TacticalGameEdit';
import TacticalGameList from './components/tactical-game/list/TacticalGameList';
import TacticalGameView from './components/tactical-game/view/TacticalGameView';
import AttackResolution from './components/combat-actions/attack/AttackResolution';

import './i18n';
import './index.css';

const App = () => {

  return (
    <Routes>
      <Route path='/' element={<TacticalGameList />} />
      <Route path='/view/:gameId' element={<TacticalGameView />} />
      <Route path='/edit/:gameId' element={<TacticalGameEdit />} />
      <Route path='/combat/:gameId' element={<CombatDashboardParent />} />
      <Route path='/combat/:gameId/declare-attack' element={<AttackDeclaration />} />
      <Route path='/combat/:gameId/resolve-attack/:actionId' element={<AttackResolution />} />
      <Route path='/combat/:gameId/declare-movement' element={<TacticalMovementCreation />} />
      <Route path='/creation' element={<GameCreation />} />
      <Route path='/characters/creation' element={<CharacterCreation />} />
      <Route path='/characters/edit/:characterId' element={<CharacterModification />} />
      <Route path='/forge/:gameId' element={<ForgeItem />} />
    </Routes>
  );
};

export default App;
