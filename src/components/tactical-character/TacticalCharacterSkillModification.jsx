import React from "react";

import SkillSelect from "../shared/SkillSelect";
import CharacterSkillList from "../shared/CharacterSkillList";

import { API_TACTICAL_URL } from "../../constants/environment";

const TacticalCharacterSkillModification = ({ tacticalCharacter, setTacticalCharacter }) => {

    if (!tacticalCharacter || !tacticalCharacter.skills) {
        return <p>Loading skill modification...</p>
    }

    const addSkill = async (skillId) => {
        const request = {
            skillId: skillId,
            bonus: 0
        }
        console.log(`TacticalCharacterSkillModification.addSkill ${skillId}`);
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(request)
        };
        const response = await fetch(`${API_TACTICAL_URL}/characters/${tacticalCharacter.id}/skills`, requestOptions);
        if(response.status == 200) {
            const responseBody = await response.json();
            setTacticalCharacter(responseBody);
        }
    }

    return (
        <div>
            <SkillSelect onAddSkill={addSkill} />
            <CharacterSkillList characterSkills={tacticalCharacter.skills} />
        </div>
    );
}

export default TacticalCharacterSkillModification;