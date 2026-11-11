import { FC, useState } from 'react';
import { Drawer, Popover } from '@mui/material';
import { usePhone } from '@labcabrera-rmu/rmu-react-shared-lib';
import { Action } from '../../api/action.dto';
import { ActorRound } from '../../api/actor-rounds.dto';
import { useCombatGame } from '../../combat/combat-context';
import { canManageTactical } from '../../shared/permissions';
import ManeuverDeclareDialog from '../dialogs/ManeuverDeclareDialog';
import MedicalDeclareDialog from '../dialogs/MedicalDeclareDialog';
import OtherActionDeclareDialog from '../dialogs/OtherActionDeclareDialog';
import SpellDeclareDialog from '../dialogs/SpellDeclareDialog';
import UseItemDeclareDialog from '../dialogs/UseItemDeclareDialog';
import WeaponActionDeclareDialog, { WeaponActionDeclaration } from '../dialogs/WeaponActionDeclareDialog';
import PaletteContent from './PaletteContent';
import { ManeuverChoice, PaletteEntry, pastPhases, USE_ITEM } from './palette-rules';
import { useCreateAction } from './useCreateAction';

/**
 * Action palette of an actor: the action types grouped, filterable by typing (Enter picks the first match),
 * with the reason of the ones that cannot be declared now. Choosing one declares the action; maneuvers first
 * ask for their skill and type in a dialog. A popover, or a bottom sheet on phones.
 */
const ActionPalette: FC<{
  actorRound: ActorRound | null;
  phase: number;
  anchorEl: HTMLElement | null;
  onClose: () => void;
  onCreated: (action: Action) => void;
}> = ({ actorRound, phase, anchorEl, onClose, onCreated }) => {
  const isPhone = usePhone();
  const { game } = useCombatGame();
  const [pastPhase, setPastPhase] = useState<number | null>(null);
  // Workspace spec 089: whoever manages the game can go back to a past phase of the round. Forgotten when the phase moves on.
  const selectablePhases = game && canManageTactical(game) ? pastPhases(phase) : [];
  const fromPhase = pastPhase !== null && selectablePhases.includes(pastPhase) ? pastPhase : phase;
  const [maneuver, setManeuver] = useState<ManeuverChoice | null>(null);
  const [spellEntry, setSpellEntry] = useState<PaletteEntry | null>(null);
  const [healEntry, setHealEntry] = useState<PaletteEntry | null>(null);
  const [weaponEntry, setWeaponEntry] = useState<PaletteEntry | null>(null);
  const { create, busy, confirmDialog } = useCreateAction(actorRound, fromPhase, fromPhase < phase, (action) => {
    setPastPhase(null);
    setManeuver(null);
    setSpellEntry(null);
    setHealEntry(null);
    setWeaponEntry(null);
    onCreated(action);
  });
  const close = () => {
    setPastPhase(null);
    setManeuver(null);
    setSpellEntry(null);
    setHealEntry(null);
    setWeaponEntry(null);
    onClose();
  };
  // The palette hides while the maneuver, spell, medical, item or weapon dialog is open.
  const open = Boolean(actorRound) && !maneuver && !spellEntry && !healEntry && !weaponEntry;
  const content = actorRound && (
    <PaletteContent
      actorRound={actorRound}
      phase={fromPhase}
      currentPhase={phase}
      selectablePhases={selectablePhases}
      onPhaseChange={setPastPhase}
      busy={busy}
      onClose={close}
      onCreate={create}
      onManeuver={setManeuver}
      onSpell={setSpellEntry}
      onHeal={setHealEntry}
      onWeapon={setWeaponEntry}
      onClosePalette={close}
    />
  );
  const dialog = (
    <ManeuverDeclareDialog
      open={Boolean(actorRound && maneuver)}
      actorRound={actorRound}
      initialSkillId={maneuver?.skillId}
      busy={busy}
      onClose={close}
      onDeclare={(declared) => maneuver && create(maneuver.entry, { maneuver: declared })}
    />
  );
  const spellDialog = (
    <SpellDeclareDialog
      open={Boolean(actorRound && spellEntry)}
      actorRound={actorRound}
      instant={!!spellEntry?.freeAction}
      busy={busy}
      onClose={close}
      onDeclare={(spell) => spellEntry && create(spellEntry, { actionType: 'cast_spell', spell })}
    />
  );
  const healDialogs = (
    <>
      <MedicalDeclareDialog
        open={Boolean(actorRound && healEntry?.type === 'medical')}
        actorRound={actorRound}
        busy={busy}
        onClose={close}
        onDeclare={(medical) => healEntry && create(healEntry, { medical })}
      />
      <UseItemDeclareDialog
        open={Boolean(actorRound && healEntry?.type === USE_ITEM)}
        actorRound={actorRound}
        busy={busy}
        onClose={close}
        onDeclare={(useItem) => healEntry && create(healEntry, { useItem })}
      />
      <OtherActionDeclareDialog
        open={Boolean(actorRound && weaponEntry?.type === 'other')}
        actorRound={actorRound}
        busy={busy}
        onClose={close}
        onDeclare={(fields) => weaponEntry && create(weaponEntry, { ...fields })}
      />
      <WeaponActionDeclareDialog
        open={Boolean(actorRound && weaponEntry && weaponEntry.type !== 'other')}
        kind={weaponEntry?.type === 'aim' ? 'aim' : 'draw_and_load'}
        actorRound={actorRound}
        busy={busy}
        onClose={close}
        onDeclare={(declaration: WeaponActionDeclaration) => weaponEntry && create(weaponEntry, declaration)}
      />
      {confirmDialog}
    </>
  );
  if (isPhone) {
    return (
      <>
        <Drawer anchor="bottom" open={open} onClose={close} slotProps={{ paper: { sx: { maxHeight: '85dvh' } } }}>
          {content}
        </Drawer>
        {dialog}
        {spellDialog}
        {healDialogs}
      </>
    );
  }
  return (
    <>
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={close}
        // Opened from the keyboard there is no button to anchor to: show it at the top center.
        anchorReference={anchorEl ? 'anchorEl' : 'anchorPosition'}
        anchorPosition={{ top: 120, left: typeof window === 'undefined' ? 0 : window.innerWidth / 2 }}
        transformOrigin={anchorEl ? undefined : { vertical: 'top', horizontal: 'center' }}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        slotProps={{ paper: { sx: { width: 460, maxWidth: 'calc(100vw - 32px)', maxHeight: '70vh' } } }}
      >
        {content}
      </Popover>
      {dialog}
      {spellDialog}
      {healDialogs}
    </>
  );
};

export default ActionPalette;
