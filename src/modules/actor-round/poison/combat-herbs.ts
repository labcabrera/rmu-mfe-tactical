import { useEffect, useState } from 'react';
import { useAuth } from 'react-oidc-context';
import { fetchStrategicItems, StrategicItem } from '@labcabrera-rmu/rmu-react-shared-lib';
import { ActorRound } from '../../api/actor-rounds.dto';
import { useTacticalNotify } from '../../services/notify-service';

/** The herbs of a character that work in combat: they heal hits or remove stun (spec 062). */
export const isCombatHerb = (item: StrategicItem): boolean => {
  const effects = item.catalog?.features?.herb?.effects;
  return item.category === 'herb' && !!(effects?.heal || effects?.stunRelief);
};

/** Units of an item the actor already spent in the game (workspace spec 068): strategic spends them at the outcome. */
export const consumedUnits = (actorRound: ActorRound, itemId: string): number =>
  (actorRound.itemsConsumed ?? []).filter((each) => each.itemId === itemId).reduce((sum, each) => sum + each.amount, 0);

/**
 * The herbs the character of the actor carries, with the units left once the ones spent in this game are taken off
 * (`amount`); the ones with none left are out. Loaded while `active`; an NPC carries none.
 */
export const useCharacterHerbs = (actorRound: ActorRound | null | undefined, active: boolean): StrategicItem[] => {
  const auth = useAuth();
  const notify = useTacticalNotify();
  const [herbs, setHerbs] = useState<StrategicItem[]>([]);
  const characterId = actorRound?.characterId;
  const consumedKey = JSON.stringify(actorRound?.itemsConsumed ?? []);

  useEffect(() => {
    if (!active || !characterId || !actorRound) {
      setHerbs([]);
      return;
    }
    let live = true;
    fetchStrategicItems(`characterId==${characterId}`, 0, 1000, auth)
      .then((page) => {
        if (!live) return;
        setHerbs(
          page.content
            .filter((item) => item.category === 'herb')
            .map((item) => ({ ...item, amount: item.amount - consumedUnits(actorRound, item.id) }))
            .filter((item) => item.amount > 0)
        );
      })
      .catch((err) => live && notify.error(err));
    return () => {
      live = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, characterId, consumedKey]);

  return herbs;
};
