import { useState, useEffect } from 'react';
import { Header } from './components/Header/Header';
import { ServiceOrderList } from './components/ServiceOrderList/ServiceOrderList';
import { ServiceOrderDetail } from './components/ServiceOrderDetail/ServiceOrderDetail';
import { Reports } from './components/Reports/Reports';
import { Login } from './components/Login/Login'; // Importando a nova tela
import './App.css';

function App() {
  // Estado de Autenticação inicializado verificando o localStorage
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('@GZCentroAuto:isAuth') === 'true';
  });

  const [currentView, setCurrentView] = useState<'list' | 'detail' | 'reports'>('list');
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);

  // Função chamada quando o login dá certo
  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    localStorage.setItem('@GZCentroAuto:isAuth', 'true');
  };


  const handleOrderClick = (id: number) => {
    setSelectedOrderId(id);
    setCurrentView('detail');
  };

  const handleBackToList = () => {
    setSelectedOrderId(null);
    setCurrentView('list');
  };

  // Se não estiver logado, renderiza apenas a tela de Login
  if (!isAuthenticated) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  // Se estiver logado, renderiza a aplicação normalmente
  return (
    <div className="app-layout">
      <div className="no-print">
        <Header 
          currentView={currentView} 
          onViewChange={(view) => setCurrentView(view)} 
        />
      </div>
      
      <main className="main-content">
        {currentView === 'list' && (
          <ServiceOrderList onOrderClick={handleOrderClick} />
        )}
        
        {currentView === 'detail' && selectedOrderId && (
          <ServiceOrderDetail orderId={selectedOrderId} onBack={handleBackToList} />
        )}

        {currentView === 'reports' && (
          <Reports onOrderClick={handleOrderClick} />
        )}
      </main>
    </div>
  );
}

export default App;