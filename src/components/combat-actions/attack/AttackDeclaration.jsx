import React, { useEffect, useState } from 'react';
import { useLocation, useSearchParams } from "react-router-dom";

import Grid from '@mui/material/Grid2';

import TacticalActionCreationActions from '../ActionCreationActions';
import AttackDeclarationAttributes from './AttackDeclarationAttributes';

const AttackDeclaration = () => {
    const debugMode = true;
    const location = useLocation();
    const [searchParams] = useSearchParams();
    const [isValid, setIsValid] = useState(false);
    const phaseStart = searchParams.get('phaseStart');
    const game = location.state?.game;
    const character = location.state?.character;
    const characters = location.state?.characters;

    const [formData, setFormData] = useState({
        tacticalGameId: game.id,
        round: game.round,
        tacticalCharacterId: character.id,
        type: 'attack',
        phaseStart: phaseStart,
        actionPoints: 4,
        attackInfo: {
            attacks: {
                mainHand: {
                    targetId: ''
                }
            },
            parry: 0,
            restrictedQuarters: 'none',
            chargeSpeed: 'none'
        }
    });

    useEffect(() => {
        var isValidForm = false;
        if (formData.attackInfo.attacks.mainHand && formData.attackInfo.attacks.mainHand.targetId) {
            isValidForm = true;
        }
        if (formData.attackInfo.attacks.offHand && formData.attackInfo.attacks.offHand.targetId) {
            isValidForm = true;
        }
        setIsValid(isValidForm);
    }, [formData]);

    if (!game || !character || !characters) {
        return <p>Loading...</p>
    }

    return (
        <>
            <TacticalActionCreationActions game={game} character={character} formData={formData} isValid={isValid} />
            <div className="generic-main-content">
                <Grid container spacing={2}>
                    <Grid size={6}>
                        <AttackDeclarationAttributes formData={formData} setFormData={setFormData} character={character} characters={characters} />
                    </Grid>
                </Grid>
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
            </div>
        </>
    );
}

export default AttackDeclaration;