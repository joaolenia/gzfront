import { useState, useEffect, useMemo } from 'react';
import { FileText, Plus, Search, Filter, Loader2 } from 'lucide-react';
import { ServiceOrderForm } from '../ServiceOrderForm/ServiceOrderForm';
import { api } from '../../services/api'; // Importa a configuração do axios
import './ServiceOrderList.css';

interface ServiceOrderListProps {
  onOrderClick: (id: number) => void;
}

export function ServiceOrderList({ onOrderClick }: ServiceOrderListProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('Todos');
  
  // Estados para os dados reais e carregamento
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Função para buscar as OSs no backend
  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/os');
      setOrders(response.data);
    } catch (error) {
      console.error('Erro ao buscar ordens de serviço:', error);
      alert('Erro ao carregar a lista de ordens de serviço.');
    } finally {
      setIsLoading(false);
    }
  };

  // Busca os dados ao montar o componente
  useEffect(() => {
    fetchOrders();
  }, []);

  // Filtro dinâmico das ordens de serviço
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const searchLower = searchTerm.toLowerCase();
      // Como o veículo ou cliente podem vir vazios do backend inicialmente, adicionamos fallback (|| '')
      const clientMatch = (order.clientName || '').toLowerCase().includes(searchLower);
      const vehicleMatch = (order.vehicleName || '').toLowerCase().includes(searchLower);
      const idMatch = order.id.toString().includes(searchLower);
      
      const matchesSearch = clientMatch || vehicleMatch || idMatch;
      const matchesStatus = statusFilter === 'Todos' || order.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [searchTerm, statusFilter, orders]);

  // Função para calcular o total de uma OS (Mão de obra + Peças)
  const calculateTotal = (order: any) => {
    const partsTotal = (order.parts || []).reduce((acc: number, p: any) => acc + (p.qty * p.price - (p.discount || 0)), 0);
    const servicesTotal = (order.services || []).reduce((acc: number, s: any) => acc + (s.qty * s.price - (s.discount || 0)), 0);
    return partsTotal + servicesTotal;
  };

  const calculateLabor = (order: any) => {
    return (order.services || []).reduce((acc: number, s: any) => acc + (s.qty * s.price - (s.discount || 0)), 0);
  };

  return (
    <div className="os-container">
      <div className="sticky-header">
        <div className="os-header">
          <h2>Ordens de Serviço</h2>
          <button className="btn-primary" onClick={() => setIsFormOpen(true)}>
            <Plus size={20} />
            Nova OS
          </button>
        </div>

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

      {isLoading ? (
        <div className="loading-state flex flex-col items-center justify-center py-20 text-gray-500">
           <Loader2 size={40} className="animate-spin mb-4 text-blue-600" />
           <p>Carregando ordens de serviço...</p>
        </div>
      ) : (
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
                  <span className={`os-status status-${(order.status || 'pendente').toLowerCase().replace(' ', '-')}`}>
                    {order.status || 'Pendente'}
                  </span>
                </div>
                
                <div className="os-card-body">
                  <p><strong>Cliente:</strong> {order.clientName || 'Não informado'}</p>
                  <p><strong>Veículo:</strong> {order.vehicleName || 'Não informado'}</p>
                  <div className="os-service-box">
                    <FileText size={16} className="text-gray-400" />
                    <span className="truncate">{order.clientRequest || 'Sem descrição'}</span>
                  </div>
                </div>

                <div className="os-card-footer">
                  <div className="os-values">
                    <span className="labor">Mão de obra: R$ {calculateLabor(order).toFixed(2)}</span>
                    <span className="total">Total: R$ {calculateTotal(order).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="empty-state">
              <p>Nenhuma ordem de serviço encontrada.</p>
            </div>
          )}
        </div>
      )}

      {/* Ao fechar o form com sucesso, recarrega a lista */}
      {isFormOpen && (
        <ServiceOrderForm 
          onClose={() => setIsFormOpen(false)} 
          onSuccess={fetchOrders} 
        />
      )}
    </div>
  );
}