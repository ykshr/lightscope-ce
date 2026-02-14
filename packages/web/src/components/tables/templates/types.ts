export type Column<T> = {
  header: string;
  accessorKey: keyof T | string;
  className?: string;
  gridSpan?: number;
  render?: (item: T, index: number) => React.ReactNode;
  hideMobile?: boolean;
};
