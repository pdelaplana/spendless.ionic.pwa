import { Redirect, Route } from 'react-router-dom';
import { IonApp, IonRouterOutlet, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import Home from './pages/home/HomePage';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/**
 * Ionic Dark Mode
 * -----------------------------------------------------
 * For more info, please see:
 * https://ionicframework.com/docs/theming/dark-mode
 */

/* import '@ionic/react/css/palettes/dark.always.css'; */
/* import '@ionic/react/css/palettes/dark.class.css'; */
import '@ionic/react/css/palettes/dark.system.css';

/* Theme variables */
import './theme/variables.css';
import { AuthProvider } from './providers/auth/AuthProvider';
import AppRoutes from './routes/AppRoutes';

import './app.css';
import './positioning.css';

setupIonicReact({ mode: 'md' });

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // default: true
      retry: 1,
    },
  },
});

const App: React.FC = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <IonApp>
        <AppRoutes />
      </IonApp>
    </AuthProvider>
    {import.meta.env.DEV && (
      <ReactQueryDevtools initialIsOpen={false} buttonPosition='bottom-left' />
    )}
  </QueryClientProvider>
);

export default App;
