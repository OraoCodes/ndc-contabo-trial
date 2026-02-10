import { useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { KENYA_COUNTIES } from "@/lib/kenya-counties";

interface CountySelectorProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
}

export function CountySelector({ 
  value, 
  onChange, 
  disabled = false,
  className 
}: CountySelectorProps) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            "w-full justify-between",
            !value && "text-muted-foreground",
            className
          )}
        >
          {value || "Select county..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search county..." className="text-sm" />
          <CommandList className="max-h-[300px]">
            <CommandEmpty className="text-sm py-6 text-center">No county found.</CommandEmpty>
            <CommandGroup>
              {KENYA_COUNTIES.map((county) => (
                <CommandItem
                  key={county}
                  value={county}
                  onSelect={(currentValue) => {
                    onChange(currentValue === value ? "" : currentValue);
                    setOpen(false);
                  }}
                  className="text-sm py-2.5 px-3 cursor-pointer"
                >
                  <Check
                    className={cn(
                      "mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0",
                      value === county ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <span className="truncate">{county}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
