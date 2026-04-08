import { useState } from 'react';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';

export default function SearchBar() {
  const [search, setSearch] = useState('');

  const onValueChange = (value: string) => {
    setSearch(value);
  };

  return (
    <div className="flex items-center gap-2 md:w-100">
      <Command>
        <CommandInput
          value={search}
          onValueChange={onValueChange}
          placeholder="Type a command or search..."
        />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Suggestions">
            <CommandItem>Calendar</CommandItem>
            <CommandItem>Search Emoji</CommandItem>
            <CommandItem>Calculator</CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
    </div>
  );
}
