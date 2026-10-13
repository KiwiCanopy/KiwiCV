import { BrowserRouter } from 'react-router-dom';

import { AppRoutes } from '@/app/AppRoutes';
import { GlobalOverlays } from '@/app/GlobalOverlays';
import { useDocumentPreferences } from '@/app/useDocumentPreferences';
import { GooglePostLoginRestore } from '@/components/auth/GooglePostLoginRestore';
import { SEO } from '@/components/ui/SEO';
import { shouldShowMigrationGateway } from '@/config/brand';
import { MigrationGateway } from '@/pages/MigrationGateway';
import { AuthProvider } from '@/providers/AuthProvider';

const isLegacyDomain = shouldShowMigrationGateway(window.location.hostname);

function App() {
  useDocumentPreferences(isLegacyDomain);

  if (isLegacyDomain) return <MigrationGateway />;

  return (
    <AuthProvider>
      <BrowserRouter>
        <SEO />
        <GooglePostLoginRestore />
        <GlobalOverlays />
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
