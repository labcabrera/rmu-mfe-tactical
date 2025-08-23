import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useSearchParams } from 'react-router-dom';
import { TextField } from '@mui/material';
import Grid from '@mui/material/Grid';
import ActionPointSelector from '../../shared/generic/ActionPointSelector';
import MovementTextField from '../../shared/inputs/MovementTextField';
import SelectPace from '../../shared/selects/SelectPace';
import TacticalActionCreationActions from '../ActionCreationActions';

const TacticalMovementCreation = () => {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [isValid, setIsValid] = useState(false);
  const { t, i18n } = useTranslation();
  const phaseStart = parseInt(searchParams.get('phaseStart'));
  const game = location.state?.game;
  const character = location.state?.character;

  const [formData, setFormData] = useState({
    gameId: game.id,
    round: game.round,
    characterId: character.id,
    actionType: 'movement',
    phaseStart: phaseStart,
    actionPoints: 1,
    pace: '',
    paceMultiplier: '',
    speed: '',
    adjustedSpeed: '',
  });

  const updateActionPoints = (actionPoints) => {
    console.log(`TacticalMovementCreation.updateActionPoints ${actionPoints}`);
    if (formData.paceMultiplier != '' && formData.pace != '') {
      const speedCalculations = buildSpeedCalculations(actionPoints, formData.paceMultiplier);
      setFormData({
        ...formData,
        ...speedCalculations,
        actionPoints: actionPoints,
      });
    } else {
      setFormData({ ...formData, actionPoints: actionPoints });
    }
  };

  const updatePace = (pace, paceInfo) => {
    console.log('pace info: ' + JSON.stringify(paceInfo, null, 2));
    const speedCalculations = buildSpeedCalculations(formData.actionPoints, paceInfo.multiplier);
    console.log('' + JSON.stringify(speedCalculations, null, 2));
    setFormData({
      ...formData,
      ...speedCalculations,
      pace: pace,
    });
  };

  const buildSpeedCalculations = (actionPoints, paceMultiplier) => {
    const speed = actionPoints * paceMultiplier * character.movement.baseMovementRate;
    //TODO read from tactical game
    const adjustedSpeed = speed * 0.5;
    return {
      paceMultiplier: paceMultiplier,
      speed: speed,
      adjustedSpeed: adjustedSpeed,
    };
  };

  useEffect(() => {
    console.log('');
    var isValidForm = true;
    if (!formData.pace) {
      isValidForm = false;
    }
    setIsValid(isValidForm);
  }, [formData]);

  if (!game || !character) {
    return <p>Loading...</p>;
  }

  return (
    <>
      <TacticalActionCreationActions game={game} character={character} formData={formData} isValid={isValid} />
      <div className="generic-main-content">
        <Grid container spacing={2}>
          <Grid item xs={4}>
            <TextField value={character.name} readonly />
          </Grid>
          <Grid item xs={4}>
            <SelectPace value={formData.pace} onChange={updatePace} />
          </Grid>
          <Grid item xs={4}>
            <MovementTextField i18nLabel="base-movement-rate" value={character.movement.baseMovementRate} disabled />
          </Grid>
          <Grid item xs={4}></Grid>

          <Grid item xs={4}>
            <ActionPointSelector value={formData.actionPoints} min={1} max={4} defaultValue={1} onChange={updateActionPoints} />
          </Grid>
          <Grid item xs={4}>
            <MovementTextField i18nLabel="pace-multiplier" value={formData.paceMultiplier} disabled />
          </Grid>

          <Grid item xs={4}></Grid>
          <Grid item xs={4}></Grid>
          <Grid item xs={4}>
            <MovementTextField i18nLabel="speed" value={formData.speed} disabled />
          </Grid>

          <Grid item xs={4}></Grid>
          <Grid item xs={4}></Grid>
          <Grid item xs={4}>
            <MovementTextField i18nLabel="adjusted-speed" value={formData.adjustedSpeed} disabled />
          </Grid>
        </Grid>

        <h2>formData</h2>
        <pre>{JSON.stringify(formData, null, 2)}</pre>
      </div>
    </>
  );
};

export default TacticalMovementCreation;
