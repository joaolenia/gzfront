import { useState, useEffect, useMemo } from 'react';
import { api } from '../../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Calendar, Filter, Wrench, Settings, FileText, Users, Car, Loader2, TrendingUp, Activity } from 'lucide-react';
import './Reports.css';

interface ItemList {
  qty: number;
  price: number;
  discount: number;
}

interface ReportsProps {
  onOrderClick: (id: number) => void;
}

export function Reports({ onOrderClick }: ReportsProps) {
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState('30'); 
  const [grouping, setGrouping] = useState('none'); 

  useEffect(() => {
    const fetchOrders = async () => {
      setIsLoading(true);
      try {
        const response = await api.get('/os');
        setOrders(response.data);
      } catch (error) {
        console.error('Erro ao buscar OS para relatórios:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const calcParts = (parts: ItemList[] = []) => parts.reduce((acc, p) => acc + (Number(p.qty) * Number(p.price) - (Number(p.discount) || 0)), 0);
  const calcLabor = (services: ItemList[] = []) => services.reduce((acc, s) => acc + (Number(s.qty) * Number(s.price) - (Number(s.discount) || 0)), 0);

  const filteredOrders = useMemo(() => {
    if (dateFilter === 'all') return orders;

    const today = new Date();
    const limitDate = new Date(today);
    limitDate.setDate(today.getDate() - parseInt(dateFilter));

    return orders.filter(order => {
      if (!order.deliveryDate) return false; 
      const [year, month, day] = order.deliveryDate.split('-');
      const delivery = new Date(Number(year), Number(month) - 1, Number(day));
      return delivery >= limitDate && delivery <= today;
    });
  }, [orders, dateFilter]);

  const summary = useMemo(() => {
    let totalParts = 0;
    let totalLabor = 0;
    
    filteredOrders.forEach(order => {
      totalParts += calcParts(order.parts);
      totalLabor += calcLabor(order.services);
    });

    return {
      totalParts,
      totalLabor,
      grandTotal: totalParts + totalLabor,
      ordersCount: filteredOrders.length
    };
  }, [filteredOrders]);

  const chartData = useMemo(() => {
    const dataMap: Record<string, any> = {};

    filteredOrders.forEach(order => {
      const dateStr = order.deliveryDate;
      if (!dateStr) return;
      
      const [ month, day] = dateStr.split('-');
      const displayDate = `${day}/${month}`;

      if (!dataMap[dateStr]) {
        dataMap[dateStr] = { date: dateStr, displayDate, 'Mão de Obra': 0, 'Peças': 0 };
      }

      dataMap[dateStr]['Mão de Obra'] += calcLabor(order.services);
      dataMap[dateStr]['Peças'] += calcParts(order.parts);
    });

    return Object.values(dataMap).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [filteredOrders]);

  const groupedOrders = useMemo(() => {
    if (grouping === 'none') return { 'Todas as Ordens': filteredOrders };

    const groups: Record<string, any[]> = {};
    
    filteredOrders.forEach(order => {
      let key = 'Não informado';
      if (grouping === 'cpf' && order.clientCpf) key = order.clientCpf;
      if (grouping === 'placa' && order.vehiclePlate) key = order.vehiclePlate;

      if (!groups[key]) groups[key] = [];
      groups[key].push(order);
    });

    return groups;
  }, [filteredOrders, grouping]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-20 text-gray-500">
         <Loader2 size={40} className="animate-spin mb-4 text-blue-600" />
         <p>Processando relatórios...</p>
      </div>
    );
  }

  return (
    <div className="reports-container">
      <div className="reports-header">
        <div>
          <h2>Insights e Desempenho</h2>
          <p>Acompanhe o faturamento e as métricas da sua oficina.</p>
        </div>
        
        <div className="reports-filters">
          <div className="filter-group">
            <Calendar size={18} />
            <select value={dateFilter} onChange={e => setDateFilter(e.target.value)}>
              <option value="7">Últimos 7 dias</option>
              <option value="15">Últimos 15 dias</option>
              <option value="30">Últimos 30 dias</option>
              <option value="all">Todo o período</option>
            </select>
          </div>
        </div>
      </div>

      {/* CARDS DO DASHBOARD - VISUAL MODERNO */}
      <div className="dashboard-cards">
        <div className="dash-card premium-card">
          <div className="dash-icon-wrapper">
            <div className="dash-icon bg-blue-100 text-blue-600"><TrendingUp size={28} /></div>
          </div>
          <div className="dash-info">
            <span>Faturamento Total</span>
            <h3>R$ {summary.grandTotal.toFixed(2)}</h3>
            <div className="dash-footer text-blue-600">
               <Activity size={14}/> {summary.ordersCount} Ordens concluídas
            </div>
          </div>
        </div>
        
        <div className="dash-card">
          <div className="dash-icon-wrapper">
            <div className="dash-icon bg-indigo-100 text-indigo-600"><Wrench size={24} /></div>
          </div>
          <div className="dash-info">
            <span>Mão de Obra</span>
            <h3>R$ {summary.totalLabor.toFixed(2)}</h3>
            <div className="dash-footer text-gray-400">
               Total em serviços prestados
            </div>
          </div>
        </div>
        
        <div className="dash-card">
          <div className="dash-icon-wrapper">
            <div className="dash-icon bg-emerald-100 text-emerald-600"><Settings size={24} /></div>
          </div>
          <div className="dash-info">
            <span>Peças e Produtos</span>
            <h3>R$ {summary.totalParts.toFixed(2)}</h3>
            <div className="dash-footer text-gray-400">
               Total em peças vendidas
            </div>
          </div>
        </div>
      </div>

      <div className="chart-section">
        <h3>Evolução Diária</h3>
        {chartData.length > 0 ? (
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="displayDate" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(val) => `R$ ${val}`} />
                <Tooltip 
                  formatter={(value: any) => `R$ ${Number(value || 0).toFixed(2)}`}
                  cursor={{ fill: 'rgba(241, 245, 249, 0.5)' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontSize: '14px' }} />
                <Bar dataKey="Mão de Obra" stackId="a" fill="#6366f1" radius={[0, 0, 4, 4]} barSize={32} />
                <Bar dataKey="Peças" stackId="a" fill="#10b981" radius={[4, 4, 0, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="empty-chart">Nenhum faturamento registrado no período selecionado.</div>
        )}
      </div>

      <div className="grouped-list-section">
        <div className="list-header-flex">
          <h3>Detalhamento das Ordens</h3>
          <div className="filter-group group-selector">
            <Filter size={18} />
            <select value={grouping} onChange={e => setGrouping(e.target.value)}>
              <option value="none">Sem agrupamento</option>
              <option value="cpf">Agrupar por CPF (Cliente)</option>
              <option value="placa">Agrupar por Placa (Veículo)</option>
            </select>
          </div>
        </div>

        <div className="groups-container">
          {Object.entries(groupedOrders).map(([groupKey, groupOrders]) => {
            const groupTotal = groupOrders.reduce((acc, o) => acc + calcParts(o.parts) + calcLabor(o.services), 0);
            
            return (
              <div key={groupKey} className="group-card">
                <div className="group-card-header">
                  <div className="group-title">
                    <div className="group-icon">
                      {grouping === 'cpf' && <Users size={20} />}
                      {grouping === 'placa' && <Car size={20} />}
                      {grouping === 'none' && <FileText size={20} />}
                    </div>
                    <div>
                      <h4>{groupKey}</h4>
                      <span className="badge">{groupOrders.length} {groupOrders.length === 1 ? 'Ordem' : 'Ordens'}</span>
                    </div>
                  </div>
                  <div className="group-total">
                    <span>Total do Grupo</span>
                    <strong>R$ {groupTotal.toFixed(2)}</strong>
                  </div>
                </div>
                
                <div className="group-items">
                  {groupOrders.map(order => (
                    // ADICIONADO O ONCLICK AQUI
                    <div 
                      key={order.id} 
                      className="micro-os-card interactive-card"
                      onClick={() => onOrderClick(order.id)}
                    >
                      <div className="micro-header">
                        <strong>OS #{order.id}</strong>
                        <span className={`status-badge ${order.status?.toLowerCase().replace(' ', '-') || 'pendente'}`}>
                          {order.status || 'Pendente'}
                        </span>
                      </div>
                      <div className="micro-body">
                        <span className="micro-client">{order.clientName || 'Cliente não informado'}</span>
                        <span className="micro-vehicle">{order.vehicleName || 'Veículo não informado'} • Placa: {order.vehiclePlate || '--'}</span>
                      </div>
                      <div className="micro-footer">
                        <span className="micro-date">Entregue: {order.deliveryDate ? order.deliveryDate.split('-').reverse().join('/') : '--'}</span>
                        <strong className="micro-price">R$ {(calcParts(order.parts) + calcLabor(order.services)).toFixed(2)}</strong>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
          {Object.keys(groupedOrders).length === 0 && (
             <div className="empty-chart">Nenhuma Ordem de Serviço encontrada para o filtro atual.</div>
          )}
        </div>
      </div>
    </div>
  );
}