import * as React from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <div className="w-full">
        <textarea
          className={cn(
            "flex min-h-[100px] w-full rounded-lg border border-border bg-background-secondary px-3 py-2 text-sm text-text-primary placeholder:text-text-muted transition-colors resize-none",
            "focus:outline-none focus:ring-2 focus:ring-cyan focus:ring-offset-2 focus:ring-offset-background focus:border-cyan",
            "disabled:cursor-not-allowed disabled:opacity-50",
            error && "border-danger focus:ring-danger",
            className
          )}
          ref={ref}
          {...props}
        />
        {error && <p className="mt-1 text-sm text-danger">{error}</p>}
      </div>
    );
  }
);
Textarea.displayName = "Textarea";

export { Textarea };
