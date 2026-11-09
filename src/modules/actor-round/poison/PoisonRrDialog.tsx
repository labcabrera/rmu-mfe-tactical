/* eslint-disable react-hooks/exhaustive-deps */
import { FC, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
import { Stack, Typography } from '@mui/material';
import {
  formatBonus,
  NumberPadField,
  OPEN_D100,
  PoisonExposure,
  PoisonRrResult,
  RmuDialog,
  RollBreakdown,
  RollField,
  RollResultAlert,
  useApiNotify,
} from '@labcabrera-rmu/rmu-react-shared-lib';
import { resolveActorPoisoning } from '../../api/actor-rounds';
import { ActorRound } from '../../api/actor-rounds.dto';
import { useCombatActions } from '../../combat/combat-context';
import { actorOpenEnded } from '../../services/combat-talents-service';

/**
 * The poison RR of an exposure (spec 042): the roll (empty, the server rolls it), the poison RR of the actor or, for
 * an actor without one, its bonus, and a modifier of the game master. Shows the result before closing.
 */
const PoisonRrDialog: FC<{ actorRound: ActorRound; exposure?: PoisonExposure; onClose: () => void }> = ({
  actorRound,
  exposure,
  onClose,
}) => {
  const { t } = useTranslation();
  const auth = useAuth();
  const notify = useApiNotify();
  const { updateActorRound } = useCombatActions();
  const [roll, setRoll] = useState<number | null>(null);
  const [bonus, setBonus] = useState<number | null>(null);
  const [modifier, setModifier] = useState<number | null>(null);
  const [result, setResult] = useState<PoisonRrResult>();
  const sheetBonus = actorRound.resistances?.find((each) => each.resistance === 'poison')?.totalBonus;

  useEffect(() => {
    if (!exposure) return;
    setRoll(null);
    setBonus(null);
    setModifier(null);
    setResult(undefined);
  }, [exposure?.id]);

  const resolve = () => {
    if (!exposure) return;
    resolveActorPoisoning(
      actorRound.id,
      exposure.id,
      {
        roll: roll ?? undefined,
        bonus: sheetBonus === undefined ? (bonus ?? 0) : undefined,
        modifiers: modifier ? [{ key: 'game-master', value: modifier }] : undefined,
      },
      auth
    )
      .then((response) => {
        updateActorRound(response.actorRound);
        setResult(response.rr);
      })
      .catch(notify.error);
  };

  return (
    <RmuDialog
      open={!!exposure}
      title={t('poison-rr')}
      subtitle={`${actorRound.actorName} · ${exposure ? t(exposure.poison.name, exposure.poison.name) : ''}`}
      maxWidth="sm"
      onCancel={result ? undefined : onClose}
      onResolve={result ? undefined : resolve}
      onClose={result ? onClose : undefined}
    >
      <Stack spacing={2} sx={{ pt: 1 }}>
        {exposure && (
          <Typography variant="body2" color="text.secondary">
            {t('poison-summary-short', {
              category: t(`poison-category-${exposure.poison.category}`),
              level: exposure.poison.level,
            })}
          </Typography>
        )}
        {!result && (
          <>
            <RollField
              spec={OPEN_D100}
              label={t('roll')}
              value={roll}
              onChange={(value) => setRoll(value.total)}
              onClear={() => setRoll(null)}
              openEnded={actorOpenEnded(actorRound)}
            />
            {sheetBonus !== undefined ? (
              <Typography variant="body2">{t('poison-rr-bonus-value', { value: formatBonus(sheetBonus) })}</Typography>
            ) : (
              <NumberPadField
                steps={[-10, -5, 5, 10]}
                label={t('poison-rr-bonus')}
                value={bonus}
                onChange={setBonus}
                integer
              />
            )}
            <NumberPadField
              steps={[-10, -5, 5, 10]}
              label={t('poison-rr-modifier')}
              value={modifier}
              onChange={setModifier}
              integer
            />
          </>
        )}
        {result && (
          <RollResultAlert
            severity={result.resisted ? 'success' : 'warning'}
            headline={
              result.resisted
                ? t('poison-rr-resisted', { total: result.total, required: result.required })
                : t('poison-rr-failed', {
                    total: result.total,
                    required: result.required,
                    severity: t(`poison-severity-${result.severity ?? 'mild'}`),
                  })
            }
            breakdown={<RollBreakdown context="poison-rr" modifiers={result.breakdown} total={result.total} />}
          />
        )}
      </Stack>
    </RmuDialog>
  );
};

export default PoisonRrDialog;
