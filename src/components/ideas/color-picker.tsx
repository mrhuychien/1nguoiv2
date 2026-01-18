"use client";

import { cn } from "@/lib/utils";
import { NODE_COLORS } from "@/store/idea-store";

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
}

export function ColorPicker({ value, onChange }: ColorPickerProps) {
  return (
    <div className="flex gap-2 flex-wrap">
      {NODE_COLORS.map((color) => (
        <button
          key={color.value}
          type="button"
          onClick={() => onChange(color.value)}
          className={cn(
            "w-7 h-7 rounded-full border-2 transition-transform hover:scale-110",
            value === color.value
              ? "border-white scale-110"
              : "border-transparent"
          )}
          style={{ backgroundColor: color.value }}
          title={color.name}
        />
      ))}
    </div>
  );
}
