import { useState } from 'react';
import { Outlet } from 'react-router-dom';

export default function Auth() {
  const [email, setEmail] = useState('');

  return <Outlet context={{ email, setEmail }} />;
}
