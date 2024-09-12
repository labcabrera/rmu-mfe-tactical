import React from "react";
import { Route, Routes } from "react-router-dom";
import TacticalGameList from "./components/TacticalGameList";
import TacticalGameView from "./components/TacticalGameView";
import "./index.css";

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<TacticalGameList />} />
      <Route path="/:gameId" element={<TacticalGameView />} />
    </Routes>
  );
};

export default App;
