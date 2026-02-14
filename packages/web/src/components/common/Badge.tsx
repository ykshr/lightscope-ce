import { X } from 'lucide-react';
import { Badge as B } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function Badge({
  name,
  onRemove,
}: {
  name: string;
  onRemove: () => void;
}) {
  return (
    <B variant="secondary" className="text-sm whitespace-normal break-all px-3">
      {name}
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        onClick={onRemove}
        aria-label={`Delete ${name}`}
      >
        <X />
      </Button>
    </B>
  );
}
