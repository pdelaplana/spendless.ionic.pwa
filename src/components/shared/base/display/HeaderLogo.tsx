import { SpendlessLogo } from '@/components/brand';
import type React from 'react';

const HeaderLogo: React.FC = () => {
  return <SpendlessLogo variant='primary' size='medium' data-testid='the-logo' />;
};

export default HeaderLogo;
