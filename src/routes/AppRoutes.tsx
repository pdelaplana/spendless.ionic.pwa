import SigninPage from '@/pages/signin/SigninPage';
import {
  IonIcon,
  IonLabel,
  IonLoading,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonTabs,
} from '@ionic/react';
import { Route, Redirect, Switch } from 'react-router';
import { ROUTES } from './routes.constants';
import HomePage from '@/pages/home/HomePage';
import { useAuth } from '@/providers/auth/useAuth';
import type React from 'react';
import { useState, useEffect } from 'react';
import { IonReactRouter } from '@ionic/react-router';
import SignupPage from '@/pages/signup/SignupPage';
import ProtectedRoute from './ProtectedRoute';
import ProfilePage from '@/pages/profile/ProfilePage';
import ProfileInformationPage from '@/pages/profile/ProfileInformationPage';
import { homeOutline, peopleOutline, ellipsisHorizontalOutline } from 'ionicons/icons';
import SpendingPage from '@/pages/spending/SpendingPage';
import { SpendingAccountProvider } from '@/providers/spendingAccount';
import ScheduledSpendingPage from '@/pages/spending/ScheduledSpendingPage';
import SpendingPeriodsPage from '@/pages/spending/SpendingPeriodsPage';

interface AuthState {
  isInitialized: boolean;
  isLoading: boolean;
  error: Error | null;
}

const ProfileRoutes: React.FC = () => {
  return (
    <Switch>
      <ProtectedRoute path={ROUTES.PROFILE} exact={true}>
        <ProfilePage />
      </ProtectedRoute>
      <ProtectedRoute path={`${ROUTES.PROFILE}/info`} exact>
        <ProfileInformationPage />
      </ProtectedRoute>
    </Switch>
  );
};

const SpendingRoutes = ({ userId }: { userId: string }) => {
  return (
    <SpendingAccountProvider userId={userId}>
      <Switch>
        <ProtectedRoute path={ROUTES.SPENDING_SCHEDULED} exact={true}>
          <ScheduledSpendingPage />
        </ProtectedRoute>
        <ProtectedRoute path={ROUTES.SPENDING_PERIODS} exact={true}>
          <SpendingPeriodsPage />
        </ProtectedRoute>
        <ProtectedRoute path={ROUTES.SPENDING} exact={true}>
          <SpendingPage />
        </ProtectedRoute>
      </Switch>
    </SpendingAccountProvider>
  );
};

const MainTabRoutes: React.FC = () => {
  return (
    <IonTabs>
      <IonRouterOutlet>
        <Switch>
          <ProtectedRoute path={ROUTES.ROOT} exact={true}>
            <HomePage />
          </ProtectedRoute>
        </Switch>
      </IonRouterOutlet>

      <IonTabBar slot='bottom'>
        <IonTabButton tab='home' href={ROUTES.ROOT}>
          <IonIcon aria-hidden='true' icon={homeOutline} />
          <IonLabel>Home</IonLabel>
        </IonTabButton>

        <IonTabButton tab='customers' href={ROUTES.DASHBOARD}>
          <IonIcon aria-hidden='true' icon={peopleOutline} />
          <IonLabel>Customers</IonLabel>
        </IonTabButton>

        <IonTabButton tab='manage' href={ROUTES.SETTINGS}>
          <IonIcon aria-hidden='true' icon={ellipsisHorizontalOutline} />
          <IonLabel>Manage</IonLabel>
        </IonTabButton>
      </IonTabBar>
    </IonTabs>
  );
};

const AppRoutes: React.FC = () => {
  const { isAuthenticated, authStateLoading, user } = useAuth();
  const [authState, setAuthState] = useState<AuthState>({
    isInitialized: false,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        if (isAuthenticated) {
          console.debug('Fetched role:', user?.role);

          setAuthState({
            isInitialized: true,
            isLoading: false,
            error: null,
          });
        } else {
          setAuthState((prev) => ({
            ...prev,
            isInitialized: true,
            isLoading: false,
          }));
        }
      } catch (error) {
        console.error('Failed to get user role:', error);
        setAuthState((prev) => ({
          ...prev,
          error: error as Error,
          isLoading: false,
        }));
      }
    };

    if (!authStateLoading) {
      initializeAuth();
    }
  }, [isAuthenticated, authStateLoading, user]);

  /*
  if (authStateLoading || (!authState.isInitialized && authState.isLoading)) {
    return <IonLoading isOpen={true} message='Loading...' />;
  }
  */
  return (
    <IonReactRouter>
      <IonRouterOutlet id='main'>
        <Switch>
          {/* Root route - redirect based on auth status */}
          <Route
            path={ROUTES.ROOT}
            render={() => {
              return isAuthenticated ? (
                <Redirect to={ROUTES.SPENDING} />
              ) : (
                <Redirect to={ROUTES.SIGNIN} />
              );
            }}
            exact={true}
          />

          {/* Public routes */}
          <Route
            path={ROUTES.SIGNIN}
            render={() => {
              return !isAuthenticated ? <SigninPage /> : <Redirect to={ROUTES.ROOT} />;
            }}
            exact={true}
          />
          <Route
            path={ROUTES.SIGNUP}
            render={() => {
              return !isAuthenticated ? <SignupPage /> : <Redirect to={ROUTES.ROOT} />;
            }}
            exact={true}
          />

          {/* Protected routes */}
          <ProtectedRoute path={ROUTES.PROFILE}>
            <ProfileRoutes />
          </ProtectedRoute>

          <ProtectedRoute path={ROUTES.SPENDING}>
            <SpendingRoutes userId={user?.uid ?? ''} />
          </ProtectedRoute>

          <Route path={ROUTES.ROOT} exact={true}>
            <Redirect to={ROUTES.SPENDING} />
          </Route>

          {/* Catch all - redirect to appropriate route */}
          <Route
            path={ROUTES.NOT_FOUND}
            render={() => {
              return isAuthenticated ? (
                <Redirect to={ROUTES.SPENDING} />
              ) : (
                <Redirect to={ROUTES.SIGNIN} />
              );
            }}
          />
        </Switch>
      </IonRouterOutlet>
    </IonReactRouter>
  );
};

export default AppRoutes;
