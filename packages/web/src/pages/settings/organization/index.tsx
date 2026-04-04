import authClient from '@/helpers/auth';
import DangerZone from './DangerZone';
import General from './General';
import Members from './Members';
import Trackers from './Trackers';

export default function Organization() {
  const { data, isPending } = authClient.useActiveOrganization();

  return (
    <div className="space-y-10">
      {isPending && <div>Loading organization...</div>}
      {!isPending && !data && <div>Failed to load organization.</div>}
      {!isPending && data && (
        <>
          <General org={data} />
          <Members org={data} />
          <Trackers org={data} />
          <DangerZone org={data} />
        </>
      )}
    </div>
  );
}
