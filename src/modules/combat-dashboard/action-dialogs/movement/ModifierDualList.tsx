import React, { FC } from 'react';
import { Box, Typography, useTheme } from '@mui/material';
import { KeyValue } from '@labcabrera-rmu/rmu-react-shared-lib';

type Modifiers = KeyValue[];

interface Props {
  modifiers: Modifiers;
  /** si es true, la columna izquierda muestra los positivos (success) y la derecha los negativos (error). */
  leftIsPositive?: boolean;
  /** ancho fijo del área central (nombre + barra) */
  centerWidth?: number | string;
}

const rowHeight = 36;

const ModifierDualList: FC<Props> = ({ modifiers, leftIsPositive = false, centerWidth = 200 }) => {
  const theme = useTheme();
  const list = modifiers;
  const positives = list.filter((x) => x.value >= 0).sort((a, b) => b.value - a.value);
  const negatives = list.filter((x) => x.value < 0).sort((a, b) => Math.abs(b.value) - Math.abs(a.value));
  const maxAbs = Math.max(1, ...list.map((x) => Math.abs(x.value)));

  // emparejamos por índice: la fila i contiene positives[i] a la izquierda y negatives[i] a la derecha
  const rows = Math.max(positives.length, negatives.length);

  const leftColor = leftIsPositive ? theme.palette.success.main : theme.palette.error.main;
  const rightColor = leftIsPositive ? theme.palette.error.main : theme.palette.success.main;

  return (
    <Box display="flex" flexDirection="column">
      {Array.from({ length: rows }).map((_, i) => {
        const left = negatives[i];
        const right = positives[i];

        // preferimos el nombre del lado que exista; si ambos, mostramos ambos con prioridad a la izquierda
        const centerItem = left ?? right;
        const centerPercent = centerItem ? (Math.abs(centerItem.value) / maxAbs) * 100 : 0;

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
                  <Typography variant="body2" ml={1} color="text.secondary">
                    {left.value}
                  </Typography>
                </Box>
              ) : (
                <Box sx={{ width: '100%', height: 10 }} />
              )}
            </Box>

            {/* centro: nombre fijo + barra relativa al mayor de los modificadores */}
            <Box width={centerWidth} display="flex" flexDirection="column" alignItems="center">
              <Typography variant="body2" noWrap>
                {centerItem?.key ?? ''}
              </Typography>
              <Box sx={{ width: '100%', mt: 0.5 }}>
                <Box sx={{ width: '100%', height: 8, bgcolor: 'action.selected', borderRadius: 1 }}>
                  <Box
                    sx={{
                      height: '100%',
                      width: `${centerPercent}%`,
                      bgcolor:
                        centerItem && (centerItem.value > 0 ? theme.palette.success.main : theme.palette.error.main),
                      borderRadius: 1,
                    }}
                  />
                </Box>
              </Box>
            </Box>

            {/* derecha */}
            <Box flex={1} display="flex" justifyContent="flex-start" pl={1}>
              {right ? (
                <Box display="flex" alignItems="center" width="100%" justifyContent="flex-start">
                  <Typography variant="body2" mr={1} color="text.secondary">
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
      <pre>Positives: {JSON.stringify(positives, null, 2)}</pre>
      <pre>Negatives: {JSON.stringify(negatives, null, 2)}</pre>
    </Box>
  );
};

export default ModifierDualList;
