import React from "react";
import { Route, Routes } from "react-router-dom";

import TacticalGameCreation from "./components/TacticalGameCreation";
import TacticalGameList from "./components/TacticalGameList";
import TacticalGameView from "./components/TacticalGameView";
import CharacterCreation from "./components/CharacterCreation";

import "./index.css";

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<TacticalGameList />} />
      <Route path="/view/:gameId" element={<TacticalGameView />} />
      <Route path="/creation" element={<TacticalGameCreation />} />
      <Route path="/characters/creation" element={<CharacterCreation />} />
    </Routes>
  );
};

export default App;
