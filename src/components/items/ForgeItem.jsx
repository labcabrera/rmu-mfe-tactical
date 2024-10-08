import React, { useState } from "react";
import { useLocation } from "react-router-dom";

import ForgeItemAttributes from "./ForgeItemAttributes";

const ForgeItem = () => {

    const debugMode = true;

    const location = useLocation();
    const tacticalGame = location.state?.tacticalGame;
    const tacticalCharacter = location.state?.tacticalCharacter;

    const [formData, setFormData] = useState({
        category: 'weapon',
        weapon: {
            type: 'oneHand',
            attackTable: '',
            skillId: '',
            fumble: ''
        },
        info: {
            cost: {
                value: '',
                type: '',
            },
            lenght: '',
            strength: '',
            weight: '',
            productionTime: ''
        }
    });

    if (!tacticalGame || !tacticalCharacter) {
        return <p>Loading...</p>
    }

    return (
        <div className="generic-main-content">
            <ForgeItemAttributes formData={formData} setFormData={setFormData} />
            {debugMode ? (
                <div>
                    <h3>formData</h3>
                    <pre>
                        {JSON.stringify(formData, null, 2)}
                    </pre>
                </div>
            ) : null}
        </div >
    );
}

export default ForgeItem;
