import React from "react";
import { Route, Routes } from "react-router-dom";

import TacticalCharacterCreation from "./components/tactical-character/TacticalCharacterCreation";
import TacticalCharacterEdit from "./components/tactical-character/TacticalCharacterEdit";
import TacticalGameCreation from "./components/tactical-game/TacticalGameCreation";
import TacticalGameList from "./components/tactical-game/TacticalGameList";
import TacticalGameView from "./components/tactical-game/TacticalGameView";
import CombatDashboard from "./components/combat/CombatDashboard";

import "./index.css";

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<TacticalGameList />} />
      <Route path="/view/:gameId" element={<TacticalGameView />} />
      <Route path="/combat/:gameId" element={<CombatDashboard />} />
      <Route path="/creation" element={<TacticalGameCreation />} />
      <Route path="/characters/creation" element={<TacticalCharacterCreation />} />
      <Route path="/characters/edit/:characterId" element={<TacticalCharacterEdit />} />
    </Routes>
  );
};

export default App;
