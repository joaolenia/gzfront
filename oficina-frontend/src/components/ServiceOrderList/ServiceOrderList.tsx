import { useState } from 'react';
import { FileText, Printer, Plus } from 'lucide-react';
import { ServiceOrderForm } from '../ServiceOrderForm/ServiceOrderForm';
import './ServiceOrderList.css';

// Dados mockados estruturados com uma variedade maior de serviços
const mockedOrders = [
  { 
    id: 101, 
    client: "Carlos Souza", 
    vehicle: "Honda Civic 2014", 
    service: "Troca do cilindro mestre e pastilhas de freio", 
    labor: 250.00, 
    total: 450.00, 
    status: "Concluído" 
  },
  { 
    id: 102, 
    client: "Mariana Lima", 
    vehicle: "VW Gol 2018", 
    service: "Substituição do motor do limpador dianteiro", 
    labor: 100.00, 
    total: 220.00, 
    status: "Em andamento" 
  },
  { 
    id: 103, 
    client: "Roberto Alves", 
    vehicle: "Yamaha Fazer 250", 
    service: "Troca do kit relação coroa/pinhão e amortecedores traseiros", 
    labor: 180.00, 
    total: 580.00, 
    status: "Pendente" 
  },
  { 
    id: 104, 
    client: "Juliana Costa", 
    vehicle: "Ford Ka 2015", 
    service: "Substituição do servo freio (hidrovácuo) e sangria do sistema", 
    labor: 300.00, 
    total: 750.00, 
    status: "Em andamento" 
  },
  { 
    id: 105, 
    client: "Fernando Mendes", 
    vehicle: "Honda CG 160 Titan", 
    service: "Troca dos cilindros de bengala dianteira e retentores", 
    labor: 150.00, 
    total: 380.00, 
    status: "Pendente" 
  },
  { 
    id: 106, 
    client: "Amanda Silva", 
    vehicle: "Chevrolet Tracker 2020", 
    service: "Instalação de kit vidro elétrico e revisão na fiação", 
    labor: 220.00, 
    total: 620.00, 
    status: "Concluído" 
  },
  { 
    id: 107, 
    client: "Diego Ferreira", 
    vehicle: "Fiat Strada 2021", 
    service: "Revisão geral, troca de óleo e filtros", 
    labor: 120.00, 
    total: 350.00, 
    status: "Concluído" 
  }
];

export function ServiceOrderList() {
  const [isFormOpen, setIsFormOpen] = useState(false);

  const handlePrint = (id: number) => {
    // Futura integração com geração de PDF
    console.log(`Gerando PDF da OS #${id}`);
    alert(`Gerando PDF da OS #${id}`);
  };

  return (
    <div className="os-container">
      <div className="os-header">
        <h2>Gerenciamento de Ordens de Serviço</h2>
        <button className="btn-primary" onClick={() => setIsFormOpen(true)}>
          <Plus size={20} />
          Nova OS
        </button>
      </div>

      <div className="os-grid">
        {mockedOrders.map((order) => (
          <div key={order.id} className="os-card">
            <div className="os-card-header">
              <span className="os-number">OS #{order.id}</span>
              <span className={`os-status status-${order.status.toLowerCase().replace(' ', '-')}`}>
                {order.status}
              </span>
            </div>
            
            <div className="os-card-body">
              <p><strong>Cliente:</strong> {order.client}</p>
              <p><strong>Veículo:</strong> {order.vehicle}</p>
              <div className="os-service-box">
                <FileText size={16} className="text-gray-400" />
                <span>{order.service}</span>
              </div>
            </div>

            <div className="os-card-footer">
              <div className="os-values">
                <span className="labor">Mão de obra: R$ {order.labor.toFixed(2)}</span>
                <span className="total">Total: R$ {order.total.toFixed(2)}</span>
              </div>
              <button onClick={() => handlePrint(order.id)} className="btn-print" title="Imprimir OS">
                <Printer size={20} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {isFormOpen && (
        <ServiceOrderForm onClose={() => setIsFormOpen(false)} />
      )}
    </div>
  );
}