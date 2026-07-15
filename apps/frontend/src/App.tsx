import { Navigate, Route, Routes } from 'react-router-dom';
import './App.css';
import Layout from './components/Layout';
import Dashboard from './pages/dashboard/Dashboard';
import ProductList from './pages/products/ProductList';
import ProductDetail from './pages/products/ProductDetail';
import ProductCreate from './pages/products/ProductCreate';
import { ProductEdit } from './pages/products/ProductEdit';
import InventoryList from './pages/inventory/InventoryList';
import InventoryInbound from './pages/inventory/InventoryInbound';
import InventoryOutbound from './pages/inventory/InventoryOutbound';
import CategoryList from './pages/categories/CategoryList';
import CategoryCreate from './pages/categories/CategoryCreate';
import CategoryEdit from './pages/categories/CategoryEdit';
import TeamList from './pages/team/TeamList';
import RackingPage from './pages/racking/RackingPage';
import TransactionList from './pages/transactions/TransactionList';
import Login from './pages/login/Login';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route path="/" element={<Layout />}>
        <Route index element={<Navigate to="/products" replace />} />
        <Route path="products" element={<ProductList />} />
        <Route path="products/:id" element={<ProductDetail />} />
        <Route path="categories" element={<CategoryList />} />
        <Route path="inventory" element={<InventoryList />} />

        {/* Chỉ những route ghi dữ liệu (create/edit) mới cần đăng nhập */}
        <Route element={<ProtectedRoute />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="products/new" element={<ProductCreate />} />
          <Route path="products/:id/edit" element={<ProductEdit />} />
          <Route path="categories/new" element={<CategoryCreate />} />
          <Route path="categories/:id/edit" element={<CategoryEdit />} />
          <Route path="inventory/inbound" element={<InventoryInbound />} />
          <Route path="inventory/outbound" element={<InventoryOutbound />} />
          <Route path="racking" element={<RackingPage />} />
          <Route path="transactions" element={<TransactionList />} />
          <Route path="team" element={<TeamList />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;