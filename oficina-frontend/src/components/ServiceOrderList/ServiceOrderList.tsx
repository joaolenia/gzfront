import { useState, useMemo } from 'react';
import { FileText, Plus, Search, Filter } from 'lucide-react';
import { ServiceOrderForm } from '../ServiceOrderForm/ServiceOrderForm';
import './ServiceOrderList.css';

interface ServiceOrderListProps {
  onOrderClick: (id: number) => void;
}

const mockedOrders = [
  { id: 101, client: "Carlos Souza", vehicle: "Honda Civic 2014", service: "Troca do cilindro mestre e pastilhas", labor: 250.00, total: 450.00, status: "Concluído" },
  { id: 102, client: "ROBSON COSTA DA ROSA", vehicle: "Ford Fiesta S 1.0", service: "Retífica de bloco/cabeçote e juntas", labor: 2000.00, total: 6613.33, status: "Em andamento" },
  { id: 103, client: "Roberto Alves", vehicle: "Yamaha Fazer 250", service: "Troca do kit relação e amortecedores", labor: 180.00, total: 580.00, status: "Pendente" },
  { id: 104, client: "Juliana Costa", vehicle: "Ford Ka 2015", service: "Substituição do servo freio", labor: 300.00, total: 750.00, status: "Em andamento" },
  { id: 105, client: "Fernando Mendes", vehicle: "Honda CG 160 Titan", service: "Troca dos cilindros de bengala", labor: 150.00, total: 380.00, status: "Pendente" },
  { id: 106, client: "Amanda Silva", vehicle: "Chevrolet Tracker 2020", service: "Instalação de kit vidro elétrico", labor: 220.00, total: 620.00, status: "Concluído" },
  { id: 107, client: "Diego Ferreira", vehicle: "Fiat Strada 2021", service: "Revisão geral, troca de óleo", labor: 120.00, total: 350.00, status: "Concluído" }
];

export function ServiceOrderList({ onOrderClick }: ServiceOrderListProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('Todos');

  // Filtro dinâmico das ordens de serviço
  const filteredOrders = useMemo(() => {
    return mockedOrders.filter(order => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = 
        order.client.toLowerCase().includes(searchLower) ||
        order.vehicle.toLowerCase().includes(searchLower) ||
        order.id.toString().includes(searchLower);
      
      const matchesStatus = statusFilter === 'Todos' || order.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [searchTerm, statusFilter]);

  return (
    <div className="os-container">
      
      {/* Cabeçalho Fixo (Sticky) */}
      <div className="sticky-header">
        <div className="os-header">
          <h2>Ordens de Serviço</h2>
          <button className="btn-primary" onClick={() => setIsFormOpen(true)}>
            <Plus size={20} />
            Nova OS
          </button>
        </div>

        {/* Barra de Busca e Filtros */}
        <div className="filters-bar">
          <div className="search-wrapper">
            <Search size={18} className="search-icon" />
            <input 
              type="text" 
              placeholder="Buscar por cliente, veículo ou Nº da OS..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          
          <div className="filter-wrapper">
            <Filter size={18} className="filter-icon" />
            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)}
              className="status-select"
            >
              <option value="Todos">Todos os Status</option>
              <option value="Pendente">Pendente</option>
              <option value="Em andamento">Em andamento</option>
              <option value="Concluído">Concluído</option>
            </select>
          </div>
        </div>
      </div>

      <div className="os-grid">
        {filteredOrders.length > 0 ? (
          filteredOrders.map((order) => (
            <div 
              key={order.id} 
              className="os-card"
              onClick={() => onOrderClick(order.id)}
            >
              <div className="os-card-header">
                <span className="os-number">OS #{order.id}</span>
                <span className={`os-status status-${order.status.toLowerCase().replace(' ', '-')}`}>
                  {order.status}
                </span>
              </div>
              
              <div className="os-card-body">
                <p><strong>Cliente:</strong> {order.client}</p>
                <p><strong>Veículo:</strong> {order.vehicle}</p>
                <div className="os-service-box">
                  <FileText size={16} className="text-gray-400" />
                  <span>{order.service}</span>
                </div>
              </div>

              <div className="os-card-footer">
                <div className="os-values">
                  <span className="labor">Mão de obra: R$ {order.labor.toFixed(2)}</span>
                  <span className="total">Total: R$ {order.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="empty-state">
            <p>Nenhuma ordem de serviço encontrada com esses filtros.</p>
          </div>
        )}
      </div>

      {isFormOpen && (
        <ServiceOrderForm onClose={() => setIsFormOpen(false)} />
      )}
    </div>
  );
}