import { useState, useEffect } from 'react';
import { ArrowLeft, Printer, Plus, Trash2, Save, X, Loader2 } from 'lucide-react';
import { api } from '../../services/api';
import './ServiceOrderDetail.css';

interface ServiceOrderDetailProps {
  orderId: number;
  onBack: () => void;
}

export function ServiceOrderDetail({ orderId, onBack }: ServiceOrderDetailProps) {
  const [originalOrder, setOriginalOrder] = useState<any>(null);
  const [order, setOrder] = useState<any>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Busca os dados da OS específica
  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const response = await api.get(`/os/${orderId}`);
        // Garante que parts e services sejam arrays, mesmo se vierem null do banco
        const data = {
          ...response.data,
          parts: response.data.parts || [],
          services: response.data.services || []
        };
        setOriginalOrder(data);
        setOrder(data);
      } catch (error) {
        console.error('Erro ao buscar detalhes da OS:', error);
        alert('Erro ao carregar detalhes da Ordem de Serviço.');
        onBack(); // Volta pra lista se der erro
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId, onBack]);

  // Verifica se há alterações
  useEffect(() => {
    if (order && originalOrder) {
      const hasChanges = JSON.stringify(originalOrder) !== JSON.stringify(order);
      setIsDirty(hasChanges);
    }
  }, [order, originalOrder]);

  const handlePrint = () => window.print();

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Faz o PATCH apenas com os dados atualizados do estado 'order'
      await api.patch(`/os/${order.id}`, order);
      setOriginalOrder(order);
      alert("Alterações salvas com sucesso!");
    } catch (error) {
      console.error("Erro ao salvar:", error);
      alert("Erro ao salvar as alterações.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => setOrder(originalOrder);

  // Funções de atualização (agora operam diretamente na raiz do objeto 'order')
  const handleFieldChange = (field: string, value: string) => {
    setOrder((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleListChange = (listName: 'parts' | 'services', id: string, field: string, value: string | number) => {
    setOrder((prev: any) => ({
      ...prev,
      [listName]: prev[listName].map((item: any) => item.id === id ? { ...item, [field]: value } : item)
    }));
  };

  const addListItem = (listName: 'parts' | 'services') => {
    const newItem = { id: crypto.randomUUID(), name: '', qty: 1, price: 0, discount: 0 };
    setOrder((prev: any) => ({ ...prev, [listName]: [...prev[listName], newItem] }));
  };

  const removeListItem = (listName: 'parts' | 'services', id: string) => {
    setOrder((prev: any) => ({ ...prev, [listName]: prev[listName].filter((item: any) => item.id !== id) }));
  };

  if (isLoading || !order) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-gray-500">
        <Loader2 size={40} className="animate-spin mb-4 text-blue-600" />
        <p>Carregando detalhes...</p>
      </div>
    );
  }

  const totalParts = order.parts.reduce((acc: number, part: any) => acc + (part.qty * part.price - (part.discount || 0)), 0);
  const totalServices = order.services.reduce((acc: number, srv: any) => acc + (srv.qty * srv.price - (srv.discount || 0)), 0);

  return (
    <div className="os-detail-container">
      {/* Barra superior */}
      <div className="actions-bar no-print">
        <button className="btn-back" onClick={onBack}>
          <ArrowLeft size={20} /> Voltar
        </button>
        <button className="btn-print-action" onClick={handlePrint}>
          <Printer size={20} /> Gerar PDF
        </button>
      </div>

      {/* Documento Editável / Imprimível */}
      <div className="printable-area">
        <div className="print-header">
          <div className="logo-box">
            <h1>GZ</h1>
            <p>CENTRO AUTOMOTIVO</p>
          </div>
          <div className="company-info">
            <h2>Gz centro automotivo</h2>
            <p>CNPJ: 65.310.288/0001-46 - Cel.: +55 (47) 9 9701-7867</p>
          </div>
        </div>

        {/* Informações Gerais Editáveis (Mapeadas para a raiz de 'order') */}
        <div className="print-info-grid">
          <div className="info-column">
            <div className="edit-row">
              <label>Nome do cliente:</label>
              <input type="text" value={order.clientName || ''} onChange={e => handleFieldChange('clientName', e.target.value)} className="flex-1" />
            </div>
            <div className="edit-row">
              <label>Nº O.S.:</label>
              <span className="static-text">{order.id}</span>
            </div>
            <div className="edit-row">
              <label>Veículo:</label>
              <input type="text" value={order.vehicleName || ''} onChange={e => handleFieldChange('vehicleName', e.target.value)} className="flex-1" />
            </div>
            <div className="edit-row">
              <label>Placa:</label>
              <input type="text" value={order.vehiclePlate || ''} onChange={e => handleFieldChange('vehiclePlate', e.target.value)} className="w-24" />
              <label className="ml-2">Ano/Mod:</label>
              <input type="text" value={order.vehicleYear || ''} onChange={e => handleFieldChange('vehicleYear', e.target.value)} className="w-24" />
            </div>
            <div className="edit-row">
              <label>Data entrada:</label>
              <input type="text" value={order.entryDate || ''} onChange={e => handleFieldChange('entryDate', e.target.value)} className="w-28" />
              <label className="ml-2">Prev. entrega:</label>
              <input type="text" value={order.deliveryDate || ''} onChange={e => handleFieldChange('deliveryDate', e.target.value)} className="w-28" />
            </div>
            <div className="edit-row">
              <label>Responsável:</label>
              <input type="text" value={order.mechanic || ''} onChange={e => handleFieldChange('mechanic', e.target.value)} className="flex-1" />
            </div>
          </div>

          <div className="info-column">
            <div className="edit-row">
              <label>CPF:</label>
              <input type="text" value={order.clientCpf || ''} onChange={e => handleFieldChange('clientCpf', e.target.value)} className="flex-1" />
            </div>
            <div className="edit-row">
              <label>Prioridade:</label>
              <input type="text" value={order.priority || ''} onChange={e => handleFieldChange('priority', e.target.value)} className="flex-1" />
            </div>
            <div className="edit-row">
              <label>Tel.:</label>
              <input type="text" value={order.clientPhone || ''} onChange={e => handleFieldChange('clientPhone', e.target.value)} className="flex-1" />
            </div>
            <div className="edit-row">
              <label>Cor veículo:</label>
              <input type="text" value={order.vehicleColor || ''} onChange={e => handleFieldChange('vehicleColor', e.target.value)} className="flex-1" />
            </div>
             <div className="edit-row">
              <label>Status:</label>
              <input type="text" value={order.status || ''} onChange={e => handleFieldChange('status', e.target.value)} className="flex-1 font-bold text-blue-600" />
            </div>
          </div>
        </div>

        {/* Solicitação do Cliente */}
        <div className="section-title mt-4">
          <h3>Solicitações do cliente</h3>
        </div>
        <div className="client-request-box">
          <textarea 
            value={order.clientRequest || ''} 
            onChange={e => handleFieldChange('clientRequest', e.target.value)} 
            className="editable-textarea"
            rows={2}
          />
        </div>

        {/* Tabela de Peças */}
        <div className="section-title mt-4 flex-between-print">
          <h3>Lista de peças</h3>
          <button className="btn-add-inline no-print" onClick={() => addListItem('parts')}>
            <Plus size={14} /> Add Peça
          </button>
        </div>
        <table className="print-table">
          <thead>
            <tr>
              <th className="text-left">Nome da peça</th>
              <th className="w-16">Qtd</th>
              <th className="w-28">Preço</th>
              <th className="w-28">Desconto</th>
              <th className="w-32">Total</th>
              <th className="w-10 no-print"></th>
            </tr>
          </thead>
          <tbody>
            {order.parts.map((part: any) => (
              <tr key={part.id}>
                <td>
                  <input type="text" value={part.name} onChange={e => handleListChange('parts', part.id, 'name', e.target.value)} className="table-input" />
                </td>
                <td>
                  <input type="number" value={part.qty} onChange={e => handleListChange('parts', part.id, 'qty', Number(e.target.value))} className="table-input text-center" min="1" />
                </td>
                <td>
                  <div className="currency-input">
                    <span>R$</span>
                    <input type="number" value={part.price} onChange={e => handleListChange('parts', part.id, 'price', Number(e.target.value))} className="table-input text-right" step="0.01" />
                  </div>
                </td>
                <td>
                  <div className="currency-input">
                    <span>R$</span>
                    <input type="number" value={part.discount || 0} onChange={e => handleListChange('parts', part.id, 'discount', Number(e.target.value))} className="table-input text-right" step="0.01" />
                  </div>
                </td>
                <td className="text-right align-middle">R$ {(part.qty * part.price - (part.discount || 0)).toFixed(2)}</td>
                <td className="no-print text-center">
                  <button className="btn-remove-inline" onClick={() => removeListItem('parts', part.id)}><Trash2 size={16} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="totals-row">
          <p><strong>Totais:</strong> R$ {totalParts.toFixed(2)}</p>
        </div>

        {/* Tabela de Serviços */}
        <div className="section-title mt-4 flex-between-print">
          <h3>Lista de serviços</h3>
          <button className="btn-add-inline no-print" onClick={() => addListItem('services')}>
            <Plus size={14} /> Add Serviço
          </button>
        </div>
        <table className="print-table">
          <thead>
            <tr>
              <th className="text-left">Nome do serviço</th>
              <th className="w-16">Qtd</th>
              <th className="w-28">Preço</th>
              <th className="w-28">Desconto</th>
              <th className="w-32">Total</th>
              <th className="w-10 no-print"></th>
            </tr>
          </thead>
          <tbody>
            {order.services.map((srv: any) => (
              <tr key={srv.id}>
                <td>
                  <input type="text" value={srv.name} onChange={e => handleListChange('services', srv.id, 'name', e.target.value)} className="table-input" />
                </td>
                <td>
                  <input type="number" value={srv.qty} onChange={e => handleListChange('services', srv.id, 'qty', Number(e.target.value))} className="table-input text-center" min="1" />
                </td>
                <td>
                  <div className="currency-input">
                    <span>R$</span>
                    <input type="number" value={srv.price} onChange={e => handleListChange('services', srv.id, 'price', Number(e.target.value))} className="table-input text-right" step="0.01" />
                  </div>
                </td>
                <td>
                  <div className="currency-input">
                    <span>R$</span>
                    <input type="number" value={srv.discount || 0} onChange={e => handleListChange('services', srv.id, 'discount', Number(e.target.value))} className="table-input text-right" step="0.01" />
                  </div>
                </td>
                <td className="text-right align-middle">R$ {(srv.qty * srv.price - (srv.discount || 0)).toFixed(2)}</td>
                <td className="no-print text-center">
                  <button className="btn-remove-inline" onClick={() => removeListItem('services', srv.id)}><Trash2 size={16} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="totals-row">
          <p><strong>Totais:</strong> R$ {totalServices.toFixed(2)}</p>
        </div>
        
        <div className="grand-total">
          <h2>TOTAL GERAL: R$ {(totalParts + totalServices).toFixed(2)}</h2>
        </div>
      </div>

      {/* Botão Flutuante de Salvamento */}
      {isDirty && (
        <div className="floating-save-bar no-print">
          <span className="floating-msg">Existem alterações não salvas.</span>
          <div className="floating-actions">
            <button onClick={handleCancel} className="btn-float-cancel" disabled={isSaving}>
              <X size={16} /> Cancelar
            </button>
            <button onClick={handleSave} className="btn-float-save" disabled={isSaving}>
              {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              {isSaving ? 'Salvando...' : 'Salvar Alterações'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}