import Page from '@/components/page/Page';
import { Outlet } from 'react-router-dom';

export default function Settings() {
  const header = <></>;

  return (
    <Page header={header}>
      <Outlet />
    </Page>
  );
}
