import { Wrench } from 'lucide-react';
import './Header.css';

interface HeaderProps {
  currentView: string;
  onViewChange: (view: 'list' | 'reports') => void;
}

export function Header({ currentView, onViewChange }: HeaderProps) {
  return (
    <header className="header">
      <div className="header-logo">
        <Wrench size={28} className="icon" />
        <h1>Gz Centro Automotivo</h1>
      </div>
      <nav className="header-nav">
        <button 
          className={`nav-btn ${(currentView === 'list' || currentView === 'detail') ? 'active' : ''}`}
          onClick={() => onViewChange('list')}
        >
          Ordens de Serviço
        </button>
        <button 
          className={`nav-btn ${currentView === 'reports' ? 'active' : ''}`}
          onClick={() => onViewChange('reports')}
        >
          Relatórios
        </button>
      </nav>
    </header>
  );
}