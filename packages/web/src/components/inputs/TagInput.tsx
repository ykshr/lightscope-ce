import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import Badge from '../common/Badge';

interface TagInputProps {
  label?: string;
  value?: string[];
  onChange: (tags: string[]) => void;
}

export default function TagInput({ label, value = [], onChange }: TagInputProps) {
  const [inputValue, setInputValue] = useState('');

  const addTag = () => {
    const trimmedValue = inputValue.trim();
    if (trimmedValue && !value.includes(trimmedValue)) {
      onChange([...value, trimmedValue]);
      setInputValue('');
    }
  };

  const removeTag = (indexToRemove: number) => {
    onChange(value.filter((_, index) => index !== indexToRemove));
  };

  return (
    <div className="flex flex-col gap-2 w-full p-4 border rounded-lg bg-card shadow-sm">
      {label && <Label className="text-sm font-semibold">{label}</Label>}

      <div className="flex flex-col gap-3">
        {/* Input area */}
        <div className="relative flex items-center w-full">
          <input
            className="flex-1 px-3 py-2 pr-12 text-sm border rounded-md bg-background shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            placeholder="Type and press Enter to add..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addTag();
              }
            }}
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={addTag}
            disabled={!inputValue.trim()}
            className="absolute right-1 h-7 px-2 text-muted-foreground hover:text-foreground"
          >
            <Plus className="h-4 w-4" />
            <span className="sr-only">Add tag</span>
          </Button>
        </div>

        {/* Display area */}
        <div
          className={`flex flex-wrap items-center gap-2 p-3 border rounded-md bg-muted/30 min-h-[60px] transition-colors ${
            value.length === 0 ? 'justify-center border-dashed' : ''
          }`}
        >
          {value.length === 0 ? (
            <span className="text-xs text-muted-foreground">No items added yet</span>
          ) : (
            value.map((tag, index) => (
              <Badge key={`${tag}-${index}`} name={tag} onRemove={() => removeTag(index)} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
