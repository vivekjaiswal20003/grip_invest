import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';

const ProductsPage = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [recommendations, setRecommendations] = useState([]);

  // Filter states
  const [filterType, setFilterType] = useState('');
  const [filterRisk, setFilterRisk] = useState('');
  const [sortYield, setSortYield] = useState('');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await API.get('/products');
        console.log('API response from /products:', res.data);
        setProducts(res.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch products');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleGetRecommendations = async () => {
    if (!user) {
      setError('Please log in to get recommendations.');
      return;
    }
    try {
      const res = await API.get('/products/recommendations');
      setRecommendations(res.data.recommendations);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to get recommendations');
    }
  };

  const filteredAndSortedProducts = products
    .filter(product => {
      const matchType = filterType ? product.investmentType === filterType : true;
      const matchRisk = filterRisk ? product.riskLevel === filterRisk : true;
      return matchType && matchRisk;
    })
    .sort((a, b) => {
      if (!sortYield) return 0;
      const yieldA = parseFloat(a.annualYield);
      const yieldB = parseFloat(b.annualYield);
      return sortYield === 'asc' ? yieldA - yieldB : yieldB - yieldA;
    });

  if (loading) return <div className="text-center text-lg">Loading products...</div>;
  if (error) return <div className="text-center text-red-500 text-lg">Error: {error}</div>;

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-3xl font-bold mb-6 text-center">Investment Products</h2>
      
      <div className="flex justify-center mb-6">
        <button
          onClick={handleGetRecommendations}
          className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          Get AI Recommendations
        </button>
      </div>

      {recommendations.length > 0 && (
        <div className="mb-8">
          <h3 className="text-2xl font-bold text-center mb-4">AI Recommendations For You</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendations.map((rec, index) => (
              <div key={index} className="bg-yellow-100 border-l-4 border-yellow-500 p-4 rounded-lg shadow-md">
                <h4 className="font-bold text-lg text-yellow-800">{rec.productName}</h4>
                <p className="text-yellow-700 mt-2"><strong>Reason:</strong> {rec.reason}</p>
                <p className="text-yellow-700 mt-1"><strong>Yield:</strong> {rec.annualYield}</p>
                {rec.productId && (
                  <Link 
                    to={`/products/${rec.productId}`}
                    className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline inline-block text-center"
                  >
                    View Product
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filter and Sort Controls */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6 flex flex-wrap justify-center gap-4">
        <div>
          <label htmlFor="filterType" className="block text-sm font-medium text-gray-700">Filter by Type</label>
          <select id="filterType" value={filterType} onChange={e => setFilterType(e.target.value)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md">
            <option value="">All Types</option>
            <option value="bond">Bond</option>
            <option value="fd">FD</option>
            <option value="mf">MF</option>
            <option value="etf">ETF</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div>
          <label htmlFor="filterRisk" className="block text-sm font-medium text-gray-700">Filter by Risk</label>
          <select id="filterRisk" value={filterRisk} onChange={e => setFilterRisk(e.target.value)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md">
            <option value="">All Risks</option>
            <option value="low">Low</option>
            <option value="moderate">Moderate</option>
            <option value="high">High</option>
          </select>
        </div>
        <div>
          <label htmlFor="sortYield" className="block text-sm font-medium text-gray-700">Sort by Yield</label>
          <select id="sortYield" value={sortYield} onChange={e => setSortYield(e.target.value)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md">
            <option value="">Default</option>
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAndSortedProducts.map((product) => {
          console.log('Rendering product with ID:', product.id);
          return (
          <div key={product.id} className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold mb-2">{product.name}</h3>
            <p className="text-gray-700 mb-1"><strong>Type:</strong> {product.investmentType}</p>
            <p className="text-gray-700 mb-1"><strong>Yield:</strong> {product.annualYield}%</p>
            <p className="text-gray-700 mb-1"><strong>Risk:</strong> {product.riskLevel}</p>
            <p className="text-gray-700 mb-1"><strong>Tenure:</strong> {product.tenureMonths} months</p>
            <p className="text-gray-700 text-sm mt-2">{product.description}</p>
            <Link
              to={`/products/${product.id}`}
              className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline inline-block text-center"
            >
              Invest Now
            </Link>
          </div>
        )})}
      </div>
    </div>
  );
};


export default ProductsPage;
