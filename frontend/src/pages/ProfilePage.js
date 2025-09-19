import React, { useState, useEffect } from 'react';
import { getProfile, updateProfile } from '../api/user';
import { getProductRecommendations } from '../api/products'; // Re-using the product recommendations API

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [recommendations, setRecommendations] = useState([]);

  // Form state
  const [riskAppetite, setRiskAppetite] = useState('');

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const res = await getProfile();
      setUser(res.data);
      setRiskAppetite(res.data.riskAppetite);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch profile');
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const res = await updateProfile({ riskAppetite });
      setUser(res.data);
      setSuccess('Profile updated successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    }
  };

  const handleGetRecommendations = async () => {
    setError('');
    setRecommendations([]);
    try {
      const res = await getProductRecommendations(); // This API uses the user's token
      setRecommendations(res.data.recommendations);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to get recommendations');
    }
  };

  if (loading) return <div className="text-center text-lg">Loading profile...</div>;
  if (error && !user) return <div className="text-center text-red-500 text-lg">Error: {error}</div>;

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-3xl font-bold mb-6 text-center">Your Profile</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Profile Details and Update Form */}
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h3 className="text-2xl font-bold mb-6">User Details</h3>
          {user && (
            <div className="space-y-4 mb-6">
              <p><strong>First Name:</strong> {user.firstName}</p>
              <p><strong>Last Name:</strong> {user.lastName}</p>
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>Current Balance:</strong> ${user.balance}</p>
            </div>
          )}

          <form onSubmit={handleProfileUpdate}>
            <h4 className="text-xl font-semibold mb-4">Update Your Profile</h4>
            {error && <p className="text-red-500 mb-4">{error}</p>}
            {success && <p className="text-green-500 mb-4">{success}</p>}
            <div className="mb-4">
              <label htmlFor="riskAppetite" className="block text-gray-700 text-sm font-bold mb-2">Risk Appetite</label>
              <select
                id="riskAppetite"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                value={riskAppetite}
                onChange={(e) => setRiskAppetite(e.target.value)}
              >
                <option value="low">Low</option>
                <option value="moderate">Moderate</option>
                <option value="high">High</option>
              </select>
            </div>
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Update Risk Appetite
            </button>
          </form>
        </div>

        {/* AI Recommendations */}
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h3 className="text-2xl font-bold mb-6">AI Recommendations</h3>
          <div className="flex justify-center mb-6">
            <button
              onClick={handleGetRecommendations}
              className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Get Recommendations Based on Your Profile
            </button>
          </div>

          {recommendations.length > 0 ? (
            <div className="space-y-4">
              {recommendations.map((rec, index) => (
                <div key={index} className="bg-yellow-100 border-l-4 border-yellow-500 p-4 rounded-lg">
                  <h4 className="font-bold text-lg text-yellow-800">{rec.productName}</h4>
                  <p className="text-yellow-700 mt-2"><strong>Reason:</strong> {rec.reason}</p>
                  <p className="text-yellow-700 mt-1"><strong>Yield:</strong> {rec.annualYield}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500">Click the button to get personalized AI recommendations.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
