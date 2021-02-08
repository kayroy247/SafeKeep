import { BrowserRouter as Router, Route, Switch, useLocation } from 'react-router-dom';
import Nav from './components/Nav';
import Index from './components/Index';
import AboutUs from './components/About';
import Roadmap from './components/Roadmap';
import Dashboard from './components/Dashboard';
import Admin from './components/Admin';
// import ProtectedRoute from './components/ProtectedRoute';

function AppContainer() {
  const location = useLocation();
  const NoAuthRoutes = ['/dashboard', '/admin']

  return (
    <>
      {!NoAuthRoutes.includes(location.pathname) ? <Nav /> : ''}
      <Switch>
        <Route path="/" exact component={Index} />
        <Route path="/about-us" component={AboutUs} />
        <Route path="/roadmap" component={Roadmap} />
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/admin" component={Admin} />
      </Switch>
    </>
  );
}

function App() {
  return (
    <div className="app-container">
      <Router>
        <AppContainer />
      </Router>
    </div>
  );
}

export default App;
