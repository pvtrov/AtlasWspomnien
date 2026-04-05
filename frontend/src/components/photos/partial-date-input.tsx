"use client";

type PartialDateValue = {
  year: string;
  month: string;
  day: string;
};

type Props = {
  legend: string;
  value: PartialDateValue;
  baseName: string;
  yearLabel?: string;
  monthLabel?: string;
  dayLabel?: string;
  onChange: (nextValue: PartialDateValue) => void;
};

export type { PartialDateValue };

export function createPartialDateValue(
  year: string,
  month: string,
  day: string,
): PartialDateValue {
  return { year, month, day };
}

export function PartialDateInput({
  legend,
  value,
  baseName,
  yearLabel = "Year",
  monthLabel = "Month",
  dayLabel = "Day",
  onChange,
}: Props) {
  function handleFieldChange(
    field: keyof PartialDateValue,
    nextFieldValue: string,
  ): void {
    if (field === "month" && nextFieldValue === "") {
      onChange({
        year: value.year,
        month: "",
        day: "",
      });
      return;
    }

    if (field === "year" && nextFieldValue === "") {
      onChange({
        year: "",
        month: "",
        day: "",
      });
      return;
    }

    onChange({
      ...value,
      [field]: nextFieldValue,
    });
  }

  return (
    <fieldset className="partial-date-input">
      <legend>{legend}</legend>

      <div className="partial-date-input__grid">
        <div className="auth-field">
          <label htmlFor={`${baseName}Year`}>{yearLabel}</label>
          <input
            id={`${baseName}Year`}
            type="number"
            inputMode="numeric"
            value={value.year}
            onChange={(event) => handleFieldChange("year", event.target.value)}
            placeholder="1982"
          />
        </div>

        <div className="auth-field">
          <label htmlFor={`${baseName}Month`}>{monthLabel}</label>
          <select
            id={`${baseName}Month`}
            value={value.month}
            onChange={(event) => handleFieldChange("month", event.target.value)}
            disabled={!value.year}
          >
            <option value="">Any month</option>
            {Array.from({ length: 12 }, (_, index) => String(index + 1)).map((month) => (
              <option key={month} value={month}>
                {month.padStart(2, "0")}
              </option>
            ))}
          </select>
        </div>

        <div className="auth-field">
          <label htmlFor={`${baseName}Day`}>{dayLabel}</label>
          <select
            id={`${baseName}Day`}
            value={value.day}
            onChange={(event) => handleFieldChange("day", event.target.value)}
            disabled={!value.month}
          >
            <option value="">Any day</option>
            {Array.from({ length: 31 }, (_, index) => String(index + 1)).map((day) => (
              <option key={day} value={day}>
                {day.padStart(2, "0")}
              </option>
            ))}
          </select>
        </div>
      </div>
    </fieldset>
  );
}
