import { useState } from 'react';
import { X, Save } from 'lucide-react';
import './ServiceOrderForm.css';

interface ServiceOrderFormProps {
  onClose: () => void;
}

export function ServiceOrderForm({ onClose }: ServiceOrderFormProps) {
  const [formData, setFormData] = useState({
    clientName: '',
    clientPhone: '',
    vehicleModel: '',
    vehiclePlate: '',
    serviceDescription: '',
    laborCost: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Aqui entrará a requisição POST para o backend NestJS
    console.log('Dados prontos para o backend:', formData);
    alert('Ordem de serviço salva com sucesso! (Simulação)');
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
          {/* Seção do Cliente */}
          <fieldset>
            <legend>Dados do Cliente</legend>
            <div className="form-grid">
              <div className="input-group">
                <label htmlFor="clientName">Nome Completo</label>
                <input type="text" id="clientName" name="clientName" required onChange={handleChange} />
              </div>
              <div className="input-group">
                <label htmlFor="clientPhone">Telefone / WhatsApp</label>
                <input type="text" id="clientPhone" name="clientPhone" required onChange={handleChange} />
              </div>
            </div>
          </fieldset>

          {/* Seção do Veículo */}
          <fieldset>
            <legend>Dados do Veículo</legend>
            <div className="form-grid">
              <div className="input-group">
                <label htmlFor="vehicleModel">Modelo e Ano (Ex: Honda Civic 2014)</label>
                <input type="text" id="vehicleModel" name="vehicleModel" required onChange={handleChange} />
              </div>
              <div className="input-group">
                <label htmlFor="vehiclePlate">Placa</label>
                <input type="text" id="vehiclePlate" name="vehiclePlate" required onChange={handleChange} />
              </div>
            </div>
          </fieldset>

          {/* Seção do Serviço */}
          <fieldset>
            <legend>Detalhes do Serviço</legend>
            <div className="input-group">
              <label htmlFor="serviceDescription">Descrição do que foi feito (peças e reparos)</label>
              <textarea 
                id="serviceDescription" 
                name="serviceDescription" 
                rows={3} 
                required 
                onChange={handleChange}
                placeholder="Ex: Troca do cilindro mestre e pastilhas de freio..."
              ></textarea>
            </div>
            <div className="form-grid">
              <div className="input-group">
                <label htmlFor="laborCost">Valor da Mão de Obra (R$)</label>
                <input type="number" step="0.01" id="laborCost" name="laborCost" required onChange={handleChange} />
              </div>
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