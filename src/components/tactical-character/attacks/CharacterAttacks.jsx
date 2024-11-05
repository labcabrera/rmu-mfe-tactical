import React from 'react';

const CharacterAttacks = ({ character }) => {

    return (
        <div className="todo">
            character attacks
            <pre>
                {JSON.stringify(character.attacks, null, 2)}
            </pre>
        </div>

    );
}

export default CharacterAttacks;