import React, { FC } from 'react';
import { Box, Typography, useTheme } from '@mui/material';
import { KeyValue } from '@labcabrera-rmu/rmu-react-shared-lib';
import { t } from 'i18next';

type Modifiers = KeyValue[];

interface Props {
  modifiers: Modifiers;
  /** si es true, la columna izquierda muestra los positivos (success) y la derecha los negativos (error). */
  leftIsPositive?: boolean;
  /** ancho fijo del área central (nombre + barra) */
  centerWidth?: number | string;
}

const rowHeight = 36;

const ModifierDualList: FC<Props> = ({ modifiers, leftIsPositive = false, centerWidth = 300 }) => {
  const theme = useTheme();
  const list = modifiers;
  const sum = modifiers.map((e) => e.value).reduce((acc, val) => acc + val, 0);
  const positives = list.filter((x) => x.value >= 0).sort((a, b) => b.value - a.value);
  const negatives = list.filter((x) => x.value < 0).sort((a, b) => Math.abs(b.value) - Math.abs(a.value));
  const maxAbs = Math.max(1, ...list.map((x) => Math.abs(x.value)));

  // emparejamos por índice: la fila i contiene positives[i] a la izquierda y negatives[i] a la derecha
  const rows = Math.max(positives.length, negatives.length);

  const leftColor = leftIsPositive ? theme.palette.success.main : theme.palette.error.main;
  const rightColor = leftIsPositive ? theme.palette.error.main : theme.palette.success.main;

  return (
    <Box display="flex" flexDirection="column">
      <Box display="flex" justifyContent="center" alignItems="center" mb={1}>
        <Typography variant="h6" color={sum < 0 ? 'error' : 'primary'}>
          {t('Total roll')}: {sum}
        </Typography>
      </Box>
      {Array.from({ length: rows }).map((_, i) => {
        const left = negatives[i];
        const right = positives[i];

        // mostraremos en el centro los nombres de los modificadores izquierdo/derecho

        return (
          <Box key={i} display="flex" alignItems="center" sx={{ height: rowHeight, gap: 2 }}>
            {/* izquierda */}
            <Box flex={1} display="flex" justifyContent="flex-end" pr={1}>
              {left ? (
                <Box display="flex" alignItems="center" width="100%" justifyContent="flex-end">
                  <Box
                    sx={{
                      height: 10,
                      width: `${(Math.abs(left.value) / maxAbs) * 100}%`,
                      bgcolor: leftColor,
                      borderRadius: 1,
                    }}
                  />
                  <Typography variant="body2" ml={1} color="error" sx={{ minWidth: 50 }}>
                    {left.value}
                  </Typography>
                </Box>
              ) : (
                <Box sx={{ width: '100%', height: 10 }} />
              )}
            </Box>

            {/* centro: mostrar los nombres de los modificadores izquierdo y derecho */}
            <Box width={centerWidth} display="flex" alignItems="center" justifyContent="center">
              <Box sx={{ width: '50%', display: 'flex', justifyContent: 'flex-start', pr: 1 }}>
                <Typography
                  variant="body2"
                  noWrap
                  color={left ? 'text.primary' : 'text.secondary'}
                  sx={{ textAlign: 'right' }}
                >
                  {t(left?.key ?? '')}
                </Typography>
              </Box>
              <Box sx={{ width: '50%', display: 'flex', justifyContent: 'flex-end', pl: 1 }}>
                <Typography
                  variant="body2"
                  noWrap
                  color={right ? 'text.primary' : 'text.secondary'}
                  sx={{ textAlign: 'left' }}
                >
                  {t(right?.key ?? '')}
                </Typography>
              </Box>
            </Box>

            {/* derecha */}
            <Box flex={1} display="flex" justifyContent="flex-start" pl={1}>
              {right ? (
                <Box display="flex" alignItems="center" width="100%" justifyContent="flex-start">
                  <Typography variant="body2" mr={1} color="success" sx={{ minWidth: 50 }}>
                    {right.value > 0 ? '+' : ''}
                    {right.value}
                  </Typography>
                  <Box
                    sx={{
                      height: 10,
                      width: `${(Math.abs(right.value) / maxAbs) * 100}%`,
                      bgcolor: rightColor,
                      borderRadius: 1,
                    }}
                  />
                </Box>
              ) : (
                <Box sx={{ width: '100%', height: 10 }} />
              )}
            </Box>
          </Box>
        );
      })}
    </Box>
  );
};

export default ModifierDualList;
