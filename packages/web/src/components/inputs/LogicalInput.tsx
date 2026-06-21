import React, { useState, useId } from 'react';
import { ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
  const inputId = useId();

  const safeValue = value?.filter((g) => g.length > 0) ?? [];

  const addTag = (asAnd: boolean) => {
    if (!inputValue.trim()) return;
    const newValue = [...safeValue];
    if (asAnd || newValue.length === 0) {
      newValue.push([inputValue.trim()]);
    } else {
      const lastIdx = newValue.length - 1;
      newValue[lastIdx] = [...newValue[lastIdx], inputValue.trim()];
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

  const convertAndToOr = (targetGroupIdx: number) => {
    const newValue = [...safeValue];
    const groupToMove = newValue[targetGroupIdx];
    newValue[targetGroupIdx - 1] = [...newValue[targetGroupIdx - 1], ...groupToMove];
    newValue.splice(targetGroupIdx, 1);
    onChange(newValue);
  };

  const convertOrToAnd = (gIdx: number, iIdx: number) => {
    const newValue = [...safeValue];
    const currentGroup = newValue[gIdx];

    // Split the group into two parts at the clicked position
    const firstPart = currentGroup.slice(0, iIdx); // [A, B]
    const secondPart = currentGroup.slice(iIdx); // [C, D]

    // Replace the current group with the first part
    newValue[gIdx] = firstPart;
    // Insert the second part as a new group at the next index
    newValue.splice(gIdx + 1, 0, secondPart);

    onChange(newValue.filter((g) => g.length > 0));
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
              addTag(true);
            }
          }}
        />
        <Button type="button" variant="outline" onClick={() => addTag(true)} className="px-3 py-2">
          Add
        </Button>
      </div>

      {/* Display area */}
      <div className="flex flex-wrap items-center gap-2 p-2 border bg-secondary/20 min-h-[70px]">
        {safeValue.map((group, gIdx) => (
          <React.Fragment key={`group-${gIdx}`}>
            {gIdx > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    aria-label="Change logical operator (currently AND)"
                  >
                    AND
                    <ChevronDown className="ml-0.5 h-3 w-3 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="center">
                  <DropdownMenuItem onClick={() => convertAndToOr(gIdx)}>OR</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            <div
              className={`flex flex-wrap items-center gap-1.5 p-1 rounded-md max-w-full ${
                group.length > 1 ? 'border-3 border-dashed bg-muted/40' : ''
              }`}
            >
              {group.map((item, iIdx) => (
                <React.Fragment key={`item-${gIdx}-${iIdx}`}>
                  {iIdx > 0 && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          type="button"
                          variant="ghost"
                          aria-label="Change logical operator (currently OR)"
                        >
                          OR
                          <ChevronDown className="h-2 w-2 ml-0.5 opacity-50" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="center">
                        <DropdownMenuItem onClick={() => convertOrToAnd(gIdx, iIdx)}>
                          AND
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                  <Badge name={item} onRemove={() => removeTag(gIdx, iIdx)} />
                  {/* <Badge className="bg-zinc-900 dark:bg-zinc-100 text-zinc-100 dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 rounded-sm flex items-center gap-0 px-0 h-8 border-none overflow-hidden shadow-sm transition-colors">
                    <span className="px-2 text-[11px] border-r border-current/20 h-full flex items-center opacity-80">
                      About:{' '}
                      <span className="font-bold ml-1 opacity-100">{item}</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => removeTag(gIdx, iIdx)}
                      className="px-2 hover:bg-red-500 hover:text-white h-full transition-colors"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </Badge> */}
                </React.Fragment>
              ))}
            </div>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
