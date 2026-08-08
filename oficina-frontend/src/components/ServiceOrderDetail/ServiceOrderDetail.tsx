import { useState, useEffect } from 'react';
import { ArrowLeft, Printer, Plus, Trash2, Save, X } from 'lucide-react';
import './ServiceOrderDetail.css';

interface ServiceOrderDetailProps {
  orderId: number;
  onBack: () => void;
}

// Mock inicial com os dados solicitados
const initialOrderData = {
  id: 102,
  client: { name: 'ROBSON COSTA DA ROSA', cpf: '011.557.010-10', phone: '+55 (47) 9 9701-7867' },
  vehicle: { name: 'Ford - Fiesta S 1.0 8V Flex 5p', plate: 'MDB-5C06', year: '2014/2014', color: 'BRANCA' },
  info: { entryDate: '21/07/2026', deliveryDate: '21/07/2026', priority: 'NORMAL', mechanic: 'gzcentro' },
  request: 'DOR DO CLIENTE',
  parts: [
    { id: 'p1', name: 'JOGO DE PISTAO', qty: 1, price: 1300.00, discount: 0 },
    { id: 'p2', name: 'BRONZINA BIELA', qty: 1, price: 170.00, discount: 0 },
    { id: 'p3', name: 'BRONZINA MANCAL', qty: 1, price: 170.00, discount: 0 },
    { id: 'p4', name: 'KIT JUNTAS', qty: 1, price: 298.00, discount: 0 },
    { id: 'p5', name: 'OLEO MOTOR', qty: 4, price: 37.52, discount: 0 },
  ],
  services: [
    { id: 's1', name: 'RETIFICA BLOCO/CABEÇOTE', qty: 1, price: 1700.00, discount: 0 },
    { id: 's2', name: 'MAO DE OBRA', qty: 1, price: 2000.00, discount: 0 },
  ]
};

