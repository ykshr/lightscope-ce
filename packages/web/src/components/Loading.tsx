import { Spinner as SpinnerBase } from '@/components/ui/spinner';

export function Loading() {
  return <div className="animate-pulse">Loading...</div>;
}

export function Spinner({
  sizeByCharLength = 4,
}: {
  sizeByCharLength?: number;
}) {
  const height = '1em';
  const width = `${sizeByCharLength}ch`;
  return (
    <div className="flex items-center justify-center" style={{ width, height }}>
      <SpinnerBase />
    </div>
  );
}
