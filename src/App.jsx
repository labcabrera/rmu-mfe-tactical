import React from 'react';
import { Route, Routes } from 'react-router-dom';

import TacticalAttackDeclaration from './components/combat-actions/attack/TacticalAttackDeclaration';
import TacticalMovementCreation from './components/combat-actions/movement/TacticalMovementCreation';
import CombatDashboardParent from './components/combat/CombatDashboardParent';
import ForgeItem from './components/items/ForgeItem';
import TacticalCharacterCreation from './components/tactical-character/create/TacticalCharacterCreation';
import TacticalCharacterModification from './components/tactical-character/edit/TacticalCharacterModification';
import TacticalGameCreation from './components/tactical-game/create/TacticalGameCreation';
import TacticalGameEdit from './components/tactical-game/edit/TacticalGameEdit';
import TacticalGameList from './components/tactical-game/list/TacticalGameList';
import TacticalGameView from './components/tactical-game/view/TacticalGameView';

import './i18n';
import './index.css';

const App = () => {

  return (
    <Routes>
      <Route path='/' element={<TacticalGameList />} />
      <Route path='/view/:gameId' element={<TacticalGameView />} />
      <Route path='/edit/:gameId' element={<TacticalGameEdit />} />
      <Route path='/combat/:gameId' element={<CombatDashboardParent />} />
      <Route path='/combat/:gameId/declare-attack' element={<TacticalAttackDeclaration />} />
      <Route path='/combat/:gameId/declare-movement' element={<TacticalMovementCreation />} />
      <Route path='/creation' element={<TacticalGameCreation />} />
      <Route path='/characters/creation' element={<TacticalCharacterCreation />} />
      <Route path='/characters/edit/:characterId' element={<TacticalCharacterModification />} />
      <Route path='/forge/:gameId' element={<ForgeItem />} />
    </Routes>
  );
};

export default App;
