import { useState } from 'react';
import { X, Save, Plus, Trash2 } from 'lucide-react';
import './ServiceOrderForm.css';

interface ServiceOrderFormProps {
  onClose: () => void;
}

interface ItemList {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

export function ServiceOrderForm({ onClose }: ServiceOrderFormProps) {
  // Estado para os campos fixos
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

  // Estados para as listas dinâmicas (opcionais)
  const [parts, setParts] = useState<ItemList[]>([]);
  const [services, setServices] = useState<ItemList[]>([]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Funções para manipular Peças
  const addPart = () => {
    setParts([...parts, { id: crypto.randomUUID(), name: '', quantity: 1, price: 0 }]);
  };
  const updatePart = (id: string, field: keyof ItemList, value: string | number) => {
    setParts(parts.map(p => p.id === id ? { ...p, [field]: value } : p));
  };
  const removePart = (id: string) => {
    setParts(parts.filter(p => p.id !== id));
  };

  // Funções para manipular Serviços
  const addService = () => {
    setServices([...services, { id: crypto.randomUUID(), name: '', quantity: 1, price: 0 }]);
  };
  const updateService = (id: string, field: keyof ItemList, value: string | number) => {
    setServices(services.map(s => s.id === id ? { ...s, [field]: value } : s));
  };
  const removeService = (id: string) => {
    setServices(services.filter(s => s.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...formData,
      parts,
      services,
    };
    console.log('Dados prontos para o backend:', payload);
    alert('Ordem de serviço salva com sucesso! (Verifique o console)');
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Nova Ordem de Serviço</h2>
          <button onClick={onClose} className="btn-close">
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
                <input type="text" id="clientName" name="clientName" required onChange={handleChange} />
              </div>
              <div className="input-group">
                <label htmlFor="clientCpf">CPF</label>
                <input type="text" id="clientCpf" name="clientCpf" onChange={handleChange} />
              </div>
              <div className="input-group span-3">
                <label htmlFor="clientPhone">Telefone / WhatsApp</label>
                <input type="text" id="clientPhone" name="clientPhone" onChange={handleChange} />
              </div>
            </div>
          </fieldset>

          {/* DADOS DO VEÍCULO */}
          <fieldset>
            <legend>Dados do Veículo</legend>
            <div className="form-grid-4">
              <div className="input-group span-2">
                <label htmlFor="vehicleName">Veículo (Modelo) *</label>
                <input type="text" id="vehicleName" name="vehicleName" placeholder="Ex: Honda Civic" required onChange={handleChange} />
              </div>
              <div className="input-group">
                <label htmlFor="vehiclePlate">Placa *</label>
                <input type="text" id="vehiclePlate" name="vehiclePlate" required onChange={handleChange} />
              </div>
              <div className="input-group">
                <label htmlFor="vehicleYear">Ano/Modelo</label>
                <input type="text" id="vehicleYear" name="vehicleYear" onChange={handleChange} />
              </div>
              <div className="input-group span-2">
                <label htmlFor="vehicleColor">Cor</label>
                <input type="text" id="vehicleColor" name="vehicleColor" onChange={handleChange} />
              </div>
            </div>
          </fieldset>

          {/* DADOS DA OS */}
          <fieldset>
            <legend>Detalhes da OS</legend>
            <div className="form-grid-3">
              <div className="input-group">
                <label htmlFor="entryDate">Data de Entrada</label>
                <input type="date" id="entryDate" name="entryDate" onChange={handleChange} />
              </div>
              <div className="input-group">
                <label htmlFor="deliveryDate">Previsão de Entrega</label>
                <input type="date" id="deliveryDate" name="deliveryDate" onChange={handleChange} />
              </div>
              <div className="input-group">
                <label htmlFor="priority">Prioridade</label>
                <select id="priority" name="priority" onChange={handleChange} value={formData.priority}>
                  <option value="Baixa">Baixa</option>
                  <option value="Normal">Normal</option>
                  <option value="Alta">Alta</option>
                  <option value="Urgente">Urgente</option>
                </select>
              </div>
            </div>
            
            <div className="input-group mt-3">
              <label htmlFor="clientRequest">Solicitação do Cliente (O que precisa ser feito?)</label>
              <textarea 
                id="clientRequest" 
                name="clientRequest" 
                rows={3} 
                onChange={handleChange}
                placeholder="Ex: Verificar barulho ao frear e falha no motor do limpador dianteiro..."
              ></textarea>
            </div>
          </fieldset>

          {/* LISTA DE PEÇAS (Opcional) */}
          <fieldset>
            <div className="flex-between">
              <legend>Peças (Opcional)</legend>
              <button type="button" onClick={addPart} className="btn-add-item">
                <Plus size={16} /> Adicionar Peça
              </button>
            </div>
            
            <div className="dynamic-list">
              {parts.length === 0 && <span className="empty-text">Nenhuma peça adicionada.</span>}
              {parts.map((part) => (
                <div key={part.id} className="item-row">
                  <input type="text" placeholder="Nome da peça (Ex: Cilindro mestre, Pastilhas)" value={part.name} onChange={(e) => updatePart(part.id, 'name', e.target.value)} className="flex-1" />
                  <input type="number" placeholder="Qtd" min="1" value={part.quantity} onChange={(e) => updatePart(part.id, 'quantity', Number(e.target.value))} className="w-20" />
                  <input type="number" placeholder="Preço (R$)" step="0.01" value={part.price} onChange={(e) => updatePart(part.id, 'price', Number(e.target.value))} className="w-32" />
                  <button type="button" onClick={() => removePart(part.id)} className="btn-remove-item"><Trash2 size={18} /></button>
                </div>
              ))}
            </div>
          </fieldset>

          {/* LISTA DE SERVIÇOS (Opcional) */}
          <fieldset>
            <div className="flex-between">
              <legend>Serviços (Opcional)</legend>
              <button type="button" onClick={addService} className="btn-add-item">
                <Plus size={16} /> Adicionar Serviço
              </button>
            </div>
            
            <div className="dynamic-list">
              {services.length === 0 && <span className="empty-text">Nenhum serviço adicionado.</span>}
              {services.map((service) => (
                <div key={service.id} className="item-row">
                  <input type="text" placeholder="Descrição do serviço (Ex: Troca do kit relação)" value={service.name} onChange={(e) => updateService(service.id, 'name', e.target.value)} className="flex-1" />
                  <input type="number" placeholder="Qtd" min="1" value={service.quantity} onChange={(e) => updateService(service.id, 'quantity', Number(e.target.value))} className="w-20" />
                  <input type="number" placeholder="Preço (R$)" step="0.01" value={service.price} onChange={(e) => updateService(service.id, 'price', Number(e.target.value))} className="w-32" />
                  <button type="button" onClick={() => removeService(service.id)} className="btn-remove-item"><Trash2 size={18} /></button>
                </div>
              ))}
            </div>
          </fieldset>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn-cancel">Cancelar</button>
            <button type="submit" className="btn-save">
              <Save size={20} />
              Salvar OS
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}