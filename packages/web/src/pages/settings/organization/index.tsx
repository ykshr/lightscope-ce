import authClient from '@/helpers/auth';
import DangerZone from './DangerZone';
import General from './General';
import Members from './Members';
import Trackers from './Trackers';

export default function Organization() {
  const { data: session } = authClient.useSession();
  const { id } = session?.user || {};

  const { data, isPending } = authClient.useActiveOrganization();
  console.log(data);
  const me = data?.members?.find((member: any) => member.user.id === id);

  return (
    <div className="space-y-10">
      {isPending && <div>Loading organization...</div>}
      {!isPending && !data && <div>Failed to load organization.</div>}
      {!isPending && data && (
        <>
          <General org={data} me={me} />
          <Members org={data} me={me} />
          <Trackers org={data} me={me} />
          <DangerZone org={data} me={me} />
        </>
      )}
    </div>
  );
}
