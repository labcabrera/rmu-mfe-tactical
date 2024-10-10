import React from 'react';
import { useNavigate } from "react-router-dom";

import ForgeButton from '../../button/ForgeButton';

import { DETAIL_BUTTON_SIZE } from '../../../constants/ui';

const TacticalCharacterAddItem = ({ game, character }) => {

    const navigate = useNavigate();

    const handleForgeButtonClick = (e) => {
        navigate(`/tactical/forge/${game.id}`, {
            state: { game: game, character: character }
        });
        return;
    };

    if (!character) {
        return <p>Loading...</p>
    }

    return (
        <div className="tactical-character-add-item">
            <ForgeButton onClick={handleForgeButtonClick} size={DETAIL_BUTTON_SIZE} />
        </div>
    );
}

export default TacticalCharacterAddItem;