"use client";

import * as React from "react";

type Opt = { value: string; label: string };

export default function WhiteSelect(props: {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: Opt[];
  placeholder?: string; // (tikai accessibility / tooltip)
  className?: string;
  disabled?: boolean;
}) {
  const { value, onChange, options, placeholder, className, disabled } = props;

  return (
    <select
      value={value}
      onChange={onChange}
      disabled={disabled}
      aria-label={placeholder ?? "Select"}
      title={placeholder ?? ""}
      className={[
        "white-select",
        "h-11 w-full rounded-2xl border border-black/20 bg-white px-4 text-sm font-semibold text-black outline-none",
        "focus:ring-2 focus:ring-black/15",
        className ?? "",
      ].join(" ")}
      style={{ backgroundColor: "#fff", color: "#000" }}
    >
      {options.map((o) => (
        <option
          key={o.value}
          value={o.value}
          style={{ backgroundColor: "#fff", color: "#000" }}
        >
          {o.label}
        </option>
      ))}
    </select>
  );
}
