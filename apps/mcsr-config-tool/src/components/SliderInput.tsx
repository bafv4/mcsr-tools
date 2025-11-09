interface SliderInputProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
  formatter?: (value: number) => string;
}

export function SliderInput({ label, value, min, max, step, onChange, formatter }: SliderInputProps) {
  const displayValue = formatter ? formatter(value) : value.toString();

  return (
    <div className="space-y-2">
      <label className="flex justify-between items-center text-sm font-medium text-primary">
        <span>{label}</span>
        <input
          type="number"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => {
            const val = parseFloat(e.target.value);
            if (!isNaN(val) && val >= min && val <= max) {
              onChange(val);
            }
          }}
          className="w-24 px-2 py-1 text-center font-mono text-lg font-bold text-blue-600 dark:text-blue-400 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded"
        />
      </label>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full"
      />
      {formatter && (
        <div className="text-xs text-secondary text-right">{displayValue}</div>
      )}
    </div>
  );
}
