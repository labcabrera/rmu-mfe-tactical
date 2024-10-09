import React, { useEffect, useState } from 'react';

import GameCreationActions from './GameCreationActions';
import GameCreationAttributes from './GameCreationAttributes';

const GameCreation = () => {

    const debugMode = true;

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        fatigueMultiplier: 1,
        boardScale: 0.6
    });
    const [isValid, setIsValid] = useState(false);

    const validateForm = () => {
        if (!formData.name) return false;
        return true;
    };

    useEffect(() => {
        setIsValid(validateForm());
    }, [formData]);

    return (
        <>
            <GameCreationActions formData={formData} isValid={isValid} />
            <div className="generic-main-content">
                <GameCreationAttributes formData={formData} setFormData={setFormData} />


                {debugMode ? (
                    <pre>
                        {JSON.stringify(formData, null, 2)}
                    </pre>
                ) : null}
            </div>
        </>
    );
}

export default GameCreation;