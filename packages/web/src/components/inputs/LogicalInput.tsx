import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import Badge from '../common/Badge';

interface LogicalInputProps {
  label?: string;
  value?: string[][]; // [[A, B], [C]] -> (A OR B) AND (C)
  onChange: (value: string[][]) => void;
}

export default function LogicalInput({ label, value, onChange }: LogicalInputProps) {
  const [inputValue, setInputValue] = useState('');
  const [addMode, setAddMode] = useState<'AND' | 'OR'>('AND');

  const safeValue = value?.filter((g) => g.length > 0) ?? [];

  const addTag = () => {
    if (!inputValue.trim()) return;
    const trimmedValue = inputValue.trim();
    const newValue = [...safeValue];

    if (addMode === 'AND' || newValue.length === 0) {
      // Add as a new AND group
      newValue.push([trimmedValue]);
    } else {
      // Add as an OR to the last existing group
      const lastIdx = newValue.length - 1;
      newValue[lastIdx] = [...newValue[lastIdx], trimmedValue];
    }

    onChange(newValue);
    setInputValue('');
  };

  const removeTag = (gIdx: number, iIdx: number) => {
    const newValue = safeValue
      .map((group, gi) => (gi === gIdx ? group.filter((_, ii) => ii !== iIdx) : group))
      .filter((group) => group.length > 0);
    onChange(newValue);
  };

  return (
    <div className="flex flex-col gap-2 w-full p-4 border rounded-lg bg-card shadow-sm">
      {label && <Label className="text-sm font-semibold">{label}</Label>}

      <div className="flex flex-col gap-4">
        {/* Input area */}
        <div className="flex items-center gap-2 w-full">
          <div className="relative flex-1 flex items-center">
             <input
                className="flex-1 px-3 py-2 text-sm border rounded-md bg-background shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
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
          </div>

          <div className="flex items-center border rounded-md bg-background overflow-hidden h-9 shadow-sm shrink-0">
              <Button
                type="button"
                variant={addMode === 'AND' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setAddMode('AND')}
                className="h-full rounded-none px-2.5 text-xs font-semibold"
              >
                AND
              </Button>
              <Button
                type="button"
                variant={addMode === 'OR' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setAddMode('OR')}
                className="h-full rounded-none px-2.5 text-xs font-semibold"
              >
                OR
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={addTag}
                disabled={!inputValue.trim()}
                className="h-full rounded-none border-l px-3 hover:bg-muted text-muted-foreground hover:text-foreground"
              >
                <Plus className="h-4 w-4 mr-1" /> Add
              </Button>
          </div>
        </div>

        {/* Display area */}
        <div className={`flex flex-col gap-3 p-4 border rounded-md bg-muted/20 min-h-[80px] transition-colors ${
            safeValue.length === 0 ? 'items-center justify-center border-dashed' : ''
          }`}>
          {safeValue.length === 0 ? (
            <span className="text-xs text-muted-foreground">No logical conditions added yet</span>
          ) : (
            safeValue.map((group, gIdx) => (
              <React.Fragment key={`group-${gIdx}`}>
                {gIdx > 0 && (
                   <div className="flex items-center justify-center -my-1">
                      <span className="px-2 py-0.5 rounded-full bg-background border text-[10px] font-bold text-muted-foreground shadow-sm uppercase tracking-wider">
                        AND
                      </span>
                   </div>
                )}

                <div className={`flex flex-wrap items-center gap-2 p-2.5 rounded-md ${
                  group.length > 1 ? 'border border-primary/20 bg-primary/5 shadow-inner' : 'border border-transparent bg-background shadow-sm'
                }`}>
                  {group.map((item, iIdx) => (
                    <React.Fragment key={`item-${gIdx}-${iIdx}`}>
                      {iIdx > 0 && (
                        <span className="text-[10px] font-bold text-primary/70 uppercase tracking-wide">
                          OR
                        </span>
                      )}
                      <Badge name={item} onRemove={() => removeTag(gIdx, iIdx)} />
                    </React.Fragment>
                  ))}
                </div>
              </React.Fragment>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
