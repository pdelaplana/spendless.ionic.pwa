import type React from 'react';
import { Route, Redirect, type RouteProps } from 'react-router-dom';
import { IonLoading } from '@ionic/react';
import { useAuth, type UserRole } from '@/providers/auth';
import { ROUTES } from './routes.constants';

interface IProtectedRouteProps extends RouteProps {
  requiredRoles?: UserRole[];
  fallbackPath?: string;
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<IProtectedRouteProps> = ({
  children,
  requiredRoles = [undefined],
  fallbackPath = ROUTES.SIGNIN,
  ...rest
}) => {
  const { isAuthenticated, authStateLoading } = useAuth();

  console.debug('ProtectedRoute state:', {
    isAuthenticated,
    authStateLoading,
    path: rest.path,
  });

  if (authStateLoading) {
    return <IonLoading isOpen={authStateLoading} />;
  }

  if (!isAuthenticated) {
    console.debug('Not authenticated, redirecting to:', fallbackPath);
    return <Redirect to={fallbackPath} />;
  }

  return (
    <Route
      {...rest}
      render={(props) =>
        isAuthenticated ? (
          children
        ) : (
          <Redirect to={{ pathname: fallbackPath, state: { from: props.location } }} />
        )
      }
    />
  );
};

export default ProtectedRoute;
