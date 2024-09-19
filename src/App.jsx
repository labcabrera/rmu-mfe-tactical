import React from "react";
import { Route, Routes } from "react-router-dom";

import TacticalCharacterCreation from "./components/TacticalCharacterCreation";
import TacticalCharacterEdit from "./components/TacticalCharacterEdit";
import TacticalGameCreation from "./components/TacticalGameCreation";
import TacticalGameList from "./components/tactical-game/TacticalGameList";
import TacticalGameView from "./components/TacticalGameView";

import "./index.css";

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<TacticalGameList />} />
      <Route path="/view/:gameId" element={<TacticalGameView />} />
      <Route path="/creation" element={<TacticalGameCreation />} />
      <Route path="/characters/creation" element={<TacticalCharacterCreation />} />
      <Route path="/characters/edit/:characterId" element={<TacticalCharacterEdit />} />
    </Routes>
  );
};

export default App;
