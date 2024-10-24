import React, { useEffect, useState } from 'react';
import { useLocation, useParams } from "react-router-dom";

import { API_TACTICAL_URL } from '../../../constants/environment';

import ActionResolutionActions from '../ActionResolutionActions';
import AttackResolutionDetail from './AttackResolutionDetail';
import AttackResolutionInfo from './AttackResolutionInfo';

const AttackResolution = () => {
    const debugMode = true;
    const location = useLocation();
    const { actionId } = useParams();
    const game = location.state?.game;
    const character = location.state?.character;
    const characters = location.state?.characters;
    const [formData, setFormData] = useState();
    const [isValid, setIsValid] = useState(true);

    useEffect(() => {
        console.log(`AttackResolution.useEffect[actionId]`);
        const fetchPrepareAction = async (actionId) => {
            const response = await fetch(`${API_TACTICAL_URL}/actions/${actionId}/prepare`, { method: 'POST' });
            const responseBody = await response.json();
            setFormData(responseBody);
        };
        fetchPrepareAction(actionId);
    }, [actionId]);

    if (!game || !character || !characters || !formData) {
        return <p>Loading...</p>
    }

    return (
        <>
            <ActionResolutionActions game={game} character={character} formData={formData} isValid={isValid} />
            <div className="generic-main-content">
                <AttackResolutionInfo formData={formData} character={character} />
                {formData.attacks.mainHand ? (
                    <AttackResolutionDetail attackKey='mainHand' formData={formData} setFormData={setFormData} character={character} />
                ) : null}
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