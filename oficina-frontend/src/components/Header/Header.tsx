
import { Wrench } from 'lucide-react';
import './Header.css';

export function Header() {
  return (
    <header className="header">
      <div className="header-logo">
        <Wrench size={28} className="icon" />
        <h1>Oficina System</h1>
      </div>
      <nav className="header-nav">
        <button className="nav-btn active">Ordens de Serviço</button>
        <button className="nav-btn">Clientes</button>
        <button className="nav-btn">Veículos</button>
      </nav>
    </header>
  );
}