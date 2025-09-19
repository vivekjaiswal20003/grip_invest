import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../api/axios';

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    console.log('ProductDetailPage received ID:', id);
    const fetchProduct = async () => {
      try {
        const res = await API.get(`/products/${id}`);
        setProduct(res.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch product details');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleInvest = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await API.post('/investments', { productId: id, amount: parseFloat(amount) });
      setSuccess('Investment successful!');
      setAmount(''); // Clear amount field
      // Optionally redirect or update dashboard
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Investment failed');
    }
  };

  if (loading) return <div className="text-center text-lg">Loading product details...</div>;
  if (error) return <div className="text-center text-red-500 text-lg">Error: {error}</div>;
  if (!product) return <div className="text-center text-lg">Product not found.</div>;

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-3xl font-bold mb-6 text-center">{product.name}</h2>
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <p className="text-gray-700 mb-1"><strong>Type:</strong> {product.investmentType}</p>
        <p className="text-gray-700 mb-1"><strong>Yield:</strong> {product.annualYield}%</p>
        <p className="text-gray-700 mb-1"><strong>Risk:</strong> {product.riskLevel}</p>
        <p className="text-gray-700 mb-1"><strong>Tenure:</strong> {product.tenureMonths} months</p>
        <p className="text-gray-700 mb-1"><strong>Min Investment:</strong> ${product.minInvestment}</p>
        <p className="text-gray-700 mb-1"><strong>Max Investment:</strong> {product.maxInvestment ? `$${product.maxInvestment}` : 'No Max'}</p>
        <p className="text-gray-700 text-sm mt-4">{product.description}</p>
      </div>

      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md mx-auto">
        <h3 className="text-2xl font-bold text-center mb-6">Invest in {product.name}</h3>
        {success && <p className="text-green-500 text-center mb-4">{success}</p>}
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        <form onSubmit={handleInvest}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="amount">
              Investment Amount
            </label>
            <input
              type="number"
              id="amount"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Enter amount to invest"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min={product.minInvestment || 0}
              max={product.maxInvestment || undefined}
              step="0.01"
              required
            />
          </div>
          <div className="flex items-center justify-between">
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Confirm Investment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductDetailPage;
