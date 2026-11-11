import { FC, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
import { Chip, Stack, Tooltip, Typography } from '@mui/material';
import {
  DataTable,
  DataTableColumn,
  EmptyState,
  LoadingState,
  Panel,
  useApiNotify,
  useTableText,
} from '@labcabrera-rmu/rmu-react-shared-lib';
import { fetchActionsByGame } from '../../api/action';
import { Action, Critical } from '../../api/action.dto';
import { useCombatGame, useCombatRound } from '../../combat/combat-context';
import { attackLabel } from '../../services/attack-label';
import DamageBar from './DamageBar';
import { ActorDamage, attackRows, AttackRow, damageByActor } from './combat-damage';

const NUMERIC_SX = { fontVariantNumeric: 'tabular-nums' };

/** The criticals rolled, with their text in a tooltip. */
const CriticalChips: FC<{ criticals: Critical[] }> = ({ criticals }) => {
  const { t } = useTranslation();
  const tableText = useTableText();
  if (criticals.length === 0) return null;
  return (
    <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 0.5 }}>
      {criticals.map((critical, index) => (
        <Tooltip key={`${critical.key}-${index}`} title={tableText(critical.result?.text)}>
          <Chip
            size="small"
            variant="outlined"
            label={`${t(`critical-type-${critical.criticalType}`, { defaultValue: critical.criticalType })} ${critical.criticalSeverity}${critical.result?.damage ? ` (+${critical.result.damage})` : ''}`}
          />
        </Tooltip>
      ))}
    </Stack>
  );
};

/**
 * The damage of the whole combat, whatever round is shown: what each actor caused, with its criticals, and every
 * attack of every round. Built from the completed actions of the game.
 */
const CombatDamageView: FC = () => {
  const { t } = useTranslation();
  const auth = useAuth();
  const notify = useApiNotify();
  const { game } = useCombatGame();
  const { actorRounds, roundActions } = useCombatRound();
  const [actions, setActions] = useState<Action[]>();
  const gameId = game?.id;

  // Reloaded whenever the actions of the board change, so a new result shows up here
  useEffect(() => {
    if (!gameId) return undefined;
    let cancelled = false;
    fetchActionsByGame(gameId, auth)
      .then((all) => {
        if (!cancelled) setActions(all);
      })
      .catch((err) => {
        if (cancelled) return;
        setActions([]);
        notify.error(err);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameId, roundActions]);

  const rows = useMemo(() => attackRows(actions ?? []), [actions]);
  const totals = useMemo(() => damageByActor(rows), [rows]);

  if (!actions) return <LoadingState />;
  if (rows.length === 0) return <EmptyState dense title={t('damage-tab-empty')} />;

  const actorName = (actorId: string) => actorRounds?.find((ar) => ar.actorId === actorId)?.actorName ?? actorId;
  // The bars: an actor's damage against the most any actor caused, an attack's against the hits of its target (or the
  // biggest attack, when the target is not in the round shown).
  const mostByActor = Math.max(0, ...totals.map((row) => row.damage));
  const biggestAttack = Math.max(0, ...rows.map((row) => row.damage));
  const targetHits = (targetId: string) => actorRounds?.find((ar) => ar.actorId === targetId)?.hp?.max;
  const breakdown = (row: { tableDamage: number; criticalDamage: number }) =>
    `${t('damage-tab-table')}: ${row.tableDamage} · ${t('damage-tab-critical')}: ${row.criticalDamage}`;
  const number = (key: string, header: string, value: (row: ActorDamage) => number): DataTableColumn<ActorDamage> => ({
    key,
    header,
    align: 'right',
    cellSx: NUMERIC_SX,
    render: value,
  });
  const totalColumns: DataTableColumn<ActorDamage>[] = [
    { key: 'actor', header: t('actor'), render: (row) => actorName(row.actorId) },
    number('attacks', t('attacks'), (row) => row.attacks),
    number('hits', t('damage-tab-hits'), (row) => row.hits),
    number('fumbles', t('fumbles'), (row) => row.fumbles),
    number('table', t('damage-tab-table'), (row) => row.tableDamage),
    number('critical', t('damage-tab-critical'), (row) => row.criticalDamage),
    {
      key: 'total',
      header: t('total'),
      align: 'right',
      render: (row) => (
        <DamageBar
          tableDamage={row.tableDamage}
          criticalDamage={row.criticalDamage}
          max={mostByActor}
          detail={breakdown(row)}
        />
      ),
    },
    { key: 'criticals', header: t('criticals'), render: (row) => <CriticalChips criticals={row.criticals} /> },
  ];
  const attackColumns: DataTableColumn<AttackRow>[] = [
    { key: 'round', header: t('round'), align: 'right', cellSx: NUMERIC_SX, render: (row) => row.round },
    { key: 'phase', header: t('phase'), align: 'right', cellSx: NUMERIC_SX, render: (row) => row.phase },
    { key: 'attacker', header: t('attacker'), render: (row) => actorName(row.attackerId) },
    { key: 'target', header: t('target'), render: (row) => actorName(row.targetId) },
    { key: 'attack', header: t('attack'), render: (row) => attackLabel(row.attackName, t) },
    { key: 'roll', header: t('total'), align: 'right', cellSx: NUMERIC_SX, render: (row) => row.rollTotal ?? '' },
    {
      key: 'damage',
      header: t('damage'),
      align: 'right',
      cellSx: NUMERIC_SX,
      render: (row) =>
        row.fumble ? (
          <Typography variant="body2" color="error.main">
            {t('fumble')}
          </Typography>
        ) : row.damage > 0 ? (
          <DamageBar
            tableDamage={row.tableDamage}
            criticalDamage={row.criticalDamage}
            max={targetHits(row.targetId) ?? biggestAttack}
            detail={
              targetHits(row.targetId)
                ? `${breakdown(row)} · ${t('damage-tab-target-hits', {
                    percent: Math.round((row.damage / targetHits(row.targetId)!) * 100),
                    max: targetHits(row.targetId),
                  })}`
                : breakdown(row)
            }
          />
        ) : (
          t('miss')
        ),
    },
    { key: 'criticals', header: t('criticals'), render: (row) => <CriticalChips criticals={row.criticals} /> },
  ];

  return (
    <Stack spacing={1.5}>
      <Panel title={t('damage-tab-by-actor')}>
        <DataTable columns={totalColumns} rows={totals} getKey={(row) => row.actorId} />
      </Panel>
      <Panel title={t('damage-tab-attacks')}>
        <DataTable columns={attackColumns} rows={rows} getKey={(row) => row.key} />
      </Panel>
    </Stack>
  );
};

export default CombatDamageView;
