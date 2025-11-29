import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function SearchBar({ value, onChange, placeholder = "Search menu..." }: SearchBarProps) {
  return (
    <div className="relative">
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={cn(
          "w-full h-12 pl-12 pr-12 bg-secondary border border-border rounded-xl",
          "text-foreground placeholder:text-muted-foreground",
          "focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent",
          "transition-all duration-200"
        )}
      />
      {value && (
        <button
          onClick={() => onChange("")}
          className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-muted hover:bg-muted-foreground/20 flex items-center justify-center transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
