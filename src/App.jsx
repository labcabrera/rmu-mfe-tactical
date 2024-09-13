import React from "react";
import { Route, Routes } from "react-router-dom";
import TacticalGameList from "./components/TacticalGameList";
import TacticalGameView from "./components/TacticalGameView";
import TacticalGameCreation from "./components/TacticalGameCreation";
import "./index.css";

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<TacticalGameList />} />
      <Route path="/view/:gameId" element={<TacticalGameView />} />
      <Route path="/creation" element={<TacticalGameCreation />} />
    </Routes>
  );
};

export default App;
