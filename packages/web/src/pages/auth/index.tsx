import Page from '@/components/page/Page';
import { useState } from 'react';
import { Outlet } from 'react-router-dom';

export default function Auth() {
  const [email, setEmail] = useState('');
  const header = <></>;

  return (
    <Page header={header}>
      <Outlet context={{ email, setEmail }} />
    </Page>
  );
}
