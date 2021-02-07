import { Route, Redirect } from "react-router-dom";
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ component: Component, location, ...rest }) => {
  const { token, loading } = useAuth();

  if (loading) {
    return (
      <Route
        {...rest}
        render={() => {
          return <p>Loading...</p>;
        }}
      />
    );
  }

  return (
    <Route {...rest}
      render={props => (
        (token) ?
          <Component {...props} token={token} />
          :
          <Redirect to={{ pathname: "/", state: location }} />
      )}
    />
  )
}

export default ProtectedRoute;