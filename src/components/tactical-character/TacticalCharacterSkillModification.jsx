import React from "react";

import SkillSelect from "../shared/SkillSelect";

const TacticalCharacterSkillModification = ({ formData }) => {

    if (!formData) {
        return <p>Loading skill modification...</p>
    }

    return (
        <div>
            <p>WIP skill modification</p>
            <SkillSelect />
        </div>
    );
}

export default TacticalCharacterSkillModification;