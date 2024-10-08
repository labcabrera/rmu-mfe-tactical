import React from 'react';
import { useNavigate } from "react-router-dom";

import ForgeButton from '../button/ForgeButton';

const TacticalCharacterAddItem = ({ tacticalGame, tacticalCharacter }) => {

    const navigate = useNavigate();

    const handleForgeButtonClick = (e) => {
        navigate(`/tactical/forge/${tacticalGame.id}`, {
            state: { tacticalGame: tacticalGame, tacticalCharacter: tacticalCharacter }
        });
        return;
    };

    if (!tacticalCharacter) {
        return <p>Loading...</p>
    }

    return (
        <div className="tactical-character-add-item">
            <ForgeButton onClick={handleForgeButtonClick} size={60} />
        </div>
    );
}

export default TacticalCharacterAddItem;