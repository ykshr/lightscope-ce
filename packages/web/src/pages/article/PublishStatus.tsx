import { AlertCircle, CheckCircle2, Timer } from 'lucide-react';

function isAfter(date1: Date, date2: Date) {
  return date1.getTime() > date2.getTime();
}

function isBefore(date1: Date, date2: Date) {
  return date1.getTime() < date2.getTime();
}

export default function PublishStatus({
  publishedTime,
  expiredTime,
}: {
  publishedTime?: Date;
  expiredTime?: Date;
}) {
  const getStatus = () => {
    const now = new Date();

    if (expiredTime && isAfter(now, expiredTime)) {
      return {
        label: 'Expired',
        color: 'text-red-400',
        icon: AlertCircle,
        bg: 'bg-red-400/10 border-red-400/20',
      };
    }

    if (publishedTime && isBefore(now, publishedTime)) {
      return {
        label: 'Draft',
        color: 'text-yellow-400',
        icon: Timer,
        bg: 'bg-yellow-400/10 border-yellow-400/20',
      };
    }

    if (publishedTime && isAfter(now, publishedTime)) {
      return {
        label: 'Published',
        color: 'text-emerald-400',
        icon: CheckCircle2,
        bg: 'bg-emerald-400/10 border-emerald-400/20',
      };
    }

    return {
      label: 'Unknown',
      color: 'text-gray-400',
      icon: CheckCircle2,
      bg: 'bg-gray-400/10 border-gray-400/20',
    };
  };

  const status = getStatus();
  const StatusIcon = status.icon;

  return (
    <div
      data-testid="publish-status"
      className={`flex items-center gap-2 w-fit px-3 py-2 rounded-full border text-xs font-bold uppercase mb-5 ${status.bg} ${status.color}`}
    >
      <StatusIcon size={14} />
      <span>Status: {status.label}</span>
    </div>
  );
}
