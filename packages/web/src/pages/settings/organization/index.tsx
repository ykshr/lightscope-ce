import authClient from '@/helpers/auth';
import { useSession } from '@/hooks/useAuth';
import DangerZone from './DangerZone';
import General from './General';
import Members from './Members';
import Trackers from './Trackers';

export default function Organization() {
  const { data: org, isPending } = authClient.useActiveOrganization();

  const { data: session } = useSession();
  const { id } = session?.user || {};
  const me = org?.members?.find((member) => member.user?.id === id);

  return (
    <>
      <h1>Organization - {org?.name}</h1>
      {isPending && <div>Loading...</div>}
      {!isPending && !org && <div>Failed to load organization.</div>}
      {!isPending && org && (
        <>
          <General org={org} me={me} />
          <Members org={org} me={me} />
          <Trackers org={org} me={me} />
          <DangerZone org={org} me={me} />
        </>
      )}
    </>
  );
}
