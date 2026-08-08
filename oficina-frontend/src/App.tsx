import { useState } from 'react';
import { Header } from './components/Header/Header';
import { ServiceOrderList } from './components/ServiceOrderList/ServiceOrderList';
import { ServiceOrderDetail } from './components/ServiceOrderDetail/ServiceOrderDetail'; // Importe o novo componente
import './App.css';

function App() {
  // Estado para controlar qual tela exibir e qual OS foi selecionada
  const [currentView, setCurrentView] = useState<'list' | 'detail'>('list');
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
      {/* O Header recebe uma classe que será oculta na impressão */}
      <div className="no-print">
        <Header />
      </div>
      
      <main className="main-content">
        {currentView === 'list' ? (
          <ServiceOrderList onOrderClick={handleOrderClick} />
        ) : (
          selectedOrderId && <ServiceOrderDetail orderId={selectedOrderId} onBack={handleBackToList} />
        )}
      </main>
    </div>
  );
}

export default App;