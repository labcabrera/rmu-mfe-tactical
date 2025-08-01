import React, { useContext } from "react";

import CombatCharacterRound from "./CombatCharacterRound";

import { CombatContext } from './CombatProvider';

const CombatCharacterList = () => {
    const { characterRounds, setCharacterRounds } = useContext(CombatContext);

    if (!characterRounds) {
        return <p>Loading character list...</p>
    }

    return (
        <>
            {characterRounds.map((item, index) => (
                <CombatCharacterRound key={index} characterRound={item} />
            ))}
        </>
    );
}

export default CombatCharacterList;
