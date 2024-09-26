import React, { useContext } from "react";

import CombatCharacterRound from "./CombatCharacterRound";
import { CombatContext } from './CombatProvider';

const CombatCharacterList = () => {

    const debugMode = false;

    const { characterRounds, setCharacterRounds } = useContext(CombatContext);

    if (!characterRounds) {
        return <p>Loading...</p>
    }

    return (
        <div className="combat-dashboard-list">
            {characterRounds.map((item) => (
                <CombatCharacterRound characterRound={item} />
            ))}
            <div>
                WIP combat character list
            </div>
            {debugMode ? (
                <div>
                    <h3>tacticalGame</h3>
                    <pre>
                        {JSON.stringify(tacticalGame, null, 2)}
                    </pre>
                    <h3>characters</h3>
                    <pre>
                        {JSON.stringify(characters, null, 2)}
                    </pre>
                    <h3>characterRounds</h3>
                    <pre>
                        {JSON.stringify(characterRounds, null, 2)}
                    </pre>
                </div>
            ) : null}
        </div >
    );
}

export default CombatCharacterList;
