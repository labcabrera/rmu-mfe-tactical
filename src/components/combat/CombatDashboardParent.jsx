
import React from "react";
import CombatDashboard from './CombatDashboard';
import { CombatProvider } from "./CombatProvider";

function CombatDashboardParent() {

    return (
        <CombatProvider>
            <CombatDashboard />
        </CombatProvider>
    );
}

export default CombatDashboardParent;
