import { useState } from 'react';
import { Header } from './components/Header/Header';
import { ServiceOrderList } from './components/ServiceOrderList/ServiceOrderList';
import { ServiceOrderDetail } from './components/ServiceOrderDetail/ServiceOrderDetail';
import { Reports } from './components/Reports/Reports'; // Importação da nova tela
import './App.css';

function App() {
  // Adicionado 'reports' ao estado
  const [currentView, setCurrentView] = useState<'list' | 'detail' | 'reports'>('list');
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);

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
      {/* O Header agora recebe as propriedades de controle */}
      <div className="no-print">
        <Header 
          currentView={currentView} 
          onViewChange={(view) => setCurrentView(view)} 
        />
      </div>
      
      <main className="main-content">
        {/* Renderização condicional melhorada para suportar múltiplas telas */}
        {currentView === 'list' && (
          <ServiceOrderList onOrderClick={handleOrderClick} />
        )}
        
        {currentView === 'detail' && selectedOrderId && (
          <ServiceOrderDetail orderId={selectedOrderId} onBack={handleBackToList} />
        )}

        {currentView === 'reports' && (
          <Reports />
        )}
      </main>
    </div>
  );
}

export default App;