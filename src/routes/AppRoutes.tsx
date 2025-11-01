import { SplashScreen } from '@/components/auth';
import AboutPage from '@/pages/about/AboutPage';
import ForgotPasswordPage from '@/pages/auth/forgotPassword/ForgotPasswordPage';
import ResetPasswordPage from '@/pages/auth/resetPassword/ResetPasswordPage';
import SigninPage from '@/pages/auth/signin/SigninPage';
import SignupPage from '@/pages/auth/signup/SignupPage';
import StartPage from '@/pages/auth/start/StartPage';
import FeedbackPage from '@/pages/feedback/FeedbackPage';
import HelpPage from '@/pages/help/HelpPage';
import HomePage from '@/pages/home/HomePage';
import OnboardingFlow from '@/pages/onboarding/OnboardingFlow';
import OnboardingFlowV2 from '@/pages/onboarding/OnboardingFlowV2';
import ProfileInformationPage from '@/pages/profile/ProfileInformationPage';
import ProfilePage from '@/pages/profile/ProfilePage';
import SettingsPage from '@/pages/settings/SettingsPage';
import ScheduledSpendingPage from '@/pages/spending/ScheduledSpendingPage';
import SpendingPage from '@/pages/spending/SpendingPage';
import SpendingPeriodsPage from '@/pages/spending/SpendingPeriodsPage';
import WalletSpendingPage from '@/pages/spending/WalletSpendingPage';
import { useAuth } from '@/providers/auth/useAuth';
import { SpendingAccountProvider } from '@/providers/spendingAccount';
import { WalletProvider } from '@/providers/wallet';
import { IonIcon, IonLabel, IonRouterOutlet, IonTabBar, IonTabButton, IonTabs } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { ellipsisHorizontalOutline, homeOutline, peopleOutline } from 'ionicons/icons';
import type React from 'react';
import { useState } from 'react';
import { Redirect, Route, Switch } from 'react-router';
import ProtectedRoute from './ProtectedRoute';
import { ROUTES } from './routes.constants';

const ProfileRoutes: React.FC = () => {
  return (
    <Switch>
      <ProtectedRoute path={ROUTES.PROFILE} exact={true}>
        <ProfilePage />
      </ProtectedRoute>
      <ProtectedRoute path={`${ROUTES.PROFILE}/info`} exact>
        <ProfileInformationPage />
      </ProtectedRoute>
      <ProtectedRoute path={`${ROUTES.PROFILE}/help`} exact>
        <HelpPage />
      </ProtectedRoute>
      <ProtectedRoute path={`${ROUTES.PROFILE}/about`} exact>
        <AboutPage />
      </ProtectedRoute>
    </Switch>
  );
};

const SpendingRoutes = ({ userId }: { userId: string }) => {
  return (
    <SpendingAccountProvider userId={userId}>
      <WalletProvider>
        <Switch>
          <Route path={ROUTES.SPENDING_WALLET} exact={true}>
            <WalletSpendingPage />
          </Route>
          <Route path={ROUTES.SPENDING_SCHEDULED} exact={true}>
            <ScheduledSpendingPage />
          </Route>
          <Route path={ROUTES.SPENDING_PERIODS} exact={true}>
            <SpendingPeriodsPage />
          </Route>
          <Route path={ROUTES.SPENDING} exact={true}>
            <SpendingPage />
          </Route>
        </Switch>
      </WalletProvider>
    </SpendingAccountProvider>
  );
};

const SettingsRoutes: React.FC<{ userId: string }> = ({ userId }) => {
  return (
    <SpendingAccountProvider userId={userId}>
      <Switch>
        <ProtectedRoute path={ROUTES.SETTINGS} exact={true}>
          <SettingsPage />
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
  const [splashComplete, setSplashComplete] = useState(false);

  // Show splash screen while auth is being determined AND splash hasn't completed
  if (authStateLoading || !splashComplete) {
    return <SplashScreen onReady={() => setSplashComplete(true)} />;
  }
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
                <Redirect to={ROUTES.START} />
              );
            }}
            exact={true}
          />

          {/* Public routes */}
          <Route
            path={ROUTES.START}
            render={() => {
              return !isAuthenticated ? <StartPage /> : <Redirect to={ROUTES.SPENDING} />;
            }}
            exact={true}
          />
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
          <Route
            path={ROUTES.FORGOTPASSWORD}
            render={() => {
              return !isAuthenticated ? <ForgotPasswordPage /> : <Redirect to={ROUTES.ROOT} />;
            }}
            exact={true}
          />
          <Route
            path={ROUTES.RESETPASSWORD}
            render={() => {
              return !isAuthenticated ? <ResetPasswordPage /> : <Redirect to={ROUTES.ROOT} />;
            }}
            exact={true}
          />

          {/* Onboarding routes - require authentication */}
          <ProtectedRoute path={ROUTES.ONBOARDING} exact={true}>
            <SpendingAccountProvider userId={user?.uid ?? ''}>
              <OnboardingFlow />
            </SpendingAccountProvider>
          </ProtectedRoute>

          <ProtectedRoute path={ROUTES.ONBOARDING_V2} exact={true}>
            <SpendingAccountProvider userId={user?.uid ?? ''}>
              <OnboardingFlowV2 />
            </SpendingAccountProvider>
          </ProtectedRoute>

          {/* Protected routes */}
          <ProtectedRoute path={ROUTES.PROFILE}>
            <ProfileRoutes />
          </ProtectedRoute>

          <ProtectedRoute path={ROUTES.FEEDBACK} exact={true}>
            <FeedbackPage />
          </ProtectedRoute>

          <ProtectedRoute path={ROUTES.SETTINGS}>
            <SettingsRoutes userId={user?.uid ?? ''} />
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
                <Redirect to={ROUTES.START} />
              );
            }}
          />
        </Switch>
      </IonRouterOutlet>
    </IonReactRouter>
  );
};

export default AppRoutes;
