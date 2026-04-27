import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import SalesListPage from './pages/SalesListPage';
import SaleDetailPage from './pages/SaleDetailPage';
import SaleFormPage from './pages/SaleFormPage';
import ItemFormPage from './pages/ItemFormPage';
import LoginBar from './components/LoginBar';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <header className="app-header">
        <div className="app-header-inner">
          <Link to="/" className="app-logo">Estate Sale Inventory</Link>
          <LoginBar />
        </div>
      </header>
      <main className="app-main">
        <Routes>
          <Route path="/" element={<SalesListPage />} />
          <Route path="/sales/new" element={<SaleFormPage />} />
          <Route path="/sales/:saleId/edit" element={<SaleFormPage />} />
          <Route path="/sales/:saleId" element={<SaleDetailPage />} />
          <Route path="/sales/:saleId/items/new" element={<ItemFormPage />} />
          <Route path="/sales/:saleId/items/:itemId/edit" element={<ItemFormPage />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}

export default App;
