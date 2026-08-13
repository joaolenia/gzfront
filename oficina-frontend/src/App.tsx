import { useState } from 'react';
import { Header } from './components/Header/Header';
import { ServiceOrderList } from './components/ServiceOrderList/ServiceOrderList';
import { ServiceOrderDetail } from './components/ServiceOrderDetail/ServiceOrderDetail';
import { Reports } from './components/Reports/Reports';
import './App.css';

function App() {
  const [currentView, setCurrentView] = useState<'list' | 'detail' | 'reports'>('list');
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);

  // Função que abre os detalhes da OS (agora usada tanto na Lista quanto nos Relatórios)
  const handleOrderClick = (id: number) => {
    setSelectedOrderId(id);
    setCurrentView('detail');
  };

  const handleBackToList = () => {
    setSelectedOrderId(null);
    setCurrentView('list');
  };

  return (
    <div className="app-layout">
      {/* Header com navegação */}
      <div className="no-print">
        <Header 
          currentView={currentView} 
          onViewChange={(view) => setCurrentView(view)} 
        />
      </div>
      
      <main className="main-content">
        {/* Tela Inicial (Lista de OS) */}
        {currentView === 'list' && (
          <ServiceOrderList onOrderClick={handleOrderClick} />
        )}
        
        {/* Tela de Detalhes / Impressão */}
        {currentView === 'detail' && selectedOrderId && (
          <ServiceOrderDetail orderId={selectedOrderId} onBack={handleBackToList} />
        )}

        {/* Tela de Relatórios e Faturamento */}
        {currentView === 'reports' && (
          // O erro acontecia aqui! Agora a função está sendo passada corretamente:
          <Reports onOrderClick={handleOrderClick} />
        )}
      </main>
    </div>
  );
}

export default App;