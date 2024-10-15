import React, { useEffect, useState } from 'react';
import { useLocation, useParams, useSearchParams } from "react-router-dom";

import ActionResolutionActions from '../ActionResolutionActions';
import AttackResolutionAttributes from './AttackResolutionAttributes';

const AttackResolution = () => {
    const debugMode = true;
    const location = useLocation();
    const { actionId } = useParams();
    const game = location.state?.game;
    const character = location.state?.character;
    const characters = location.state?.characters;
    const [formData, setFormData] = useState({});
    const [isValid, setIsValid] = useState(false);

    useEffect(() => {
        var isValidForm = true;
        if (!formData.tacticalCharacterTargetId) {
            isValidForm = false;
        }
        setIsValid(isValidForm);
    }, [formData]);

    useEffect(() => {
        const fetchPrepareAction = async (actionId) => {
            const response = await fetch(`${API_TACTICAL_URL}/actions/${actionId}/prepare`, { method: 'POST' });
            const responseBody = await response.json();
            setFormData(responseBody);
        };
        console.log(`AttackResolution.useEffect[actionId]`);
        fetchPrepareAction(actionId);
    }, [actionId]);

    if (!game || !character || !characters) {
        return <p>Loading...</p>
    }

    return (
        <>
            <ActionResolutionActions game={game} character={character} formData={formData} isValid={isValid} />
            <div className="generic-main-content">
                <AttackResolutionAttributes formData={formData} character={character} />

                {debugMode ? (
                    <div>
                        <h2>formData</h2>
                        <pre>
                            {JSON.stringify(formData, null, 2)}
                        </pre>
                        <h2>character</h2>
                        <pre>
                            {JSON.stringify(character, null, 2)}
                        </pre>
                        <h2>characters</h2>
                        <pre>
                            {JSON.stringify(characters, null, 2)}
                        </pre>
                    </div>
                ) : null}
            </div >
        </>
    );
}

export default AttackResolution;