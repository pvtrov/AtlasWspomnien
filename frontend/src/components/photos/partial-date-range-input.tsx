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
    <div className="partial-date-range-input">
      <PartialDateInput
        legend="Range start"
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
        legend="Range end"
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
