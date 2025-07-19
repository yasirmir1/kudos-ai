import React from 'react';
import { Check, ChevronsUpDown, GraduationCap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useAgeGroup } from '@/contexts/AgeGroupContext';

export const AgeGroupSelector: React.FC = () => {
  const { selectedAgeGroup, setSelectedAgeGroup, ageGroups } = useAgeGroup();
  const [open, setOpen] = React.useState(false);

  const selectedGroup = ageGroups.find(group => group.value === selectedAgeGroup);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[240px] justify-between bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
        >
          <div className="flex items-center">
            <GraduationCap className="mr-2 h-4 w-4 shrink-0" />
            <span className="truncate">{selectedGroup?.label}</span>
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[240px] p-0" align="start">
        <Command>
          <CommandEmpty>No age group found.</CommandEmpty>
          <CommandGroup>
            <CommandList>
              {ageGroups.map((group) => (
                <CommandItem
                  key={group.value}
                  value={group.value}
                  onSelect={(currentValue) => {
                    if (currentValue !== selectedAgeGroup) {
                      setSelectedAgeGroup(currentValue as any);
                    }
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      selectedAgeGroup === group.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {group.label}
                </CommandItem>
              ))}
            </CommandList>
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
};