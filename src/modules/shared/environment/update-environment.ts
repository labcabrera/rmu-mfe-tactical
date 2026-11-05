import { AuthContextProps } from 'react-oidc-context';
import { TacticalGame, TacticalGameEnvironment, updateTacticalGame } from '@labcabrera-rmu/rmu-react-shared-lib';

/**
 * Changes part of the environment of a tactical game. The API replaces the fatigue modifiers (they are sent as they
 * are) and keeps the light, fog and extreme temperature left out (workspace specs 076 and 079).
 */
export const updateGameEnvironment = (
  game: TacticalGame,
  patch: Partial<Omit<TacticalGameEnvironment, 'temperatureFatigueModifier' | 'altitudeFatigueModifier'>>,
  auth: AuthContextProps
): Promise<TacticalGame> =>
  updateTacticalGame(
    game.id,
    {
      environment: {
        temperatureFatigueModifier: game.environment?.temperatureFatigueModifier ?? 0,
        altitudeFatigueModifier: game.environment?.altitudeFatigueModifier ?? 0,
        ...patch,
      },
    },
    auth
  );
