import React, { useState, useEffect } from 'react';
import { Order, OrderStatus, PaymentStatus } from '../types';
import { FaWhatsapp, FaUser, FaMapMarkerAlt, FaTimes, FaCalendarAlt, FaClock, FaShare } from 'react-icons/fa';
import Receipt from './Receipt';
import './Receipt.css';

interface OrderDetailsModalProps {
    order: Order;
    onClose: () => void;
    updateOrderStatus: (orderId: string, newStatus: OrderStatus) => void;
    updatePaymentStatus: (orderId: string, newStatus: PaymentStatus) => void;
}

const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({ order, onClose, updateOrderStatus, updatePaymentStatus }) => {

    const [currentStatus, setCurrentStatus] = useState(order.status);
    const [currentPaymentStatus, setCurrentPaymentStatus] = useState(order.payment_status);
    const [isPrinting, setIsPrinting] = useState(false);
    const [printFormat, setPrintFormat] = useState<'A4' | '80mm'>('A4');

    const handleSave = () => {
        if (currentStatus !== order.status) {
            updateOrderStatus(order.id, currentStatus);
        }
        if (currentPaymentStatus !== order.payment_status) {
            updatePaymentStatus(order.id, currentPaymentStatus);
        }
        onClose(); // Close modal after saving
    };

    useEffect(() => {
        const handleBeforePrint = () => setIsPrinting(true);
        const handleAfterPrint = () => {
            setIsPrinting(false);
            // Remove estilo dinâmico após imprimir
            const style = document.getElementById('dynamic-print-style');
            if (style && style.parentNode) style.parentNode.removeChild(style);
        };
        window.addEventListener('beforeprint', handleBeforePrint);
        window.addEventListener('afterprint', handleAfterPrint);
        return () => {
            window.removeEventListener('beforeprint', handleBeforePrint);
            window.removeEventListener('afterprint', handleAfterPrint);
        };
    }, []);

    const applyPrintFormatStyle = (format: 'A4' | '80mm') => {
        // Remove anterior se existir
        const prev = document.getElementById('dynamic-print-style');
        if (prev && prev.parentNode) prev.parentNode.removeChild(prev);
        const style = document.createElement('style');
        style.id = 'dynamic-print-style';
        style.type = 'text/css';
        if (format === '80mm') {
            style.innerHTML = `
                @page { size: 80mm auto; margin: 0; }
                @media print {
                  body { margin: 0 !important; }
                  #receipt-to-print { width: 80mm !important; max-width: 80mm !important; margin: 0 auto !important; }
                }
            `;
        } else {
            style.innerHTML = `
                @page { size: A4; margin: 12mm; }
                @media print {
                  #receipt-to-print { width: auto !important; max-width: 100% !important; margin: 0 auto !important; }
                }
            `;
        }
        document.head.appendChild(style);
    };

    const handleSaveAsPDF = () => {
        // Usa a mesma abordagem de nova janela, mas com instruções para salvar como PDF
        const win = window.open('', '_blank');
        if (!win) {
            alert('Não foi possível abrir uma nova janela. Verifique se o bloqueador de pop-ups está desativado.');
            return;
        }

        const currency = (value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
        const itemsRows = order.items.map(item => `
            <tr>
              <td style="padding:6px;border-bottom:1px dotted #ccc">${item.quantity}</td>
              <td style="padding:6px;border-bottom:1px dotted #ccc">${item.productName}</td>
              <td style="padding:6px;border-bottom:1px dotted #ccc;text-align:right">${currency(item.price)}</td>
              <td style="padding:6px;border-bottom:1px dotted #ccc;text-align:right">${currency(item.quantity * item.price)}</td>
            </tr>
        `).join('');

        // CSS específico para cada formato de impressão
        const pageCss = printFormat === '80mm'
            ? `@page { size: 80mm auto; margin: 5mm; } 
               #sheet { width:70mm; margin:0 auto; }
               body { font-size: 14px; }
               h2 { font-size: 18px; }
               table { font-size: 14px; }
               .total { font-size: 16px; }
               th, td { padding: 6px 4px; }`
            : `@page { size: A4; margin: 15mm; } 
               #sheet { max-width: 800px; margin:0 auto; }
               body { font-size: 16px; }
               h2 { font-size: 22px; }
               table { font-size: 16px; }
               .total { font-size: 18px; }
               th, td { padding: 8px 6px; }`;

        const html = `<!doctype html>
        <html>
          <head>
            <meta charset="utf-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            <title>Recibo #${order.id.slice(-6)}</title>
            <style>
              html, body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
              body { 
                margin:0; 
                font-family: 'Courier New', Courier, monospace !important; 
                color:#000 !important; 
                line-height: 1.5 !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
                font-weight: bold !important;
                font-size: 16px !important;
              }
              ${pageCss}
              #sheet { background:#fff; padding:15px; }
              h2 { text-align:center; margin:0 0 10px 0; font-weight: bold !important; font-size: 20px !important; }
              p { margin: 8px 0; font-weight: bold !important; font-size: 16px !important; }
              table { width:100%; border-collapse:collapse; }
              th { font-weight: bold !important; border-bottom: 2px solid #000; font-size: 16px !important; }
              td { border-bottom: 1px dotted #ccc; font-weight: bold !important; font-size: 16px !important; }
              .total { text-align:right; margin-top:15px; font-weight:bold !important; font-size: 18px !important; }
              .footer { text-align:center; margin-top:20px; font-weight: bold !important; font-size: 16px !important; }
              @media print { 
                body * { visibility: visible !important; } 
                @page { color-adjust: exact; print-color-adjust: exact; -webkit-print-color-adjust: exact; }
              }
              .pdf-instructions {
                background-color: #f0f8ff;
                border: 1px solid #4682b4;
                padding: 15px;
                margin: 20px 0;
                border-radius: 5px;
                text-align: center;
                font-family: Arial, sans-serif;
              }
              .pdf-instructions h3 {
                margin-top: 0;
                color: #4682b4;
                font-size: 18px;
              }
              .pdf-instructions p {
                margin-bottom: 5px;
                font-size: 16px;
              }
              .pdf-instructions button {
                font-size: 16px;
                font-weight: bold;
                padding: 10px 20px;
              }
              @media print {
                .pdf-instructions {
                  display: none;
                }
              }
            </style>
          </head>
          <body>
            <div class="pdf-instructions">
              <h3>Instruções para Salvar como PDF</h3>
              <p>1. Clique no botão de impressão abaixo ou pressione Ctrl+P (ou Cmd+P no Mac)</p>
              <p>2. Na janela de impressão, selecione "Salvar como PDF" ou "Microsoft Print to PDF"</p>
              <p>3. Escolha o local para salvar o arquivo e clique em Salvar</p>
              <button onclick="window.print()" style="background:#4682b4; color:white; border:none; padding:10px 20px; border-radius:4px; cursor:pointer; margin-top:10px;">Abrir Janela de Impressão</button>
            </div>
            
            <div id="sheet">
              <h2>Recibo</h2>
              <p>Pedido #${order.id.slice(-6)}</p>
              <p><strong>Cliente:</strong> ${order.customer.name}<br/>
                 <strong>Endereço:</strong> ${order.customer.address}</p>
              <table>
                <thead>
                  <tr>
                    <th style="text-align:left">Qtd</th>
                    <th style="text-align:left">Produto</th>
                    <th style="text-align:right">Preço Unit.</th>
                    <th style="text-align:right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsRows}
                </tbody>
              </table>
              <div class="total">Total a Pagar: ${currency(order.total)}</div>
              <div class="footer">Obrigado pela sua preferência!</div>
            </div>
          </body>
        </html>`;

        win.document.open();
        win.document.write(html);
        win.document.close();
        win.focus();
    };

    // Fallback: imprimir em nova janela (isola CSS/HTML e evita interferência do DOM atual)
    const handlePrintNewWindow = () => {
        const win = window.open('', '_blank');
        if (!win) return;

        const currency = (value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
        const itemsRows = order.items.map(item => `
            <tr>
              <td style="padding:6px;border-bottom:1px dotted #ccc">${item.quantity}</td>
              <td style="padding:6px;border-bottom:1px dotted #ccc">${item.productName}</td>
              <td style="padding:6px;border-bottom:1px dotted #ccc;text-align:right">${currency(item.price)}</td>
              <td style="padding:6px;border-bottom:1px dotted #ccc;text-align:right">${currency(item.quantity * item.price)}</td>
            </tr>
        `).join('');

        // CSS específico para cada formato de impressão
        const pageCss = printFormat === '80mm'
            ? `@page { size: 80mm auto; margin: 5mm; } 
               #sheet { width:70mm; margin:0 auto; }
               body { font-size: 14px; }
               h2 { font-size: 18px; }
               table { font-size: 14px; }
               .total { font-size: 16px; }
               th, td { padding: 6px 4px; }`
            : `@page { size: A4; margin: 15mm; } 
               #sheet { max-width: 800px; margin:0 auto; }
               body { font-size: 16px; }
               h2 { font-size: 22px; }
               table { font-size: 16px; }
               .total { font-size: 18px; }
               th, td { padding: 8px 6px; }`;

        const html = `<!doctype html>
        <html>
          <head>
            <meta charset="utf-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            <title>Recibo #${order.id.slice(-6)}</title>
            <style>
              html, body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
              body { 
                margin:0; 
                font-family: 'Courier New', Courier, monospace !important; 
                color:#000 !important; 
                line-height: 1.5 !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
                font-weight: bold !important;
                font-size: 16px !important;
              }
              ${pageCss}
              #sheet { background:#fff; padding:15px; }
              h2 { text-align:center; margin:0 0 10px 0; font-weight: bold !important; font-size: 20px !important; }
              p { margin: 8px 0; font-weight: bold !important; font-size: 16px !important; }
              table { width:100%; border-collapse:collapse; }
              th { font-weight: bold !important; border-bottom: 2px solid #000; font-size: 16px !important; }
              td { border-bottom: 1px dotted #ccc; font-weight: bold !important; font-size: 16px !important; }
              .total { text-align:right; margin-top:15px; font-weight:bold !important; font-size: 18px !important; }
              .footer { text-align:center; margin-top:20px; font-weight: bold !important; font-size: 16px !important; }
              @media print { 
                body * { visibility: visible !important; } 
                @page { color-adjust: exact; print-color-adjust: exact; -webkit-print-color-adjust: exact; }
              }
            </style>
          </head>
          <body>
            <div id="sheet">
              <h2>Recibo</h2>
              <p>Pedido #${order.id.slice(-6)}</p>
              <p><strong>Cliente:</strong> ${order.customer.name}<br/>
                 <strong>Endereço:</strong> ${order.customer.address}</p>
              <table>
                <thead>
                  <tr>
                    <th style="text-align:left">Qtd</th>
                    <th style="text-align:left">Produto</th>
                    <th style="text-align:right">Preço Unit.</th>
                    <th style="text-align:right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsRows}
                </tbody>
              </table>
              <div class="total">Total a Pagar: ${currency(order.total)}</div>
              <div class="footer">Obrigado pela sua preferência!</div>
            </div>
            <script>
              window.addEventListener('load', function(){
                setTimeout(function(){ window.print(); }, 100);
              });
              window.addEventListener('afterprint', function(){ window.close(); });
            </script>
          </body>
        </html>`;

        win.document.open();
        win.document.write(html);
        win.document.close();
        win.focus();
    };



    const handleShareWhatsApp = () => {
        const itemsText = order.items.map(item => 
            `${item.quantity}x ${item.productName} - ${(item.quantity * item.price).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`
        ).join('\n');

        const message = `
*Olá, ${order.customer.name}!*

Segue o comprovante do seu pedido *#${order.id.slice(-6)}*:
-----------------------------------
${itemsText}
-----------------------------------
*Total: ${order.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}*

Obrigado pela sua preferência!
        `;

        const whatsappUrl = `https://wa.me/${order.customer.whatsapp}?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
    };

    return (
        <>
            <div className={`fixed inset-0 bg-black bg-opacity-60 z-40 flex justify-center items-start overflow-y-auto py-4`} onClick={onClose}>
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-4 sm:p-6 w-full max-w-2xl m-4 transform transition-all" onClick={e => e.stopPropagation()}>
                    <div className="flex justify-between items-center border-b pb-3 mb-4 dark:border-gray-600">
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Detalhes do Pedido #{order.id.slice(-6)}</h2>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                            <FaTimes size={24} />
                        </button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        {/* Customer Info */}
                        <div className="space-y-3">
                            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Informações do Cliente</h3>
                            <div className="flex items-center space-x-3 text-gray-600 dark:text-gray-300">
                                <FaUser className="text-purple-500 flex-shrink-0"/>
                                <span>{order.customer.name}</span>
                            </div>
                            <div className="flex items-start space-x-3 text-gray-600 dark:text-gray-300">
                                <FaMapMarkerAlt className="text-purple-500 flex-shrink-0 mt-1"/>
                                <span>{order.customer.address}</span>
                            </div>
                            <a 
                                href={`https://wa.me/${order.customer.whatsapp}`}
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="inline-flex items-center space-x-3 text-green-500 hover:text-green-600"
                            >
                                <FaWhatsapp />
                                <span>{order.customer.whatsapp}</span>
                            </a>
                        </div>

                        {/* Scheduling Info */}
                        {order.data_agendamento && (
                            <div className="space-y-3">
                                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Agendamento</h3>
                                <div className="flex items-center space-x-3 text-gray-600 dark:text-gray-300">
                                    <FaCalendarAlt className="text-purple-500 flex-shrink-0"/>
                                    <span>{new Date(order.data_agendamento).toLocaleDateString('pt-BR')}</span>
                                </div>
                                <div className="flex items-center space-x-3 text-gray-600 dark:text-gray-300">
                                    <FaClock className="text-purple-500 flex-shrink-0"/>
                                    <span>{order.turno} - {order.horario_agendamento}</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Order Items */}
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">Itens do Pedido</h3>
                        <div className="space-y-2 max-h-40 sm:max-h-48 overflow-y-auto pr-2 -mr-2">
                        {order.items.map(item => (
                            <div key={item.productId} className="flex justify-between items-center text-gray-600 dark:text-gray-300">
                                <p className="truncate pr-2">{item.quantity}x {item.productName}</p>
                                <p className="whitespace-nowrap">{(item.quantity * item.price).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                            </div>
                        ))}
                        </div>
                        <div className="flex justify-between items-center mt-3 pt-3 border-t dark:border-gray-600">
                                <p className="font-bold text-gray-800 dark:text-white">Total:</p>
                                <p className="font-bold text-lg text-purple-600 dark:text-purple-400">{order.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">Mudar Status do Pedido</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">Status atual: <span className='font-bold'>{currentStatus}</span></p>
                            <div className="flex flex-wrap gap-2">
                                {order.status === OrderStatus.Aguardando && (
                                    <button onClick={() => setCurrentStatus(OrderStatus.EmPreparo)} className={`px-3 py-2 text-sm text-white rounded-lg transition-colors ${currentStatus === OrderStatus.EmPreparo ? 'bg-blue-600' : 'bg-blue-400 hover:bg-blue-500'}`}>
                                        Aprovar / Em Preparo
                                    </button>
                                )}
                                {order.status === OrderStatus.EmPreparo && (
                                    <button onClick={() => setCurrentStatus(OrderStatus.Concluido)} className={`px-3 py-2 text-sm text-white rounded-lg transition-colors ${currentStatus === OrderStatus.Concluido ? 'bg-green-600' : 'bg-green-400 hover:bg-green-500'}`}>
                                        Marcar como Concluído
                                    </button>
                                )}
                                {order.status !== OrderStatus.Cancelado && order.status !== OrderStatus.Concluido && (
                                    <button onClick={() => setCurrentStatus(OrderStatus.Cancelado)} className={`px-3 py-2 text-sm text-white rounded-lg transition-colors ${currentStatus === OrderStatus.Cancelado ? 'bg-red-600' : 'bg-red-400 hover:bg-red-500'}`}>
                                        Cancelar Pedido
                                    </button>
                                )}
                            </div>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">Mudar Status do Pagamento</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">Status atual: <span className='font-bold'>{currentPaymentStatus}</span></p>
                            <select
                                value={currentPaymentStatus}
                                onChange={(e) => setCurrentPaymentStatus(e.target.value as PaymentStatus)}
                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-purple-500 focus:border-purple-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-purple-500 dark:focus:border-purple-500"
                            >
                                {Object.values(PaymentStatus).map(status => (
                                    <option key={status} value={status}>{status}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Save and Print Buttons */}
                    <div className="mt-8 pt-6 border-t dark:border-gray-600 flex flex-col md:flex-row md:flex-wrap md:justify-between gap-3">
                        <button 
                            onClick={handleSave}
                            className="w-full md:w-auto min-w-[180px] px-6 py-2.5 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                            disabled={currentStatus === order.status && currentPaymentStatus === order.payment_status}
                        >
                            Salvar Alterações
                        </button>
                        <button 
                            onClick={handleSaveAsPDF}
                            className="w-full md:w-auto min-w-[180px] px-6 py-2.5 bg-blue-500 text-white font-bold rounded-lg hover:bg-blue-600 transition-colors"
                        >
                            Salvar como PDF
                        </button>
                        <button 
                            onClick={handlePrintNewWindow}
                            className="w-full md:w-auto min-w-[180px] px-6 py-2.5 bg-gray-500 text-white font-bold rounded-lg hover:bg-gray-600 transition-colors"
                        >
                            Imprimir (Nova Janela)
                        </button>
                        <div className="w-full md:w-auto">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Formato da Página</label>
                            <select
                                value={printFormat}
                                onChange={(e) => setPrintFormat(e.target.value as 'A4' | '80mm')}
                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-purple-500 focus:border-purple-500 block w-full md:w-auto md:min-w-[220px] p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-purple-500 dark:focus:border-purple-500"
                            >
                                <option value="A4">A4</option>
                                <option value="80mm">Térmico 80mm</option>
                            </select>
                        </div>
                        <button 
                            onClick={handleShareWhatsApp}
                            className="w-full md:w-auto min-w-[180px] px-6 py-2.5 bg-green-500 text-white font-bold rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
                        >
                            <FaShare /> Compartilhar
                        </button>
                    </div>
                </div>
            </div>
            {/* Recibo oculto (fora de vista) para impressão */}
            <div id="receipt-to-print" style={{ position: 'absolute', left: '-10000px', top: 0, width: 0, height: 0, overflow: 'hidden' }}>
                <Receipt order={order} />
            </div>
        </>
    );
};

export default OrderDetailsModal;