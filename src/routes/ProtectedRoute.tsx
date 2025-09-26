import { type UserRole, useAuth } from '@/providers/auth';
import { IonLoading } from '@ionic/react';
import type React from 'react';
import { Redirect, Route, type RouteProps } from 'react-router-dom';
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

  // Show loading while auth state is being determined
  if (authStateLoading) {
    return <IonLoading isOpen={authStateLoading} />;
  }

  // Check if the user is authenticated and has the required roles
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
