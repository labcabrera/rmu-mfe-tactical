import { useEffect, useState } from 'react';
import { HealerSelection } from '@labcabrera-rmu/rmu-react-shared-lib';
import { initialMedicalForm, MedicalRollForm, MedicalTarget } from './medical-roll-rules';

/** The choices of the medical roll dialog. A new target starts a new roll. */
export const useMedicalRollForm = (target: MedicalTarget | null, healer: () => HealerSelection) => {
  const [form, setForm] = useState<MedicalRollForm>(() => initialMedicalForm(target, healer()));
  useEffect(() => {
    if (target) setForm(initialMedicalForm(target, healer()));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target]);
  const change = (patch: Partial<MedicalRollForm>) => setForm((prev) => ({ ...prev, ...patch }));
  return { form, change };
};