export function ServiceOrderDetail({ orderId, onBack }: ServiceOrderDetailProps) {
  const [originalOrder, setOriginalOrder] = useState(initialOrderData);
  const [order, setOrder] = useState(initialOrderData);
  const [isDirty, setIsDirty] = useState(false);

  // Verifica se há alterações para mostrar o botão flutuante
  useEffect(() => {
    const hasChanges = JSON.stringify(originalOrder) !== JSON.stringify(order);
    setIsDirty(hasChanges);
  }, [order, originalOrder]);

  const handlePrint = () => {
    window.print();
  };

  const handleSave = () => {
    console.log("Salvando dados no backend...", order);
    setOriginalOrder(order); // Atualiza a referência original
    alert("Alterações salvas com sucesso!");
  };

  const handleCancel = () => {
    setOrder(originalOrder); // Reverte para os dados originais
  };

  // Funções genéricas para atualizar os dados
  const handleNestedChange = (category: 'client' | 'vehicle' | 'info', field: string, value: string) => {
    setOrder(prev => ({
      ...prev,
      [category]: { ...prev[category], [field]: value }
    }));
  };

  const handleListChange = (listName: 'parts' | 'services', id: string, field: string, value: string | number) => {
    setOrder(prev => ({
      ...prev,
      [listName]: prev[listName].map(item => item.id === id ? { ...item, [field]: value } : item)
    }));
  };

  const addListItem = (listName: 'parts' | 'services') => {
    const newItem = { id: crypto.randomUUID(), name: '', qty: 1, price: 0, discount: 0 };
    setOrder(prev => ({ ...prev, [listName]: [...prev[listName], newItem] }));
  };

  const removeListItem = (listName: 'parts' | 'services', id: string) => {
    setOrder(prev => ({ ...prev, [listName]: prev[listName].filter(item => item.id !== id) }));
  };

  const totalParts = order.parts.reduce((acc, part) => acc + (part.qty * part.price - part.discount), 0);
  const totalServices = order.services.reduce((acc, srv) => acc + (srv.qty * srv.price - srv.discount), 0);

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

        {/* Informações Gerais Editáveis */}
        <div className="print-info-grid">
          <div className="info-column">
            <div className="edit-row">
              <label>Nome do cliente:</label>
              <input type="text" value={order.client.name} onChange={e => handleNestedChange('client', 'name', e.target.value)} className="flex-1" />
            </div>
            <div className="edit-row">
              <label>Nº O.S.:</label>
              <span className="static-text">{order.id}</span>
            </div>
            <div className="edit-row">
              <label>Veículo:</label>
              <input type="text" value={order.vehicle.name} onChange={e => handleNestedChange('vehicle', 'name', e.target.value)} className="flex-1" />
            </div>
            <div className="edit-row">
              <label>Placa:</label>
              <input type="text" value={order.vehicle.plate} onChange={e => handleNestedChange('vehicle', 'plate', e.target.value)} className="w-24" />
              <label className="ml-2">Ano/Mod:</label>
              <input type="text" value={order.vehicle.year} onChange={e => handleNestedChange('vehicle', 'year', e.target.value)} className="w-24" />
            </div>
            <div className="edit-row">
              <label>Data entrada:</label>
              <input type="text" value={order.info.entryDate} onChange={e => handleNestedChange('info', 'entryDate', e.target.value)} className="w-28" />
              <label className="ml-2">Prev. entrega:</label>
              <input type="text" value={order.info.deliveryDate} onChange={e => handleNestedChange('info', 'deliveryDate', e.target.value)} className="w-28" />
            </div>
            <div className="edit-row">
              <label>Responsável:</label>
              <input type="text" value={order.info.mechanic} onChange={e => handleNestedChange('info', 'mechanic', e.target.value)} className="flex-1" />
            </div>
          </div>

          <div className="info-column">
            <div className="edit-row">
              <label>CPF:</label>
              <input type="text" value={order.client.cpf} onChange={e => handleNestedChange('client', 'cpf', e.target.value)} className="flex-1" />
            </div>
            <div className="edit-row">
              <label>Prioridade:</label>
              <input type="text" value={order.info.priority} onChange={e => handleNestedChange('info', 'priority', e.target.value)} className="flex-1" />
            </div>
            <div className="edit-row">
              <label>Tel.:</label>
              <input type="text" value={order.client.phone} onChange={e => handleNestedChange('client', 'phone', e.target.value)} className="flex-1" />
            </div>
            <div className="edit-row">
              <label>Cor veículo:</label>
              <input type="text" value={order.vehicle.color} onChange={e => handleNestedChange('vehicle', 'color', e.target.value)} className="flex-1" />
            </div>
          </div>
        </div>

        {/* Solicitação do Cliente */}
        <div className="section-title mt-4">
          <h3>Solicitações do cliente</h3>
        </div>
        <div className="client-request-box">
          <textarea 
            value={order.request} 
            onChange={e => setOrder({...order, request: e.target.value})} 
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
            {order.parts.map(part => (
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
                    <input type="number" value={part.discount} onChange={e => handleListChange('parts', part.id, 'discount', Number(e.target.value))} className="table-input text-right" step="0.01" />
                  </div>
                </td>
                <td className="text-right align-middle">R$ {(part.qty * part.price - part.discount).toFixed(2)}</td>
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
            {order.services.map(srv => (
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
                    <input type="number" value={srv.discount} onChange={e => handleListChange('services', srv.id, 'discount', Number(e.target.value))} className="table-input text-right" step="0.01" />
                  </div>
                </td>
                <td className="text-right align-middle">R$ {(srv.qty * srv.price - srv.discount).toFixed(2)}</td>
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
            <button onClick={handleCancel} className="btn-float-cancel">
              <X size={16} /> Cancelar
            </button>
            <button onClick={handleSave} className="btn-float-save">
              <Save size={16} /> Salvar Alterações
            </button>
          </div>
        </div>
      )}
    </div>
  );
}