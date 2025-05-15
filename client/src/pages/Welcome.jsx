import { Link } from 'react-router-dom';

const Welcome = () => {
  return (
    <div className="welcome-container">
      <h1 className="welcome-title">Visitor Entry Tracking System</h1>
      <p className="welcome-subtitle">
        Welcome to our visitor management system. Please select an option below.
      </p>

      <div className="welcome-buttons">
        <Link to="/visitor-signup" className="btn welcome-button">
          Visitor Sign Up
        </Link>
        <Link to="/admin-login" className="btn welcome-button">
          Admin Login
        </Link>
      </div>

      <div className="mt-3">
        <Link to="/visitor-exit" className="btn btn-danger welcome-button">
          Exit as Visitor
        </Link>
      </div>
    </div>
  );
};

export default Welcome;
