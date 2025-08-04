
import React from "react";
import CombatDashboardTabActions from './combat-dashboard-tab-action-rounds';
import { CombatProvider } from "./CombatProvider";

function CombatDashboard() {

    return (
        <CombatProvider>
            <CombatDashboardTabActions />
        </CombatProvider>
    );
}

export default CombatDashboard;
