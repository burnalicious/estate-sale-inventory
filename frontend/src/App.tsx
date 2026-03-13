import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import SalesListPage from './pages/SalesListPage';
import SaleDetailPage from './pages/SaleDetailPage';
import SaleFormPage from './pages/SaleFormPage';
import ItemFormPage from './pages/ItemFormPage';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <header className="app-header">
        <Link to="/">Estate Sale Inventory</Link>
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
