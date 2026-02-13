import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Layout } from './components/Layout';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ListsPage } from './pages/ListsPage';
import { ItemsPage } from './pages/ItemsPage';
import { WebSocketProvider } from './contexts/WebSocketContext';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <WebSocketProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          <Route
            path="/lists"
            element={
              <ProtectedRoute>
                <Layout>
                  <ListsPage />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/lists/:listId/items"
            element={
              <ProtectedRoute>
                <Layout>
                  <ItemsPage />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route path="/" element={<Navigate to="/lists" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
      </WebSocketProvider>
    </AuthProvider>
  );
}

export default App;