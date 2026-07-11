import { Navigate, Route, Routes } from 'react-router-dom';
import './App.css';
import Layout from './components/Layout';
import ProductList from './pages/products/ProductList';
import ProductDetail from './pages/products/ProductDetail';
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

        {/* Chỉ những route ghi dữ liệu (create/edit) mới cần đăng nhập */}
        <Route element={<ProtectedRoute />}>
          <Route path="products/new" element={<div>Coming soon (Task 27)</div>} />
          <Route path="products/:id/edit" element={<div>Coming soon (Task 33)</div>} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
