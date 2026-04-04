import authClient from '@/helpers/auth';
import DangerZone from './DangerZone';
import General from './General';
import Members from './Members';
import Trackers from './Trackers';

export default function Organization() {
  const { data: org, isPending } = authClient.useActiveOrganization();

  const { data: session } = authClient.useSession();
  const { id } = session?.user || {};
  const me = org?.members?.find((member: any) => member.user.id === id);

  return (
    <div className="space-y-10">
      {isPending && <div>Loading organization...</div>}
      {!isPending && !org && <div>Failed to load organization.</div>}
      {!isPending && org && (
        <>
          <General org={org} me={me} />
          <Members org={org} me={me} />
          <Trackers org={org} me={me} />
          <DangerZone org={org} me={me} />
        </>
      )}
    </div>
  );
}
