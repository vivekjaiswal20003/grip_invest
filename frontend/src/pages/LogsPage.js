import React, { useState, useEffect, useCallback } from 'react';
import { getLogs } from '../api/logs';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

// Helper function to safely format dates
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    return 'Invalid Date';
  }
  return date.toLocaleString();
};

// A simple loading spinner component
const Spinner = () => (
  <div className="flex justify-center items-center p-8">
    <div className="w-16 h-16 border-4 border-blue-500 border-dashed rounded-full animate-spin"></div>
  </div>
);

const LogsPage = () => {
  const { user } = useAuth();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterUserId, setFilterUserId] = useState('');
  const [filterEmail, setFilterEmail] = useState('');

  const fetchLogs = useCallback(async (filters) => {
    setLoading(true);
    try {
      const params = {};
      if (filters && filters.userId) params.userId = filters.userId;
      if (filters && filters.email) params.email = filters.email;

      const res = await getLogs(params);
      setLogs(res.data);
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch logs';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user && user.isAdmin) {
      fetchLogs();
    } else if (user) {
      toast.error('You are not authorized to view this page.');
      setLoading(false);
    } else {
      toast.error('Please log in.');
      setLoading(false);
    }
  }, [user, fetchLogs]);

  const handleFilterSubmit = () => {
    fetchLogs({ userId: filterUserId, email: filterEmail });
  };

  if (!user || !user.isAdmin) {
    return <div className="text-center text-red-500 text-lg">Access Denied.</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-3xl font-bold mb-6 text-center">Transaction Logs</h2>

      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h3 className="text-xl font-semibold mb-4">Filter Logs</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="filterUserId">
              Filter by User ID
            </label>
            <input
              type="text"
              id="filterUserId"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Enter User ID"
              value={filterUserId}
              onChange={(e) => setFilterUserId(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="filterEmail">
              Filter by Email
            </label>
            <input
              type="email"
              id="filterEmail"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Enter Email"
              value={filterEmail}
              onChange={(e) => setFilterEmail(e.target.value)}
            />
          </div>
        </div>
        <div className="flex justify-end mt-4">
          <button
            onClick={handleFilterSubmit}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Apply Filters
          </button>
        </div>
      </div>

      {loading ? (
        <Spinner />
      ) : (
        <div className="overflow-x-auto bg-white rounded-lg shadow-md p-6">
          <table className="min-w-full bg-white">
            <thead>
              <tr>
                <th className="py-2 px-4 border-b text-left">Timestamp</th>
                <th className="py-2 px-4 border-b text-left">Method</th>
                <th className="py-2 px-4 border-b text-left">Endpoint</th>
                <th className="py-2 px-4 border-b text-left">Status</th>
                <th className="py-2 px-4 border-b text-left">User Email</th>
                <th className="py-2 px-4 border-b text-left">Error Summary</th>
              </tr>
            </thead>
            <tbody>
              {logs.length > 0 ? (
                logs.map((log) => (
                  <tr key={log.id}>
                    <td className="py-2 px-4 border-b">{formatDate(log.createdAt)}</td>
                    <td className="py-2 px-4 border-b">{log.httpMethod}</td>
                    <td className="py-2 px-4 border-b">{log.endpoint}</td>
                    <td className="py-2 px-4 border-b">{log.statusCode}</td>
                    <td className="py-2 px-4 border-b">{log.email || 'N/A'}</td>
                    <td className="py-2 px-4 border-b">
                      {log.errorMessage ? (
                        <span className="text-red-600">
                          {log.aiSummary || log.errorMessage}
                        </span>
                      ) : (
                        '-'
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center py-4">
                    No logs found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default LogsPage;