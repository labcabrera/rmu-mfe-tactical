import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { OptionGroup } from '@labcabrera-rmu/rmu-react-shared-lib';
import { ModifierOption } from '../attack-modifier-fields';

/**
 * A choice of the combat flows as the shared exclusive OptionGroup (workspace spec 085, 3.1), with the value of each
 * option. Choosing the selected option again reports it too, so that the callers that allow it can clear the choice.
 */
const OptionTiles: FC<{
  label: string;
  options: ModifierOption[];
  value: string;
  onChange: (key: string) => void;
  /** Label of an option; defaults to the translation of its key. */
  optionLabel?: (option: ModifierOption) => string;
}> = ({ label, options, value, onChange, optionLabel }) => {
  const { t } = useTranslation();
  return (
    <OptionGroup
      label={label}
      options={options.map((option) => ({
        key: option.key,
        label: optionLabel ? optionLabel(option) : t(option.key),
        value: option.value,
      }))}
      value={value}
      onChange={onChange}
      reselect
    />
  );
};

export default OptionTiles;
