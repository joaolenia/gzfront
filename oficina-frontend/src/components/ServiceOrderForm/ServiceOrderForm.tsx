import { useState } from 'react';
import { X, Save, Plus, Trash2, Loader2 } from 'lucide-react';
import { api } from '../../services/api';
import './ServiceOrderForm.css';

interface ServiceOrderFormProps {
  onClose: () => void;
  // Opcional: Adicionamos um onSuccess para recarregar a lista caso necessário futuramente
  onSuccess?: () => void; 
}

interface ItemList {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

export function ServiceOrderForm({ onClose, onSuccess }: ServiceOrderFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    clientName: '',
    clientCpf: '',
    clientPhone: '',
    vehicleName: '',
    vehiclePlate: '',
    vehicleYear: '',
    vehicleColor: '',
    entryDate: '',
    deliveryDate: '',
    priority: 'Normal',
    clientRequest: '',
  });

  const [parts, setParts] = useState<ItemList[]>([]);
  const [services, setServices] = useState<ItemList[]>([]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Peças
  const addPart = () => setParts([...parts, { id: crypto.randomUUID(), name: '', quantity: 1, price: 0 }]);
  const updatePart = (id: string, field: keyof ItemList, value: string | number) => {
    setParts(parts.map(p => p.id === id ? { ...p, [field]: value } : p));
  };
  const removePart = (id: string) => setParts(parts.filter(p => p.id !== id));

  // Serviços
  const addService = () => setServices([...services, { id: crypto.randomUUID(), name: '', quantity: 1, price: 0 }]);
  const updateService = (id: string, field: keyof ItemList, value: string | number) => {
    setServices(services.map(s => s.id === id ? { ...s, [field]: value } : s));
  };
  const removeService = (id: string) => setServices(services.filter(s => s.id !== id));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Mapeamento dos dados para o formato esperado pelo backend NestJS
      const payload = {
        clientName: formData.clientName,
        clientCpf: formData.clientCpf,
        clientPhone: formData.clientPhone,
        vehicleName: formData.vehicleName,
        vehiclePlate: formData.vehiclePlate,
        vehicleYear: formData.vehicleYear,
        vehicleColor: formData.vehicleColor,
        entryDate: formData.entryDate,
        deliveryDate: formData.deliveryDate,
        priority: formData.priority,
        clientRequest: formData.clientRequest,
        status: 'Pendente',
        mechanic: '', // Opcional no cadastro inicial
        parts: parts.map(p => ({
          id: p.id,
          name: p.name,
          qty: p.quantity,
          price: p.price,
          discount: 0 // Valor padrão inicial
        })),
        services: services.map(s => ({
          id: s.id,
          name: s.name,
          qty: s.quantity,
          price: s.price,
          discount: 0 // Valor padrão inicial
        }))
      };

      // Requisição POST para o backend
      await api.post('/os', payload);
      
      alert('Ordem de serviço cadastrada com sucesso!');
      if (onSuccess) onSuccess();
      onClose();

    } catch (error) {
      console.error('Erro ao salvar OS:', error);
      alert('Ocorreu um erro ao tentar cadastrar a Ordem de Serviço. Verifique a conexão com o servidor.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Nova Ordem de Serviço</h2>
          <button onClick={onClose} className="btn-close" disabled={isSubmitting}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="os-form">
          {/* DADOS DO CLIENTE */}
          <fieldset>
            <legend>Dados do Cliente</legend>
            <div className="form-grid-3">
              <div className="input-group span-2">
                <label htmlFor="clientName">Nome Completo *</label>
                <input type="text" id="clientName" name="clientName" required onChange={handleChange} disabled={isSubmitting} />
              </div>
              <div className="input-group">
                <label htmlFor="clientCpf">CPF</label>
                <input type="text" id="clientCpf" name="clientCpf" onChange={handleChange} disabled={isSubmitting} />
              </div>
              <div className="input-group span-3">
                <label htmlFor="clientPhone">Telefone / WhatsApp</label>
                <input type="text" id="clientPhone" name="clientPhone" onChange={handleChange} disabled={isSubmitting} />
              </div>
            </div>
          </fieldset>

          {/* DADOS DO VEÍCULO */}
          <fieldset>
            <legend>Dados do Veículo</legend>
            <div className="form-grid-4">
              <div className="input-group span-2">
                <label htmlFor="vehicleName">Veículo (Modelo) *</label>
                <input type="text" id="vehicleName" name="vehicleName" placeholder="Ex: Honda Civic" required onChange={handleChange} disabled={isSubmitting} />
              </div>
              <div className="input-group">
                <label htmlFor="vehiclePlate">Placa *</label>
                <input type="text" id="vehiclePlate" name="vehiclePlate" required onChange={handleChange} disabled={isSubmitting} />
              </div>
              <div className="input-group">
                <label htmlFor="vehicleYear">Ano/Modelo</label>
                <input type="text" id="vehicleYear" name="vehicleYear" onChange={handleChange} disabled={isSubmitting} />
              </div>
              <div className="input-group span-2">
                <label htmlFor="vehicleColor">Cor</label>
                <input type="text" id="vehicleColor" name="vehicleColor" onChange={handleChange} disabled={isSubmitting} />
              </div>
            </div>
          </fieldset>

          {/* DADOS DA OS */}
          <fieldset>
            <legend>Detalhes da OS</legend>
            <div className="form-grid-3">
              <div className="input-group">
                <label htmlFor="entryDate">Data de Entrada</label>
                <input type="date" id="entryDate" name="entryDate" onChange={handleChange} disabled={isSubmitting} />
              </div>
              <div className="input-group">
                <label htmlFor="deliveryDate">Previsão de Entrega</label>
                <input type="date" id="deliveryDate" name="deliveryDate" onChange={handleChange} disabled={isSubmitting} />
              </div>
              <div className="input-group">
                <label htmlFor="priority">Prioridade</label>
                <select id="priority" name="priority" onChange={handleChange} value={formData.priority} disabled={isSubmitting}>
                  <option value="Baixa">Baixa</option>
                  <option value="Normal">Normal</option>
                  <option value="Alta">Alta</option>
                  <option value="Urgente">Urgente</option>
                </select>
              </div>
            </div>
            
            <div className="input-group mt-3">
              <label htmlFor="clientRequest">Solicitação do Cliente</label>
              <textarea id="clientRequest" name="clientRequest" rows={3} onChange={handleChange} placeholder="O que precisa ser feito?" disabled={isSubmitting}></textarea>
            </div>
          </fieldset>

          {/* LISTA DE PEÇAS */}
          <fieldset>
            <div className="flex-between">
              <legend>Peças (Opcional)</legend>
              <button type="button" onClick={addPart} className="btn-add-item" disabled={isSubmitting}>
                <Plus size={16} /> Adicionar Peça
              </button>
            </div>
            
            <div className="dynamic-list">
              {parts.length === 0 && <span className="empty-text">Nenhuma peça adicionada.</span>}
              {parts.map((part) => (
                <div key={part.id} className="item-row">
                  <input type="text" placeholder="Nome da peça" value={part.name} onChange={(e) => updatePart(part.id, 'name', e.target.value)} className="flex-1" disabled={isSubmitting} />
                  <input type="number" placeholder="Qtd" min="1" value={part.quantity} onChange={(e) => updatePart(part.id, 'quantity', Number(e.target.value))} className="w-20" disabled={isSubmitting} />
                  <input type="number" placeholder="Preço (R$)" step="0.01" value={part.price} onChange={(e) => updatePart(part.id, 'price', Number(e.target.value))} className="w-32" disabled={isSubmitting} />
                  <button type="button" onClick={() => removePart(part.id)} className="btn-remove-item" disabled={isSubmitting}><Trash2 size={18} /></button>
                </div>
              ))}
            </div>
          </fieldset>

          {/* LISTA DE SERVIÇOS */}
          <fieldset>
            <div className="flex-between">
              <legend>Serviços (Opcional)</legend>
              <button type="button" onClick={addService} className="btn-add-item" disabled={isSubmitting}>
                <Plus size={16} /> Adicionar Serviço
              </button>
            </div>
            
            <div className="dynamic-list">
              {services.length === 0 && <span className="empty-text">Nenhum serviço adicionado.</span>}
              {services.map((service) => (
                <div key={service.id} className="item-row">
                  <input type="text" placeholder="Descrição do serviço" value={service.name} onChange={(e) => updateService(service.id, 'name', e.target.value)} className="flex-1" disabled={isSubmitting} />
                  <input type="number" placeholder="Qtd" min="1" value={service.quantity} onChange={(e) => updateService(service.id, 'quantity', Number(e.target.value))} className="w-20" disabled={isSubmitting} />
                  <input type="number" placeholder="Preço (R$)" step="0.01" value={service.price} onChange={(e) => updateService(service.id, 'price', Number(e.target.value))} className="w-32" disabled={isSubmitting} />
                  <button type="button" onClick={() => removeService(service.id)} className="btn-remove-item" disabled={isSubmitting}><Trash2 size={18} /></button>
                </div>
              ))}
            </div>
          </fieldset>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn-cancel" disabled={isSubmitting}>Cancelar</button>
            <button type="submit" className="btn-save" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
              {isSubmitting ? 'Salvando...' : 'Salvar OS'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}