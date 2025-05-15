import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';

const AdminDashboard = ({ handleLogout }) => {
  const navigate = useNavigate();
  const [visitors, setVisitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchVisitors = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');

      if (!token) {
        toast.error('Unauthorized access. Please login.');
        handleLogout(); 
        navigate('/');
        return;
      }

      const response = await axios.get('http://localhost:5000/api/visitors');
      setVisitors(response.data);
      setError(null);
    } catch (error) {
      console.error('Error fetching visitors:', error);
      setError('Failed to load visitors.');
      toast.error('Failed to load visitors.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVisitors();
    const intervalId = setInterval(fetchVisitors, 30000);
    return () => clearInterval(intervalId);
  }, []);

  const handleExitVisitor = async (visitorId) => {
    if (!window.confirm('Are you sure you want to mark this visitor as exited?')) return;

    try {
      await axios.put(`http://localhost:5000/api/visitors/${visitorId}/exit`);
      await fetchVisitors();
      toast.success('Visitor marked as exited');
    } catch (error) {
      console.error('Error marking visitor exit:', error);
      toast.error('Failed to mark visitor exit');
    }
  };

  const formatDateTime = (dateTimeStr) => {
    try {
      return new Date(dateTimeStr).toLocaleString();
    } catch (error) {
      return dateTimeStr;
    }
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h2>Admin Dashboard</h2>
        <div className="visitor-count">Current Visitors: {visitors.length}</div>
        <button className="btn btn-danger" onClick={handleLogout}>
          Logout
        </button>
      </div>

      <div className="dashboard-actions">
        <button className="btn btn-primary" onClick={fetchVisitors}>
          Refresh List
        </button>
      </div>

      {loading ? (
        <p>Loading visitors...</p>
      ) : error ? (
        <p className="text-danger">{error}</p>
      ) : visitors.length === 0 ? (
        <div className="card">
          <p className="text-center">No visitors currently present.</p>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="dashboard-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Mobile</th>
                <th>Apartment</th>
                <th>Vehicle Type</th>
                <th>Vehicle Number</th>
                <th>Purpose</th>
                <th>Duration</th>
                <th>Visit Time</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {visitors.map(visitor => (
                <tr key={visitor.id}>
                  <td>{visitor.visitorName}</td>
                  <td>{visitor.mobileNumber}</td>
                  <td>{visitor.apartmentNumber}</td>
                  <td>{visitor.vehicleType}</td>
                  <td>{visitor.vehicleNumber || 'N/A'}</td>
                  <td>{visitor.purpose}</td>
                  <td>{visitor.duration}</td>
                  <td>{formatDateTime(visitor.timeOfVisit)}</td>
                  <td>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleExitVisitor(visitor.id)}
                    >
                      Mark Exit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
