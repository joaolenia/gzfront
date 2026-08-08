import { ArrowLeft, Printer, Edit } from 'lucide-react';
import './ServiceOrderDetail.css';

interface ServiceOrderDetailProps {
  orderId: number;
  onBack: () => void;
}

export function ServiceOrderDetail({ orderId, onBack }: ServiceOrderDetailProps) {
  // Dados mockados simulando o retorno do backend para a OS específica
  const orderDetails = {
    id: orderId,
    client: { name: 'ROBSON COSTA DA ROSA', cpf: '011.557.010-10', phone: '+55 (47) 9 9701-7867' },
    vehicle: { name: 'Ford - Fiesta S 1.0 8V Flex 5p', plate: 'MDB-5C06', year: '2014/2014', color: 'BRANCA' },
    info: { entryDate: '21/07/2026', deliveryDate: '21/07/2026', priority: 'NORMAL', mechanic: 'gzcentro' },
    request: 'DOR DO CLIENTE (Verificar barulho no motor e freios)',
    parts: [
      { id: 1, name: 'JOGO DE PISTAO', qty: 1, price: 1300.00, discount: 0 },
      { id: 2, name: 'BRONZINA BIELA', qty: 1, price: 170.00, discount: 0 },
      { id: 3, name: 'BRONZINA MANCAL', qty: 1, price: 170.00, discount: 0 },
      { id: 4, name: 'KIT JUNTAS', qty: 1, price: 298.00, discount: 0 },
      { id: 5, name: 'OLEO MOTOR', qty: 4, price: 37.52, discount: 0 },
    ],
    services: [
      { id: 1, name: 'RETIFICA BLOCO/CABEÇOTE', qty: 1, price: 1700.00, discount: 0 },
      { id: 2, name: 'MAO DE OBRA', qty: 1, price: 2000.00, discount: 0 },
    ]
  };

  const handlePrint = () => {
    window.print();
  };

  const totalParts = orderDetails.parts.reduce((acc, part) => acc + (part.qty * part.price - part.discount), 0);
  const totalServices = orderDetails.services.reduce((acc, srv) => acc + (srv.qty * srv.price - srv.discount), 0);

  return (
    <div className="os-detail-container">
      {/* Barra de Ações - Oculta na impressão */}
      <div className="actions-bar no-print">
        <button className="btn-back" onClick={onBack}>
          <ArrowLeft size={20} /> Voltar
        </button>
        <div className="actions-right">
          <button className="btn-edit">
            <Edit size={20} /> Editar OS
          </button>
          <button className="btn-print-action" onClick={handlePrint}>
            <Printer size={20} /> Imprimir
          </button>
        </div>
      </div>

      {/* Área Imprimível (A4) */}
      <div className="printable-area">
        <div className="print-header">
          <div className="logo-box">
            <h1>GZ</h1>
            <p>CENTRO AUTOMOTIVO</p>
          </div>
          <div className="company-info">
            <h2>Gz centro automotivo</h2>
            <p>CNPJ: 65.310.288/0001-46 - Cel.: +55 (47)9 9701-7867</p>
          </div>
        </div>

        <div className="print-info-grid">
          <div className="info-column">
            <p><strong>Nome do cliente:</strong> {orderDetails.client.name}</p>
            <p><strong>Nº O.S.:</strong> {orderDetails.id}</p>
            <p><strong>Veículo:</strong> {orderDetails.vehicle.name}</p>
            <p><strong>Placa:</strong> {orderDetails.vehicle.plate} - <strong>Ano/Modelo:</strong> {orderDetails.vehicle.year}</p>
            <p><strong>Data entrada:</strong> {orderDetails.info.entryDate} - <strong>Previsão entrega:</strong> {orderDetails.info.deliveryDate}</p>
            <p><strong>Responsável:</strong> {orderDetails.info.mechanic}</p>
          </div>
          <div className="info-column">
            <p><strong>CPF:</strong> {orderDetails.client.cpf}</p>
            <p><strong>Prioridade:</strong> {orderDetails.info.priority}</p>
            <p><strong>Tel.:</strong> {orderDetails.client.phone}</p>
            <p><strong>Cor veículo:</strong> {orderDetails.vehicle.color}</p>
          </div>
        </div>

        <div className="section-title mt-4">
          <h3>Solicitações do cliente</h3>
        </div>
        <div className="client-request-box">
          <p>{orderDetails.request}</p>
        </div>

        {/* Tabela de Peças */}
        <div className="section-title mt-4">
          <h3>Lista de peças</h3>
        </div>
        <table className="print-table">
          <thead>
            <tr>
              <th className="text-left">Nome da peça</th>
              <th>Quantidade</th>
              <th>Preço</th>
              <th>Desconto</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {orderDetails.parts.map(part => (
              <tr key={part.id}>
                <td>{part.name}</td>
                <td className="text-center">{part.qty}</td>
                <td className="text-center">R$ {part.price.toFixed(2)}</td>
                <td className="text-center">R$ {part.discount.toFixed(2)}</td>
                <td className="text-center">R$ {(part.qty * part.price - part.discount).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="totals-row">
          <p><strong>Totais:</strong> R$ {totalParts.toFixed(2)}</p>
        </div>
        <div className="final-total">
          <h4>Total peças: R$ {totalParts.toFixed(2)}</h4>
        </div>

        {/* Tabela de Serviços */}
        <div className="section-title mt-4">
          <h3>Lista de serviços</h3>
        </div>
        <table className="print-table">
          <thead>
            <tr>
              <th className="text-left">Nome do serviço</th>
              <th>Quantidade</th>
              <th>Preço</th>
              <th>Desconto</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {orderDetails.services.map(srv => (
              <tr key={srv.id}>
                <td>{srv.name}</td>
                <td className="text-center">{srv.qty}</td>
                <td className="text-center">R$ {srv.price.toFixed(2)}</td>
                <td className="text-center">R$ {srv.discount.toFixed(2)}</td>
                <td className="text-center">R$ {(srv.qty * srv.price - srv.discount).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="totals-row">
          <p><strong>Totais:</strong> R$ {totalServices.toFixed(2)}</p>
        </div>
        <div className="final-total">
          <h4>Total serviços: R$ {totalServices.toFixed(2)}</h4>
        </div>
        
        <div className="grand-total">
          <h2>TOTAL GERAL: R$ {(totalParts + totalServices).toFixed(2)}</h2>
        </div>
      </div>
    </div>
  );
}