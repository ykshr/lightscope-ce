import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import { useIsDesktop } from '@/hooks/useMediaQuery';
import { cn } from '@/utils';

interface ResponsiveModalProps {
  dialogClassName?: string;
  drawerClassName?: string;
  children: React.ReactNode;
  trigger?: React.ReactNode;
  title: string;
  description?: string;
  buttons?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export default function ResponsiveModal({
  dialogClassName,
  drawerClassName,
  children,
  trigger,
  title,
  description,
  buttons,
  open,
  onOpenChange,
}: ResponsiveModalProps) {
  const isDesktop = useIsDesktop();

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
        <DialogContent className={cn('sm:max-w-[max-content] md:max-w-[700px]', dialogClassName)}>
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <div className="flex items-center justify-between w-full">
              {description && <DialogDescription>{description}</DialogDescription>}
              {buttons && <div>{buttons}</div>}
            </div>
          </DialogHeader>
          {children}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      {trigger && <DrawerTrigger asChild>{trigger}</DrawerTrigger>}
      <DrawerContent className={drawerClassName}>
        <DrawerHeader className="text-left">
          <DrawerTitle>{title}</DrawerTitle>
          <div className="flex items-center justify-between w-full">
            {description && <DrawerDescription>{description}</DrawerDescription>}
            {buttons && <div>{buttons}</div>}
          </div>
        </DrawerHeader>
        <div className="px-4 pb-4">{children}</div>
      </DrawerContent>
    </Drawer>
  );
}
