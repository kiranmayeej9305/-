import React from 'react';

const Layout = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>; // No ClerkProvider here, as it's already in RootLayout
};

export default Layout;
