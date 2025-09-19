import React, { useState, useEffect } from 'react';
import { getProducts, createProduct, updateProduct, deleteProduct } from '../api/products';
import { useAuth } from '../context/AuthContext';

const AdminProductsPage = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    investmentType: 'bond',
    tenureMonths: '',
    annualYield: '',
    riskLevel: 'low',
    minInvestment: '',
    maxInvestment: '',
    description: '',
  });

  useEffect(() => {
    if (user && user.isAdmin) {
      fetchProducts();
    } else if (user) {
      setError('You are not authorized to view this page.');
      setLoading(false);
    } else {
      setError('Please log in.');
      setLoading(false);
    }
  }, [user]);

  const fetchProducts = async () => {
    try {
      const res = await getProducts();
      setProducts(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleOpenModal = (product = null) => {
    setCurrentProduct(product);
    if (product) {
      setFormData({
        name: product.name,
        investmentType: product.investmentType,
        tenureMonths: product.tenureMonths,
        annualYield: product.annualYield,
        riskLevel: product.riskLevel,
        minInvestment: product.minInvestment,
        maxInvestment: product.maxInvestment || '',
        description: product.description || '',
      });
    } else {
      setFormData({
        name: '',
        investmentType: 'bond',
        tenureMonths: '',
        annualYield: '',
        riskLevel: 'low',
        minInvestment: '',
        maxInvestment: '',
        description: '',
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentProduct(null);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (currentProduct) {
        await updateProduct(currentProduct.id, formData);
      } else {
        await createProduct(formData);
      }
      fetchProducts();
      handleCloseModal();
    } catch (err) {
      setError(err.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await deleteProduct(id);
        fetchProducts();
      } catch (err) {
        setError(err.response?.data?.message || 'Deletion failed');
      }
    }
  };

  if (loading) return <div className="text-center text-lg">Loading...</div>;
  if (error) return <div className="text-center text-red-500 text-lg">Error: {error}</div>;
  if (!user || !user.isAdmin) return <div className="text-center text-red-500 text-lg">Access Denied.</div>;

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-3xl font-bold mb-6 text-center">Admin Product Management</h2>
      <div className="flex justify-end mb-4">
        <button
          onClick={() => handleOpenModal()}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Add New Product
        </button>
      </div>

      <div className="overflow-x-auto bg-white rounded-lg shadow-md p-6">
        <table className="min-w-full bg-white">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b text-left">Name</th>
              <th className="py-2 px-4 border-b text-left">Type</th>
              <th className="py-2 px-4 border-b text-left">Yield</th>
              <th className="py-2 px-4 border-b text-left">Risk</th>
              <th className="py-2 px-4 border-b text-left">Min Inv.</th>
              <th className="py-2 px-4 border-b text-left">Max Inv.</th>
              <th className="py-2 px-4 border-b text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id}>
                <td className="py-2 px-4 border-b">{product.name}</td>
                <td className="py-2 px-4 border-b">{product.investmentType}</td>
                <td className="py-2 px-4 border-b">{product.annualYield}%</td>
                <td className="py-2 px-4 border-b">{product.riskLevel}</td>
                <td className="py-2 px-4 border-b">${product.minInvestment}</td>
                <td className="py-2 px-4 border-b">{product.maxInvestment ? `$${product.maxInvestment}` : 'N/A'}</td>
                <td className="py-2 px-4 border-b">
                  <button
                    onClick={() => handleOpenModal(product)}
                    className="bg-yellow-500 hover:bg-yellow-700 text-white px-3 py-1 rounded mr-2"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(product.id)}
                    className="bg-red-500 hover:bg-red-700 text-white px-3 py-1 rounded"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center">
          <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-lg">
            <h3 className="text-2xl font-bold mb-4">{currentProduct ? 'Edit Product' : 'Add New Product'}</h3>
            {error && <p className="text-red-500 mb-4">{error}</p>}
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">Name</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} className="shadow border rounded w-full py-2 px-3" required />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">Investment Type</label>
                <select name="investmentType" value={formData.investmentType} onChange={handleChange} className="shadow border rounded w-full py-2 px-3">
                  <option value="bond">Bond</option>
                  <option value="fd">FD</option>
                  <option value="mf">MF</option>
                  <option value="etf">ETF</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">Tenure (Months)</label>
                <input type="number" name="tenureMonths" value={formData.tenureMonths} onChange={handleChange} className="shadow border rounded w-full py-2 px-3" required />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">Annual Yield (%)</label>
                <input type="number" name="annualYield" value={formData.annualYield} onChange={handleChange} step="0.01" className="shadow border rounded w-full py-2 px-3" required />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">Risk Level</label>
                <select name="riskLevel" value={formData.riskLevel} onChange={handleChange} className="shadow border rounded w-full py-2 px-3">
                  <option value="low">Low</option>
                  <option value="moderate">Moderate</option>
                  <option value="high">High</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">Min Investment</label>
                <input type="number" name="minInvestment" value={formData.minInvestment} onChange={handleChange} step="0.01" className="shadow border rounded w-full py-2 px-3" />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">Max Investment</label>
                <input type="number" name="maxInvestment" value={formData.maxInvestment} onChange={handleChange} step="0.01" className="shadow border rounded w-full py-2 px-3" />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">Description</label>
                <textarea name="description" value={formData.description} onChange={handleChange} className="shadow border rounded w-full py-2 px-3" rows="3"></textarea>
              </div>
              <div className="flex justify-end">
                <button type="button" onClick={handleCloseModal} className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded mr-2">
                  Cancel
                </button>
                <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                  {currentProduct ? 'Update Product' : 'Add Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProductsPage;
