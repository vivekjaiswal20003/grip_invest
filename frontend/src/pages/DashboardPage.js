import React, { useState, useEffect } from 'react';
import API from '../api/axios';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

const DashboardPage = () => {
  const [portfolio, setPortfolio] = useState(null);
  const [riskSummary, setRiskSummary] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPortfolioData = async () => {
      try {
        const portfolioRes = await API.get('/investments');
        setPortfolio(portfolioRes.data);

        const summaryRes = await API.get('/investments/summary');
        setRiskSummary(summaryRes.data.summary);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch portfolio data');
      } finally {
        setLoading(false);
      }
    };

    fetchPortfolioData();
  }, []);

  if (loading) return <div className="text-center text-lg">Loading dashboard...</div>;
  if (error) return <div className="text-center text-red-500 text-lg">Error: {error}</div>;
  if (!portfolio) return <div className="text-center text-lg">No portfolio data available.</div>;

  const investmentTypes = {};
  portfolio.investments.forEach(inv => {
    const type = inv.product.investmentType;
    investmentTypes[type] = (investmentTypes[type] || 0) + parseFloat(inv.amount);
  });

  const chartData = {
    labels: Object.keys(investmentTypes),
    datasets: [
      {
        data: Object.values(investmentTypes),
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(153, 102, 255, 0.6)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-3xl font-bold mb-6 text-center">Your Dashboard</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-4">Portfolio Summary</h3>
          <p className="text-gray-700 mb-2"><strong>Total Invested:</strong> ${portfolio.totalInvested.toFixed(2)}</p>
          <p className="text-gray-700 mb-2"><strong>Total Expected Return:</strong> ${portfolio.totalExpectedReturn.toFixed(2)}</p>
          <p className="text-gray-700 mb-2"><strong>Number of Investments:</strong> {portfolio.numberOfInvestments}</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-4">Investment Distribution</h3>
          <div className="w-full max-w-sm mx-auto">
            <Pie data={chartData} />
          </div>
        </div>
      </div>

      {riskSummary && (
        <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 mb-6" role="alert">
          <p className="font-bold">AI Portfolio Risk Summary:</p>
          <p>{riskSummary}</p>
        </div>
      )}

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold mb-4">Your Investments</h3>
        {portfolio.investments.length === 0 ? (
          <p>You have no investments yet. Explore products to get started!</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead>
                <tr>
                  <th className="py-2 px-4 border-b text-left">Product</th>
                  <th className="py-2 px-4 border-b text-left">Type</th>
                  <th className="py-2 px-4 border-b text-left">Amount</th>
                  <th className="py-2 px-4 border-b text-left">Expected Return</th>
                  <th className="py-2 px-4 border-b text-left">Maturity Date</th>
                  <th className="py-2 px-4 border-b text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {portfolio.investments.map((inv) => (
                  <tr key={inv.id}>
                    <td className="py-2 px-4 border-b">{inv.product.name}</td>
                    <td className="py-2 px-4 border-b">{inv.product.investmentType}</td>
                    <td className="py-2 px-4 border-b">${parseFloat(inv.amount).toFixed(2)}</td>
                    <td className="py-2 px-4 border-b">${parseFloat(inv.expectedReturn).toFixed(2)}</td>
                    <td className="py-2 px-4 border-b">{new Date(inv.maturityDate).toLocaleDateString()}</td>
                    <td className="py-2 px-4 border-b">{inv.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
