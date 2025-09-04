/* eslint-disable react/prop-types */
import React from 'react';

const CharacterSkillList = ({ characterSkills }) => {
  if (!characterSkills) {
    return <p>Loading skill list...</p>;
  }

  return (
    <div>
      <p>WIP Skill list</p>
      {characterSkills.map((e, index) => (
        <div key={index}>
          {e.skillId} {e.bonus}
        </div>
      ))}
    </div>
  );
};

export default CharacterSkillList;
