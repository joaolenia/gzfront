import { useState, useEffect, useMemo } from 'react';
import { api } from '../../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Calendar, Filter, Wrench, Settings, DollarSign, Users, Car, Loader2, FileText } from 'lucide-react';
import './Reports.css';

interface ItemList {
    qty: number;
    price: number;
    discount: number;
}

export function Reports() {
    const [orders, setOrders] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [dateFilter, setDateFilter] = useState('30'); // '7', '15', '30', 'all'
    const [grouping, setGrouping] = useState('none'); // 'none', 'cpf', 'placa'

    useEffect(() => {
        const fetchOrders = async () => {
            setIsLoading(true);
            try {
                // Busca todas as ordens de serviço
                const response = await api.get('/os');
                // Filtra apenas as Concluídas ou Em andamento que tenham data de entrega para fins de relatório de faturamento
                // Mas para evitar que a tela fique vazia nos testes, vamos pegar todas.
                setOrders(response.data);
            } catch (error) {
                console.error('Erro ao buscar OS para relatórios:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchOrders();
    }, []);

    // Funções utilitárias de cálculo
    const calcParts = (parts: ItemList[] = []) => parts.reduce((acc, p) => acc + (Number(p.qty) * Number(p.price) - (Number(p.discount) || 0)), 0);
    const calcLabor = (services: ItemList[] = []) => services.reduce((acc, s) => acc + (Number(s.qty) * Number(s.price) - (Number(s.discount) || 0)), 0);

    // 1. Filtragem por Data de Entrega
    const filteredOrders = useMemo(() => {
        if (dateFilter === 'all') return orders;

        const today = new Date();
        const limitDate = new Date(today);
        limitDate.setDate(today.getDate() - parseInt(dateFilter));

        return orders.filter(order => {
            if (!order.deliveryDate) return false; // Ignora se não tiver data de entrega prevista/realizada
            const [year, month, day] = order.deliveryDate.split('-');
            const delivery = new Date(Number(year), Number(month) - 1, Number(day));
            return delivery >= limitDate && delivery <= today;
        });
    }, [orders, dateFilter]);

    // 2. Cálculo dos Totais do Dashboard
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

    // 3. Preparação de Dados para o Gráfico (Agrupado por dia)
    const chartData = useMemo(() => {
        const dataMap: Record<string, any> = {};

        filteredOrders.forEach(order => {
            const dateStr = order.deliveryDate;
            if (!dateStr) return;

            // Formata de YYYY-MM-DD para DD/MM
            const [year, month, day] = dateStr.split('-');
            const displayDate = `${day}/${month}`;

            if (!dataMap[dateStr]) {
                dataMap[dateStr] = { date: dateStr, displayDate, 'Mão de Obra': 0, 'Peças': 0 };
            }

            dataMap[dateStr]['Mão de Obra'] += calcLabor(order.services);
            dataMap[dateStr]['Peças'] += calcParts(order.parts);
        });

        // Converte objeto para array e ordena por data
        return Object.values(dataMap).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }, [filteredOrders]);

    // 4. Agrupamento da Tabela Inferior
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
                    <h2>Relatórios e Faturamento</h2>
                    <p>Visão geral de desempenho baseada na data de entrega.</p>
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

            {/* CARDS DO DASHBOARD */}
            <div className="dashboard-cards">
                <div className="dash-card">
                    <div className="dash-icon bg-blue-100 text-blue-600"><DollarSign size={24} /></div>
                    <div className="dash-info">
                        <span>Faturamento Total</span>
                        <h3>R$ {summary.grandTotal.toFixed(2)}</h3>
                    </div>
                </div>
                <div className="dash-card">
                    <div className="dash-icon bg-indigo-100 text-indigo-600"><Wrench size={24} /></div>
                    <div className="dash-info">
                        <span>Mão de Obra</span>
                        <h3>R$ {summary.totalLabor.toFixed(2)}</h3>
                    </div>
                </div>
                <div className="dash-card">
                    <div className="dash-icon bg-emerald-100 text-emerald-600"><Settings size={24} /></div>
                    <div className="dash-info">
                        <span>Peças</span>
                        <h3>R$ {summary.totalParts.toFixed(2)}</h3>
                    </div>
                </div>
            </div>

            {/* ÁREA DO GRÁFICO */}
            <div className="chart-section">
                <h3>Faturamento por Dia</h3>
                {chartData.length > 0 ? (
                    <div className="chart-wrapper">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <XAxis dataKey="displayDate" tick={{ fill: '#64748b' }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fill: '#64748b' }} axisLine={false} tickLine={false} tickFormatter={(val) => `R$ ${val}`} />
                                <Tooltip
                                    formatter={(value: any) => `R$ ${Number(value || 0).toFixed(2)}`}
                                    cursor={{ fill: 'rgba(241, 245, 249, 0.5)' }}
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                />
                                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                                <Bar dataKey="Mão de Obra" stackId="a" fill="#4f46e5" radius={[0, 0, 4, 4]} />
                                <Bar dataKey="Peças" stackId="a" fill="#10b981" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                ) : (
                    <div className="empty-chart">Nenhum faturamento registrado no período selecionado.</div>
                )}
            </div>

            {/* ÁREA DE LISTAGEM AGRUPADA */}
            <div className="grouped-list-section">
                <div className="list-header-flex">
                    <h3>Detalhamento de Ordens</h3>
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
                                        {grouping === 'cpf' && <Users size={18} />}
                                        {grouping === 'placa' && <Car size={18} />}
                                        {grouping === 'none' && <FileText size={18} />}
                                        <h4>{groupKey}</h4>
                                        <span className="badge">{groupOrders.length} OS(s)</span>
                                    </div>
                                    <div className="group-total">
                                        R$ {groupTotal.toFixed(2)}
                                    </div>
                                </div>

                                <div className="group-items">
                                    {groupOrders.map(order => (
                                        <div key={order.id} className="micro-os-card">
                                            <div className="micro-header">
                                                <strong>OS #{order.id}</strong>
                                                <span className={`status-badge ${order.status?.toLowerCase().replace(' ', '-') || 'pendente'}`}>
                                                    {order.status || 'Pendente'}
                                                </span>
                                            </div>
                                            <div className="micro-body">
                                                <span>{order.clientName || 'Cliente não informado'}</span>
                                                <span>{order.vehicleName || 'Veículo não informado'} - Placa: {order.vehiclePlate || '--'}</span>
                                                <span>Entrega: {order.deliveryDate ? order.deliveryDate.split('-').reverse().join('/') : 'Não definida'}</span>
                                            </div>
                                            <div className="micro-footer">
                                                R$ {(calcParts(order.parts) + calcLabor(order.services)).toFixed(2)}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                    {Object.keys(groupedOrders).length === 0 && (
                        <div className="empty-chart">Nenhuma Ordem de Serviço encontrada.</div>
                    )}
                </div>
            </div>
        </div>
    );
}