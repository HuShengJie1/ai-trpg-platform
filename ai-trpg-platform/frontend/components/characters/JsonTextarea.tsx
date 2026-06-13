"use client";

type JsonTextareaProps = {
  disabled?: boolean;
  label: string;
  name: string;
  value: string;
  onChange: (name: string, value: string) => void;
};

export default function JsonTextarea({
  disabled = false,
  label,
  name,
  value,
  onChange,
}: JsonTextareaProps) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-gray-700">{label}</span>
      <textarea
        className="mt-1 min-h-36 w-full rounded-md border border-gray-300 px-3 py-2 font-mono text-sm leading-6 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
        disabled={disabled}
        name={name}
        spellCheck={false}
        value={value}
        onChange={(event) => onChange(name, event.target.value)}
      />
    </label>
  );
}
