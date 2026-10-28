import React, { FC, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { Box, IconButton, Stack, Tooltip } from '@mui/material';
import {
  enterSx,
  ResourceBar,
  resolveAssetUrl,
  RmuDialog,
  SectionNav,
  StatPill,
} from '@labcabrera-rmu/rmu-react-shared-lib';
import { ActorRound } from '../api/actor-rounds.dto';
import ActorRoundTabContent, { ACTOR_ROUND_TABS, ActorRoundTab } from './tabs/ActorRoundTabs';

/** Where J and K belong to what the user is typing or choosing, not to the actor navigation. */
const TYPING = 'input, textarea, select, [contenteditable="true"], [role="listbox"], [role="menu"]';

/**
 * Full sheet of an actor in the combat (spec 045): a read-only header (hit points, fatigue, initiative, DB, AT and
 * penalty) and the actor's sections in tabs. The side panel keeps what changes every round. Previous and next (and
 * J/K while no child dialog is on top) move to the other actors in board order, staying on the same tab.
 */
const ActorRoundDialog: FC<{
  actorRound: ActorRound | undefined;
  tab: ActorRoundTab;
  onTabChange: (tab: ActorRoundTab) => void;
  onNavigate: (step: number) => void;
  onClose: () => void;
}> = ({ actorRound, tab, onTabChange, onNavigate, onClose }) => {
  const { t } = useTranslation();
  const contentRef = useRef<HTMLDivElement>(null);
  const open = !!actorRound;
  const navigateRef = useRef(onNavigate);
  navigateRef.current = onNavigate;

  // The global shortcuts skip dialogs, so the sheet listens to J/K itself, only while it is the top dialog.
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey || event.altKey || !['j', 'J', 'k', 'K'].includes(event.key)) return;
      if ((event.target as HTMLElement | null)?.closest?.(TYPING)) return;
      const own = contentRef.current?.closest('[role="dialog"]');
      const dialogs = document.querySelectorAll('[role="dialog"]');
      if (!own || dialogs[dialogs.length - 1] !== own) return;
      event.preventDefault();
      navigateRef.current(event.key.toLowerCase() === 'j' ? 1 : -1);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open]);

  const penalty = (actorRound?.penalty?.modifiers ?? []).reduce((sum, modifier) => sum + modifier.value, 0);
  const sections = ACTOR_ROUND_TABS.map((each) => ({ id: each.id, label: t(each.label), icon: each.icon }));
  const current = sections.some((each) => each.id === tab) ? tab : 'summary';

  return (
    <RmuDialog
      title={actorRound?.actorName ?? ''}
      subtitle={t('actor-detail')}
      avatarImg={actorRound?.imageUrl ? resolveAssetUrl(actorRound.imageUrl) : undefined}
      open={open}
      onClose={onClose}
      maxWidth="lg"
      // A fixed height, so changing tabs does not make the dialog jump.
      paperSx={{ height: { sm: 'min(88vh, 900px)' } }}
    >
      {actorRound && (
        <Stack ref={contentRef} spacing={2}>
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            spacing={2}
            sx={{ alignItems: { xs: 'stretch', md: 'center' } }}
          >
            <Stack spacing={1} sx={{ flex: 1, minWidth: 0 }}>
              <ResourceBar
                label={t('hit-points')}
                kind="hp"
                current={actorRound.hp?.current ?? 0}
                max={actorRound.hp?.max ?? 0}
              />
              <ResourceBar
                label={t('fatigue')}
                kind="fatigue"
                current={Math.round(actorRound.fatigue?.accumulator ?? 0)}
                max={100}
              />
            </Stack>
            <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
              <StatPill
                label={t('initiative-short')}
                hint={t('initiative')}
                value={actorRound.initiative?.total ?? 0}
              />
              <StatPill label={t('bd')} hint={t('db')} value={actorRound.defense?.bd ?? 0} signed />
              <StatPill label={t('at-short')} hint={t('at')} value={actorRound.defense?.at ?? '—'} />
              <StatPill label={t('penalty')} hint={t('penalties')} value={penalty} signed />
              <Tooltip title={t('previous-actor')}>
                <IconButton
                  aria-label={t('previous-actor')}
                  onClick={() => onNavigate(-1)}
                  sx={{ width: 44, height: 44 }}
                >
                  <NavigateBeforeIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title={t('next-actor')}>
                <IconButton aria-label={t('next-actor')} onClick={() => onNavigate(1)} sx={{ width: 44, height: 44 }}>
                  <NavigateNextIcon />
                </IconButton>
              </Tooltip>
            </Stack>
          </Stack>
          <SectionNav
            label={t('actor-detail-sections')}
            sections={sections}
            value={current}
            onChange={(id) => onTabChange(id as ActorRoundTab)}
          />
          <Box key={`${actorRound.id}-${current}`} sx={enterSx()}>
            <ActorRoundTabContent actorRound={actorRound} tab={current} />
          </Box>
        </Stack>
      )}
    </RmuDialog>
  );
};

export default ActorRoundDialog;
