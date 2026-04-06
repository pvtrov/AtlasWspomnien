"use client";

import {
  PartialDateInput,
  type PartialDateValue,
} from "@/components/photos/partial-date-input";

type PartialDateRangeValue = {
  from: PartialDateValue;
  to: PartialDateValue;
};

type Props = {
  value: PartialDateRangeValue;
  onChange: (nextValue: PartialDateRangeValue) => void;
};

export type { PartialDateRangeValue };

export function PartialDateRangeInput({ value, onChange }: Props) {
  return (
    <div className="partial-date-range-input" role="group" aria-label="Zakres dat archiwalnych">
      <PartialDateInput
        legend="Początek zakresu"
        baseName="rangeStart"
        value={value.from}
        onChange={(nextFrom) =>
          onChange({
            ...value,
            from: nextFrom,
          })
        }
      />

      <PartialDateInput
        legend="Koniec zakresu"
        baseName="rangeEnd"
        value={value.to}
        onChange={(nextTo) =>
          onChange({
            ...value,
            to: nextTo,
          })
        }
      />
    </div>
  );
}
