import React from "react";
import { Routes, Route } from "react-router-dom";
import "./index.css";
import TacticalGameList from "./components/TacticalGameList";

const App = () => {
  return (
    <div className="tactical-games">
      <Routes>
        <Route path="/" element={<TacticalGameList />} />
      </Routes>
    </div>
  );
};

export default App;
