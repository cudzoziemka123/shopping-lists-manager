import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Layout.css';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="layout">
      <header className="header">
        <div className="container">
          <div className="header-content">
            <h1 className="logo">Cписки покупок</h1>
            {isAuthenticated && (
              <div className="header-actions">
                <span className="user-email">{user?.email}</span>
                <button onClick={handleLogout} className="btn btn-secondary">
                  Выйти
                </button>
              </div>
            )}
          </div>
        </div>
      </header>
      <main className="main">
        <div className="container">{children}</div>
      </main>
    </div>
  );
};