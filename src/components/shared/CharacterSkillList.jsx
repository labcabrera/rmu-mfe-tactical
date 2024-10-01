import React from "react";

const CharacterSkillList = ({ characterSkills }) => {

    if (!characterSkills) {
        return <p>Loading skill list...</p>
    }

    return (
        <div>
            <p>WIP Skill list</p>
            {characterSkills.map((e, index) => (
                <div>{e.skillId} {e.bonus}</div>
            ))}
        </div>
    );
}

export default CharacterSkillList;