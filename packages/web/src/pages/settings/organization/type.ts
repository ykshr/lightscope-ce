import type { Invitation, Member, Organization } from 'better-auth/client/plugins';

export interface Props {
  org: Organization & {
    members: (Member & { user?: { email: string } })[];
    invitations: Invitation[];
  };
  me?: Member;
}
