import { TemperatureKind, temperatureSeverity } from '@labcabrera-rmu/rmu-react-shared-lib';

/** The severity comes from the temperature (Table 15-3) or is given by the game master (contact with frost or fire). */
export type SeverityMode = 'temperature' | 'severity';

/** The severity a form gives: the one chosen, or the one of the temperature when it is on the side of the kind. */
export const formSeverity = (form: {
  kind: TemperatureKind;
  mode: SeverityMode;
  temperature: number | null;
  severity: string;
}): string | null => {
  if (form.mode === 'severity') return form.severity;
  const fromTable = temperatureSeverity(form.temperature);
  const side = form.kind === 'cold' ? 'cold' : 'heat';
  return fromTable && fromTable.kind === side ? fromTable.severity : null;
};
