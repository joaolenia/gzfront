import { useState, useEffect, useMemo } from 'react';
import { FileText, Plus, Search, Filter, Loader2, Trash2, AlertTriangle, X } from 'lucide-react';
import { ServiceOrderForm } from '../ServiceOrderForm/ServiceOrderForm';
import { api } from '../../services/api';
import './ServiceOrderList.css';

interface ServiceOrderListProps {
  onOrderClick: (id: number) => void;
}

export function ServiceOrderList({ onOrderClick }: ServiceOrderListProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('Todos');
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Estado para controlar o modal de exclusão
  const [orderToDelete, setOrderToDelete] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

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

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleDelete = async () => {
    if (!orderToDelete) return;
    
    setIsDeleting(true);
    try {
      await api.delete(`/os/${orderToDelete}`);
      setOrders(orders.filter(order => order.id !== orderToDelete));
      setOrderToDelete(null); // Fecha o modal
    } catch (error) {
      console.error('Erro ao excluir OS:', error);
      alert('Erro ao tentar excluir a Ordem de Serviço.');
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const searchLower = searchTerm.toLowerCase();
      const clientMatch = (order.clientName || '').toLowerCase().includes(searchLower);
      const vehicleMatch = (order.vehicleName || '').toLowerCase().includes(searchLower);
      const idMatch = order.id.toString().includes(searchLower);
      
      const matchesSearch = clientMatch || vehicleMatch || idMatch;
      const matchesStatus = statusFilter === 'Todos' || order.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [searchTerm, statusFilter, orders]);

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
                  <div className="os-card-title-group">
                    <span className="os-number">OS #{order.id}</span>
                    <span className={`os-status status-${(order.status || 'pendente').toLowerCase().replace(' ', '-')}`}>
                      {order.status || 'Pendente'}
                    </span>
                  </div>
                  {/* Botão de excluir que impede a propagação do clique para o card inteiro */}
                  <button 
                    className="btn-delete-card" 
                    onClick={(e) => {
                      e.stopPropagation();
                      setOrderToDelete(order.id);
                    }}
                    title="Excluir Ordem de Serviço"
                  >
                    <Trash2 size={18} />
                  </button>
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

      {/* Modal de Confirmação de Exclusão */}
      {orderToDelete !== null && (
        <div className="delete-modal-overlay">
          <div className="delete-modal-content">
            <div className="delete-modal-icon">
              <AlertTriangle size={32} />
            </div>
            <h3>Excluir Ordem de Serviço?</h3>
            <p>Você tem certeza que deseja excluir a OS <strong>#{orderToDelete}</strong>? Esta ação não pode ser desfeita.</p>
            <div className="delete-modal-actions">
              <button 
                className="btn-delete-cancel" 
                onClick={() => setOrderToDelete(null)}
                disabled={isDeleting}
              >
                Cancelar
              </button>
              <button 
                className="btn-delete-confirm" 
                onClick={handleDelete}
                disabled={isDeleting}
              >
                {isDeleting ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
                {isDeleting ? 'Excluindo...' : 'Sim, excluir'}
              </button>
            </div>
            <button className="delete-modal-close" onClick={() => setOrderToDelete(null)} disabled={isDeleting}>
              <X size={20} />
            </button>
          </div>
        </div>
      )}

      {isFormOpen && (
        <ServiceOrderForm 
          onClose={() => setIsFormOpen(false)} 
          onSuccess={fetchOrders} 
        />
      )}
    </div>
  );
}