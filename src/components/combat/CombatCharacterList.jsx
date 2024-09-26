import React from "react";

const CombatCharacterList = (tacticalGame, characters, characterRounds) => {

    const debugMode = false;

    return (
        <div className="combat-dashboard">
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
