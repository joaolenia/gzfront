import { useState, useEffect } from 'react';
import { X, Save, Plus, Trash2, Loader2, CheckCircle2, AlertCircle, Search } from 'lucide-react';
import { api } from '../../services/api';
import './ServiceOrderForm.css';

interface ServiceOrderFormProps {
  onClose: () => void;
  onSuccess?: () => void; 
}

interface ItemList {
  id: string;
  name: string;
  quantity: number | string; 
  price: number | string;    
}

export function ServiceOrderForm({ onClose, onSuccess }: ServiceOrderFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFetchingPlate, setIsFetchingPlate] = useState(false); // Novo estado
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);

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

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
        if (notification.type === 'success') {
          if (onSuccess) onSuccess();
          onClose();
        }
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notification, onClose, onSuccess]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // =============== LÓGICA DE BUSCA DA PLACA ===============
  const searchVehicleByPlate = async () => {
    const placa = formData.vehiclePlate.replace(/[^a-zA-Z0-9]/g, '');
    if (placa.length !== 7) {
      setNotification({ type: 'error', message: 'Digite uma placa válida com 7 caracteres.' });
      return;
    }

    setIsFetchingPlate(true);
    
    try {
      /*
        LÓGICA REAL: Descomente este bloco quando assinar uma API (ex: Invertexto)
        
        import axios from 'axios';
        const response = await axios.get(`https://api.invertexto.com/v1/fipe/placa/${placa}?token=SEU_TOKEN_AQUI`);
        const data = response.data;
        
        setFormData(prev => ({ 
          ...prev, 
          vehicleName: `${data.marca} ${data.modelo}`, 
          vehicleYear: data.ano_modelo, 
          vehicleColor: data.cor 
        }));
      */

      // SIMULAÇÃO PARA TESTES (Mock)
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simula tempo de rede
      
      setFormData(prev => ({
        ...prev,
        vehicleName: 'Volkswagen Gol 1.0 Flex',
        vehicleYear: '2014/2015',
        vehicleColor: 'Branca'
      }));

      setNotification({ type: 'success', message: 'Veículo encontrado com sucesso!' });

    } catch (error) {
      console.error('Erro na consulta da placa:', error);
      setNotification({ type: 'error', message: 'Não foi possível encontrar a placa.' });
    } finally {
      setIsFetchingPlate(false);
    }
  };
  // ========================================================

  const addPart = () => setParts([...parts, { id: crypto.randomUUID(), name: '', quantity: 1, price: '' }]);
  const updatePart = (id: string, field: keyof ItemList, value: string | number) => {
    setParts(parts.map(p => p.id === id ? { ...p, [field]: value } : p));
  };
  const removePart = (id: string) => setParts(parts.filter(p => p.id !== id));

  const addService = () => setServices([...services, { id: crypto.randomUUID(), name: '', quantity: 1, price: '' }]);
  const updateService = (id: string, field: keyof ItemList, value: string | number) => {
    setServices(services.map(s => s.id === id ? { ...s, [field]: value } : s));
  };
  const removeService = (id: string) => setServices(services.filter(s => s.id !== id));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setNotification(null);

    try {
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
        mechanic: '', 
        parts: parts.map(p => ({
          id: p.id,
          name: p.name,
          qty: Number(p.quantity) || 0,
          price: Number(p.price) || 0,
          discount: 0
        })),
        services: services.map(s => ({
          id: s.id,
          name: s.name,
          qty: Number(s.quantity) || 0,
          price: Number(s.price) || 0,
          discount: 0
        }))
      };

      await api.post('/os', payload);
      setNotification({ type: 'success', message: 'Ordem de Serviço cadastrada com sucesso!' });

    } catch (error) {
      console.error('Erro ao salvar OS:', error);
      setNotification({ type: 'error', message: 'Erro ao cadastrar. Verifique a conexão com o servidor.' });
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        
        {notification && (
          <div className={`notification-popup ${notification.type}`}>
            {notification.type === 'success' ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
            <span>{notification.message}</span>
            <div className="progress-bar"></div>
          </div>
        )}

        <div className="modal-header">
          <h2>Nova Ordem de Serviço</h2>
          <button onClick={onClose} className="btn-close" disabled={isSubmitting}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="os-form">
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

          <fieldset>
            <legend>Dados do Veículo</legend>
            <div className="form-grid-4">
              <div className="input-group span-2">
                <label htmlFor="vehiclePlate">Placa *</label>
                <div className="plate-input-wrapper">
                  <input 
                    type="text" 
                    id="vehiclePlate" 
                    name="vehiclePlate" 
                    required 
                    onChange={handleChange} 
                    value={formData.vehiclePlate}
                    disabled={isSubmitting || isFetchingPlate} 
                    maxLength={8}
                    placeholder="ABC1D23"
                  />
                  <button 
                    type="button" 
                    className="btn-search-plate" 
                    onClick={searchVehicleByPlate}
                    disabled={isSubmitting || isFetchingPlate || !formData.vehiclePlate}
                    title="Buscar veículo pela placa"
                  >
                    {isFetchingPlate ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
                  </button>
                </div>
              </div>
              <div className="input-group span-2">
                <label htmlFor="vehicleName">Veículo (Modelo) *</label>
                <input type="text" id="vehicleName" name="vehicleName" placeholder="Ex: Honda Civic" required onChange={handleChange} value={formData.vehicleName} disabled={isSubmitting || isFetchingPlate} />
              </div>
              <div className="input-group span-2">
                <label htmlFor="vehicleYear">Ano/Modelo</label>
                <input type="text" id="vehicleYear" name="vehicleYear" onChange={handleChange} value={formData.vehicleYear} disabled={isSubmitting || isFetchingPlate} />
              </div>
              <div className="input-group span-2">
                <label htmlFor="vehicleColor">Cor</label>
                <input type="text" id="vehicleColor" name="vehicleColor" onChange={handleChange} value={formData.vehicleColor} disabled={isSubmitting || isFetchingPlate} />
              </div>
            </div>
          </fieldset>

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

          <fieldset>
            <div className="flex-between">
              <legend>Peças (Opcional)</legend>
              <button type="button" onClick={addPart} className="btn-add-item" disabled={isSubmitting}>
                <Plus size={16} /> Adicionar Peça
              </button>
            </div>
            
            <div className="dynamic-list">
              {parts.length === 0 && <span className="empty-text">Nenhuma peça adicionada.</span>}
              {parts.map((part, index) => (
                <div key={part.id} className="item-row-container">
                  {index === 0 && ( 
                    <div className="item-labels">
                      <span className="flex-1">Nome da peça</span>
                      <span className="w-20 text-center">Qtd</span>
                      <span className="w-32 text-center">Preço (R$)</span>
                      <span className="w-10"></span>
                    </div>
                  )}
                  <div className="item-row">
                    <input type="text" placeholder="Ex: Pastilha de Freio" value={part.name} onChange={(e) => updatePart(part.id, 'name', e.target.value)} className="flex-1" disabled={isSubmitting} />
                    <input type="number" placeholder="Qtd" min="1" value={part.quantity} onChange={(e) => updatePart(part.id, 'quantity', e.target.value)} className="w-20 text-center" disabled={isSubmitting} />
                    <input type="number" placeholder="R$ 0.00" step="0.01" value={part.price} onChange={(e) => updatePart(part.id, 'price', e.target.value)} className="w-32 text-right" disabled={isSubmitting} />
                    <button type="button" onClick={() => removePart(part.id)} className="btn-remove-item w-10" disabled={isSubmitting}><Trash2 size={18} /></button>
                  </div>
                </div>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <div className="flex-between">
              <legend>Serviços (Opcional)</legend>
              <button type="button" onClick={addService} className="btn-add-item" disabled={isSubmitting}>
                <Plus size={16} /> Adicionar Serviço
              </button>
            </div>
            
            <div className="dynamic-list">
              {services.length === 0 && <span className="empty-text">Nenhum serviço adicionado.</span>}
              {services.map((service, index) => (
                <div key={service.id} className="item-row-container">
                  {index === 0 && (
                    <div className="item-labels">
                      <span className="flex-1">Descrição do serviço</span>
                      <span className="w-20 text-center">Qtd</span>
                      <span className="w-32 text-center">Preço (R$)</span>
                      <span className="w-10"></span>
                    </div>
                  )}
                  <div className="item-row">
                    <input type="text" placeholder="Ex: Mão de obra mecânica" value={service.name} onChange={(e) => updateService(service.id, 'name', e.target.value)} className="flex-1" disabled={isSubmitting} />
                    <input type="number" placeholder="Qtd" min="1" value={service.quantity} onChange={(e) => updateService(service.id, 'quantity', e.target.value)} className="w-20 text-center" disabled={isSubmitting} />
                    <input type="number" placeholder="R$ 0.00" step="0.01" value={service.price} onChange={(e) => updateService(service.id, 'price', e.target.value)} className="w-32 text-right" disabled={isSubmitting} />
                    <button type="button" onClick={() => removeService(service.id)} className="btn-remove-item w-10" disabled={isSubmitting}><Trash2 size={18} /></button>
                  </div>
                </div>
              ))}
            </div>
          </fieldset>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn-cancel" disabled={isSubmitting}>Cancelar</button>
            <button type="submit" className="btn-save" disabled={isSubmitting || !!notification}>
              {isSubmitting ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
              {isSubmitting ? 'Salvando...' : 'Salvar OS'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}