import { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Printer,
  Plus,
  Trash2,
  Save,
  X,
  Loader2,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { api } from '../../services/api';
import './ServiceOrderDetail.css';

interface ServiceOrderDetailProps {
  orderId: number;
  onBack: () => void;
}

export function ServiceOrderDetail({
  orderId,
  onBack
}: ServiceOrderDetailProps) {
  const [originalOrder, setOriginalOrder] = useState<any>(null);
  const [order, setOrder] = useState<any>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const formatCurrency = (
    value: number | string | null | undefined
  ) => {
    if (value === '' || value === null || value === undefined) {
      return '0,00';
    }

    const numericValue =
      typeof value === 'number'
        ? value
        : parseCurrency(value);

    return numericValue.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const formatCurrencyInput = (value: string) => {
    if (!value) return '';

    let cleaned = value
      .replace(/[^\d,.-]/g, '')
      .replace(/\./g, '');

    const hasComma = cleaned.includes(',');

    if (hasComma) {
      const parts = cleaned.split(',');
      const integerPart = parts[0].replace(/\D/g, '');
      const decimalPart = parts
        .slice(1)
        .join('')
        .replace(/\D/g, '')
        .slice(0, 2);

      if (!integerPart && !decimalPart) {
        return '';
      }

      return decimalPart.length > 0
        ? `${integerPart || '0'},${decimalPart}`
        : `${integerPart || '0'},`;
    }

    return cleaned.replace(/\D/g, '');
  };

  const parseCurrency = (value: string | number) => {
    if (typeof value === 'number') {
      return value;
    }

    if (!value) {
      return 0;
    }

    let normalized = value
      .toString()
      .trim()
      .replace(/[R$\s]/g, '');

    if (normalized.includes(',')) {
      normalized = normalized
        .replace(/\./g, '')
        .replace(',', '.');
    } else {
      normalized = normalized.replace(/[^\d.-]/g, '');
    }

    const numericValue = Number(normalized);

    return Number.isNaN(numericValue) ? 0 : numericValue;
  };

  const handleCurrencyBlur = (
    listName: 'parts' | 'services',
    id: string,
    field: 'price' | 'discount',
    value: string
  ) => {
    if (!value) {
      handleListChange(listName, id, field, '');
      return;
    }

    const numericValue = parseCurrency(value);

    handleListChange(
      listName,
      id,
      field,
      formatCurrency(numericValue)
    );
  };

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(
        () => setNotification(null),
        3000
      );

      return () => clearTimeout(timer);
    }
  }, [notification]);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const response = await api.get(`/os/${orderId}`);

        const data = {
          ...response.data,
          parts: response.data.parts || [],
          services: response.data.services || []
        };

        setOriginalOrder(data);
        setOrder(data);
      } catch (error) {
        console.error(
          'Erro ao buscar detalhes da OS:',
          error
        );

        setNotification({
          type: 'error',
          message:
            'Erro ao carregar detalhes da Ordem de Serviço.'
        });

        setTimeout(onBack, 2000);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId, onBack]);

  useEffect(() => {
    if (order && originalOrder) {
      const hasChanges =
        JSON.stringify(originalOrder) !==
        JSON.stringify(order);

      setIsDirty(hasChanges);
    }
  }, [order, originalOrder]);

  const handlePrint = () => {
    window.print();
  };

  const handleSave = async () => {
    setIsSaving(true);
    setNotification(null);

    try {
      const payload = {
        ...order,

        parts: order.parts.map((p: any) => ({
          ...p,
          qty: Number(p.qty) || 0,
          price: parseCurrency(p.price),
          discount: parseCurrency(p.discount)
        })),

        services: order.services.map((s: any) => ({
          ...s,
          qty: Number(s.qty) || 0,
          price: parseCurrency(s.price),
          discount: parseCurrency(s.discount)
        }))
      };

      await api.patch(`/os/${order.id}`, payload);

      const displayOrder = {
        ...payload,
        parts: payload.parts.map((p: any) => ({
          ...p,
          price:
            p.price === ''
              ? ''
              : formatCurrency(p.price),
          discount:
            p.discount === ''
              ? ''
              : formatCurrency(p.discount)
        })),
        services: payload.services.map((s: any) => ({
          ...s,
          price:
            s.price === ''
              ? ''
              : formatCurrency(s.price),
          discount:
            s.discount === ''
              ? ''
              : formatCurrency(s.discount)
        }))
      };

      setOriginalOrder(displayOrder);
      setOrder(displayOrder);

      setNotification({
        type: 'success',
        message: 'Alterações salvas com sucesso!'
      });
    } catch (error) {
      console.error('Erro ao salvar:', error);

      setNotification({
        type: 'error',
        message: 'Erro ao salvar as alterações.'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setOrder(originalOrder);
  };

  const handleFieldChange = (
    field: string,
    value: string
  ) => {
    setOrder((prev: any) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleListChange = (
    listName: 'parts' | 'services',
    id: string,
    field: string,
    value: string | number
  ) => {
    setOrder((prev: any) => ({
      ...prev,
      [listName]: prev[listName].map((item: any) =>
        item.id === id
          ? {
              ...item,
              [field]: value
            }
          : item
      )
    }));
  };

  const handleCurrencyChange = (
    listName: 'parts' | 'services',
    id: string,
    field: 'price' | 'discount',
    value: string
  ) => {
    const formattedValue =
      formatCurrencyInput(value);

    handleListChange(
      listName,
      id,
      field,
      formattedValue
    );
  };

  const addListItem = (
    listName: 'parts' | 'services'
  ) => {
    const newItem = {
      id: crypto.randomUUID(),
      name: '',
      qty: 1,
      price: '',
      discount: ''
    };

    setOrder((prev: any) => ({
      ...prev,
      [listName]: [
        ...prev[listName],
        newItem
      ]
    }));
  };

  const removeListItem = (
    listName: 'parts' | 'services',
    id: string
  ) => {
    setOrder((prev: any) => ({
      ...prev,
      [listName]: prev[listName].filter(
        (item: any) => item.id !== id
      )
    }));
  };

  if (isLoading || !order) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-gray-500">
        <Loader2
          size={40}
          className="animate-spin mb-4 text-blue-600"
        />
        <p>Carregando detalhes do documento...</p>
      </div>
    );
  }

  const totalParts = order.parts.reduce(
    (acc: number, part: any) =>
      acc +
      Number(part.qty || 0) *
        parseCurrency(part.price) -
      parseCurrency(part.discount),
    0
  );

  const totalServices = order.services.reduce(
    (acc: number, srv: any) =>
      acc +
      Number(srv.qty || 0) *
        parseCurrency(srv.price) -
      parseCurrency(srv.discount),
    0
  );

  const grandTotal =
    totalParts + totalServices;

  return (
    <div className="osd-container">
      {notification && (
        <div
          className={`osd-notification-popup ${notification.type}`}
        >
          {notification.type === 'success' ? (
            <CheckCircle2 size={24} />
          ) : (
            <AlertCircle size={24} />
          )}

          <span>{notification.message}</span>

          <div className="osd-progress-bar"></div>
        </div>
      )}

      <div className="osd-actions-bar no-print">
        <button
          className="osd-btn-back"
          onClick={onBack}
        >
          <ArrowLeft size={20} />
          Voltar
        </button>

        <button
          className="osd-btn-print"
          onClick={handlePrint}
        >
          <Printer size={20} />
          Gerar PDF / Imprimir
        </button>
      </div>

      <div className="osd-printable-area">
        <div className="osd-document-wrapper">
          <div className="osd-header">
            <div className="osd-logo-box">
              <h1>GZ</h1>
              <p>CENTRO AUTOMOTIVO</p>
            </div>

            <div className="osd-company-info">
              <h2>
                DOCUMENTO DE ORDEM DE SERVIÇO
              </h2>

              <p>
                <strong>
                  Gz Centro Automotivo
                </strong>
              </p>

              <p>
                CNPJ: 65.310.288/0001-46 |
                Cel.: +55 (47) 9 9701-7867
              </p>
            </div>

            <div className="osd-doc-number">
              <span>Nº DA O.S.</span>
              <strong>{order.id}</strong>
            </div>
          </div>

          <div className="osd-info-grid">
            <div className="osd-column">
              <div className="osd-edit-row">
                <label>Cliente:</label>

                <input
                  type="text"
                  value={order.clientName || ''}
                  onChange={e =>
                    handleFieldChange(
                      'clientName',
                      e.target.value
                    )
                  }
                  className="osd-input-flex"
                />
              </div>

              <div className="osd-edit-row">
                <label>Veículo:</label>

                <input
                  type="text"
                  value={order.vehicleName || ''}
                  onChange={e =>
                    handleFieldChange(
                      'vehicleName',
                      e.target.value
                    )
                  }
                  className="osd-input-flex"
                />
              </div>

              <div className="osd-edit-row">
                <label>Placa:</label>

                <input
                  type="text"
                  value={order.vehiclePlate || ''}
                  onChange={e =>
                    handleFieldChange(
                      'vehiclePlate',
                      e.target.value
                    )
                  }
                  className="osd-input-w24"
                />

                <label className="osd-ml2">
                  Ano/Mod:
                </label>

                <input
                  type="text"
                  value={order.vehicleYear || ''}
                  onChange={e =>
                    handleFieldChange(
                      'vehicleYear',
                      e.target.value
                    )
                  }
                  className="osd-input-w24"
                />
              </div>

              <div className="osd-edit-row">
                <label>Entrada:</label>

                <input
                  type="date"
                  value={order.entryDate || ''}
                  onChange={e =>
                    handleFieldChange(
                      'entryDate',
                      e.target.value
                    )
                  }
                  className="osd-input-w32"
                />

                <label className="osd-ml2">
                  Entrega:
                </label>

                <input
                  type="date"
                  value={
                    order.deliveryDate || ''
                  }
                  onChange={e =>
                    handleFieldChange(
                      'deliveryDate',
                      e.target.value
                    )
                  }
                  className="osd-input-w32"
                />
              </div>
            </div>

            <div className="osd-column">
              <div className="osd-edit-row">
                <label>CPF:</label>

                <input
                  type="text"
                  value={order.clientCpf || ''}
                  onChange={e =>
                    handleFieldChange(
                      'clientCpf',
                      e.target.value
                    )
                  }
                  className="osd-input-flex"
                />
              </div>

              <div className="osd-edit-row">
                <label>Telefone:</label>

                <input
                  type="text"
                  value={
                    order.clientPhone || ''
                  }
                  onChange={e =>
                    handleFieldChange(
                      'clientPhone',
                      e.target.value
                    )
                  }
                  className="osd-input-flex"
                />
              </div>

              <div className="osd-edit-row">
                <label>Cor:</label>

                <input
                  type="text"
                  value={
                    order.vehicleColor || ''
                  }
                  onChange={e =>
                    handleFieldChange(
                      'vehicleColor',
                      e.target.value
                    )
                  }
                  className="osd-input-flex"
                  placeholder="Cor..."
                />

                <label>Prioridade:</label>

                <select
                  value={
                    order.priority || 'Normal'
                  }
                  onChange={e =>
                    handleFieldChange(
                      'priority',
                      e.target.value
                    )
                  }
                  className="osd-input-w24"
                >
                  <option value="Baixa">
                    Baixa
                  </option>
                  <option value="Normal">
                    Normal
                  </option>
                  <option value="Alta">
                    Alta
                  </option>
                  <option value="Urgente">
                    Urgente
                  </option>
                </select>
              </div>

              <div className="osd-edit-row">
                <label>Responsável:</label>

                <input
                  type="text"
                  value={order.mechanic || ''}
                  onChange={e =>
                    handleFieldChange(
                      'mechanic',
                      e.target.value
                    )
                  }
                  className="osd-input-flex"
                  placeholder="Mecânico..."
                />

                <label>Status:</label>

                <select
                  value={
                    order.status || 'Pendente'
                  }
                  onChange={e =>
                    handleFieldChange(
                      'status',
                      e.target.value
                    )
                  }
                  className="osd-input-w32 osd-status-select"
                >
                  <option value="Pendente">
                    Pendente
                  </option>

                  <option value="Em andamento">
                    Em andamento
                  </option>

                  <option value="Concluído">
                    Concluído
                  </option>
                </select>
              </div>
            </div>
          </div>

          <div className="osd-section-wrapper">
            <div className="osd-section-title">
              <h3>
                Solicitações e Observações do Cliente
              </h3>
            </div>

            <div className="osd-textarea-box">
              <textarea
                value={
                  order.clientRequest || ''
                }
                onChange={e =>
                  handleFieldChange(
                    'clientRequest',
                    e.target.value
                  )
                }
                className="osd-textarea"
                rows={2}
                placeholder="Detalhes adicionais, reclamações, apontamentos..."
              />
            </div>
          </div>

          <div className="osd-section-wrapper">
            <div className="osd-section-title osd-flex-between">
              <h3>Relação de Peças</h3>

              <button
                className="osd-btn-add no-print"
                onClick={() =>
                  addListItem('parts')
                }
              >
                <Plus size={14} />
                Add Peça
              </button>
            </div>

            <table className="osd-table">
              <thead>
                <tr>
                  <th className="osd-text-left">
                    Descrição da Peça
                  </th>

                  <th className="osd-w16">
                    Qtd
                  </th>

                  <th className="osd-w28">
                    Preço Unit.
                  </th>

                  <th className="osd-w28">
                    Desc.
                  </th>

                  <th className="osd-w32">
                    Subtotal
                  </th>

                  <th className="osd-w10 no-print"></th>
                </tr>
              </thead>

              <tbody>
                {order.parts.map((part: any) => {
                  const subtotal =
                    Number(part.qty || 0) *
                      parseCurrency(
                        part.price
                      ) -
                    parseCurrency(
                      part.discount
                    );

                  return (
                    <tr key={part.id}>
              
                      <td>
                        <textarea
                          value={part.name || ''}
                          onChange={e =>
                            handleListChange(
                              'parts',
                              part.id,
                              'name',
                              e.target.value
                            )
                          }
                          className="osd-table-input osd-desc-textarea"
                          placeholder="Ex: Filtro de Óleo"
                          rows={1}
                        />
                      </td>

                      <td>
                        <input
                          type="number"
                          value={part.qty}
                          onChange={e =>
                            handleListChange(
                              'parts',
                              part.id,
                              'qty',
                              e.target.value
                            )
                          }
                          className="osd-table-input osd-text-center"
                          min="1"
                        />
                      </td>

                      <td>
                        <div className="osd-currency-wrapper">
                          <span>R$</span>

                          <input
                            type="text"
                            inputMode="decimal"
                            value={
                              part.price === ''
                                ? ''
                                : typeof part.price ===
                                  'number'
                                ? formatCurrency(
                                    part.price
                                  )
                                : part.price
                            }
                            onChange={e =>
                              handleCurrencyChange(
                                'parts',
                                part.id,
                                'price',
                                e.target.value
                              )
                            }
                            onBlur={e =>
                              handleCurrencyBlur(
                                'parts',
                                part.id,
                                'price',
                                e.target.value
                              )
                            }
                            className="osd-table-input osd-text-right"
                            placeholder="0,00"
                          />
                        </div>
                      </td>

                      <td>
                        <div className="osd-currency-wrapper">
                          <span>R$</span>

                          <input
                            type="text"
                            inputMode="decimal"
                            value={
                              part.discount === ''
                                ? ''
                                : typeof part.discount ===
                                  'number'
                                ? formatCurrency(
                                    part.discount
                                  )
                                : part.discount
                            }
                            onChange={e =>
                              handleCurrencyChange(
                                'parts',
                                part.id,
                                'discount',
                                e.target.value
                              )
                            }
                            onBlur={e =>
                              handleCurrencyBlur(
                                'parts',
                                part.id,
                                'discount',
                                e.target.value
                              )
                            }
                            className="osd-table-input osd-text-right"
                            placeholder="0,00"
                          />
                        </div>
                      </td>

                      <td className="osd-text-right osd-align-middle osd-font-medium">
                        R$ {formatCurrency(subtotal)}
                      </td>

                      <td className="no-print osd-text-center">
                        <button
                          className="osd-btn-remove"
                          onClick={() =>
                            removeListItem(
                              'parts',
                              part.id
                            )
                          }
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            <div className="osd-totals-row">
              <p>
                Total Peças:{' '}
                <strong>
                  R$ {formatCurrency(totalParts)}
                </strong>
              </p>
            </div>
          </div>

          <div className="osd-section-wrapper">
            <div className="osd-section-title osd-flex-between">
              <h3>
                Relação de Serviços 
              </h3>

              <button
                className="osd-btn-add no-print"
                onClick={() =>
                  addListItem('services')
                }
              >
                <Plus size={14} />
                Add Serviço
              </button>
            </div>

            <table className="osd-table">
              <thead>
                <tr>
                  <th className="osd-text-left">
                    Descrição do Serviço
                  </th>

                  <th className="osd-w16">
                    Horas/Qtd
                  </th>

                  <th className="osd-w28">
                    Valor Unit.
                  </th>

                  <th className="osd-w28">
                    Desc.
                  </th>

                  <th className="osd-w32">
                    Subtotal
                  </th>

                  <th className="osd-w10 no-print"></th>
                </tr>
              </thead>

              <tbody>
                {order.services.map((srv: any) => {
                  const subtotal =
                    Number(srv.qty || 0) *
                      parseCurrency(
                        srv.price
                      ) -
                    parseCurrency(
                      srv.discount
                    );

                  return (
                    <tr key={srv.id}>
                  <td>
                        <textarea
                          value={srv.name || ''}
                          onChange={e =>
                            handleListChange(
                              'services',
                              srv.id,
                              'name',
                              e.target.value
                            )
                          }
                          className="osd-table-input osd-desc-textarea"
                          placeholder="Ex: Alinhamento e Balanceamento"
                          rows={1}
                        />
                      </td>

                      <td>
                        <input
                          type="number"
                          value={srv.qty}
                          onChange={e =>
                            handleListChange(
                              'services',
                              srv.id,
                              'qty',
                              e.target.value
                            )
                          }
                          className="osd-table-input osd-text-center"
                          min="1"
                        />
                      </td>

                      <td>
                        <div className="osd-currency-wrapper">
                          <span>R$</span>

                          <input
                            type="text"
                            inputMode="decimal"
                            value={
                              srv.price === ''
                                ? ''
                                : typeof srv.price ===
                                  'number'
                                ? formatCurrency(
                                    srv.price
                                  )
                                : srv.price
                            }
                            onChange={e =>
                              handleCurrencyChange(
                                'services',
                                srv.id,
                                'price',
                                e.target.value
                              )
                            }
                            onBlur={e =>
                              handleCurrencyBlur(
                                'services',
                                srv.id,
                                'price',
                                e.target.value
                              )
                            }
                            className="osd-table-input osd-text-right"
                            placeholder="0,00"
                          />
                        </div>
                      </td>

                      <td>
                        <div className="osd-currency-wrapper">
                          <span>R$</span>

                          <input
                            type="text"
                            inputMode="decimal"
                            value={
                              srv.discount === ''
                                ? ''
                                : typeof srv.discount ===
                                  'number'
                                ? formatCurrency(
                                    srv.discount
                                  )
                                : srv.discount
                            }
                            onChange={e =>
                              handleCurrencyChange(
                                'services',
                                srv.id,
                                'discount',
                                e.target.value
                              )
                            }
                            onBlur={e =>
                              handleCurrencyBlur(
                                'services',
                                srv.id,
                                'discount',
                                e.target.value
                              )
                            }
                            className="osd-table-input osd-text-right"
                            placeholder="0,00"
                          />
                        </div>
                      </td>

                      <td className="osd-text-right osd-align-middle osd-font-medium">
                        R$ {formatCurrency(subtotal)}
                      </td>

                      <td className="no-print osd-text-center">
                        <button
                          className="osd-btn-remove"
                          onClick={() =>
                            removeListItem(
                              'services',
                              srv.id
                            )
                          }
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            <div className="osd-totals-row">
              <p>
                Total Mão de Obra:{' '}
                <strong>
                  R${' '}
                  {formatCurrency(
                    totalServices
                  )}
                </strong>
              </p>
            </div>
          </div>

          <div className="osd-grand-total">
            <h3>TOTAL A PAGAR</h3>

            <h2>
              R$ {formatCurrency(grandTotal)}
            </h2>
          </div>

          <div
            className="osd-section-wrapper"
            style={{ marginTop: '2rem' }}
          >
            <div className="osd-section-title">
              <h3>Observações da Oficina:</h3>
            </div>

            <textarea
              value={order.observations || ''}
              onChange={e =>
                handleFieldChange(
                  'observations',
                  e.target.value
                )
              }
              className="osd-textarea osd-internal-notes"
              rows={3}
            />
          </div>

          <div className="osd-signatures">
            <div className="osd-signature-box">
              <div className="osd-signature-line"></div>

              <p>Assinatura do Cliente</p>

              <span>
                Reconheço e aprovo os serviços
                listados acima.
              </span>
            </div>

            <div className="osd-signature-box">
              <div className="osd-signature-line"></div>

              <p>Gz Centro Automotivo</p>

              <span>
                Responsável Técnico
              </span>
            </div>
          </div>
        </div>
      </div>

      {isDirty && (
        <div className="osd-floating-bar no-print">
          <span className="osd-floating-msg">
            Existem alterações pendentes.
          </span>

          <div className="osd-floating-actions">
            <button
              onClick={handleCancel}
              className="osd-btn-float-cancel"
              disabled={isSaving}
            >
              <X size={16} />
              Cancelar
            </button>

            <button
              onClick={handleSave}
              className="osd-btn-float-save"
              disabled={isSaving}
            >
              {isSaving ? (
                <Loader2
                  size={16}
                  className="animate-spin"
                />
              ) : (
                <Save size={16} />
              )}

              {isSaving
                ? 'Processando...'
                : 'Salvar Documento'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}