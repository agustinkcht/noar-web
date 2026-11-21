"use client";

type Props = { value: number; onChange: (v: number) => void; id: string; min?: number };

export function QtyStepper({ value, onChange, id, min = 0 }: Props) {
  return (
    <div className="stepper">
      <button type="button" onClick={() => onChange(Math.max(min, value - 1))} aria-label="Restar uno">
        −
      </button>
      <input
        id={id}
        type="number"
        inputMode="numeric"
        min={min}
        value={value}
        onChange={(e) => {
          const n = parseInt(e.target.value, 10);
          onChange(Number.isFinite(n) ? Math.max(min, n) : min);
        }}
        aria-label="Cantidad"
      />
      <button type="button" onClick={() => onChange(value + 1)} aria-label="Sumar uno">
        +
      </button>
    </div>
  );
}
