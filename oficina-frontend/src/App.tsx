import { Header } from './components/Header/Header';
import { ServiceOrderList } from './components/ServiceOrderList/ServiceOrderList';
import './App.css';

function App() {
  return (
    <div className="app-layout">
      <Header />
      <main className="main-content">
        <ServiceOrderList />
      </main>
    </div>
  );
}

export default App;