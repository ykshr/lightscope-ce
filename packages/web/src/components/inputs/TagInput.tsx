import { useState, useId } from 'react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import Badge from '../common/Badge';

interface TagInputProps {
  label?: string;
  value?: string[];
  onChange: (tags: string[]) => void;
}

export default function TagInput({ label, value = [], onChange }: TagInputProps) {
  const [inputValue, setInputValue] = useState('');
  const inputId = useId();

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
    <div className="flex flex-col gap-3 w-full">
      {label && <Label htmlFor={inputId}>{label}</Label>}

      {/* Input area */}
      <div className="flex gap-2 justify-center items-center">
        <input
          id={inputId}
          className="flex-1 px-3 py-2 border rounded-lg"
          placeholder="New..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              addTag();
            }
          }}
        />
        <Button type="button" variant="outline" onClick={addTag} className="px-3 py-2">
          Add
        </Button>
      </div>

      {/* Display area */}
      <div className="flex flex-wrap items-center gap-2 p-2 border bg-secondary/20 min-h-[70px]">
        {value.length === 0 ? (
          <span className="text-muted-foreground">Nothing added yet</span>
        ) : (
          value.map((tag, index) => (
            <Badge key={`${tag}-${index}`} name={tag} onRemove={() => removeTag(index)} />
          ))
        )}
      </div>
    </div>
  );
}
