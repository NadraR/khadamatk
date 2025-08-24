import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { invoiceService } from '../services/invoiceService';
import './Invoices.css';

const Invoices = () => {
  const { t } = useTranslation();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const response = await invoiceService.getMyInvoices();
      setInvoices(response.data);
    } catch (err) {
      setError(t('invoices.fetchError'));
      console.error('Error fetching invoices:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (invoiceId) => {
    try {
      const response = await invoiceService.downloadInvoice(invoiceId);
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `invoice-${invoiceId}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download error:', error);
      alert(t('invoices.downloadError'));
    }
  };

  if (loading) return <div className="loading">{t('common.loading')}</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="invoices-page">
      <div className="page-header">
        <h1>{t('invoices.myInvoices')}</h1>
      </div>

      <div className="invoices-container">
        {invoices.length === 0 ? (
          <div className="no-data">
            <p>{t('invoices.noInvoices')}</p>
          </div>
        ) : (
          <div className="invoices-grid">
            {invoices.map(invoice => (
              <div key={invoice.id} className="invoice-card">
                <div className="invoice-header">
                  <h3>{t('invoices.invoice')} #{invoice.id}</h3>
                  <span className={`status status-${invoice.status}`}>
                    {t(`invoices.status.${invoice.status}`)}
                  </span>
                </div>

                <div className="invoice-body">
                  <div className="invoice-detail">
                    <span className="label">{t('invoices.service')}:</span>
                    <span className="value">{invoice.service_name_ar || invoice.service_name_en}</span>
                  </div>
                  
                  <div className="invoice-detail">
                    <span className="label">{t('invoices.amount')}:</span>
                    <span className="value amount">{invoice.amount} {t('currency')}</span>
                  </div>
                  
                  <div className="invoice-detail">
                    <span className="label">{t('invoices.issuedAt')}:</span>
                    <span className="value">
                      {new Date(invoice.issued_at).toLocaleDateString()}
                    </span>
                  </div>

                  {invoice.paid_at && (
                    <div className="invoice-detail">
                      <span className="label">{t('invoices.paidAt')}:</span>
                      <span className="value">
                        {new Date(invoice.paid_at).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>

                <div className="invoice-actions">
                  <button 
                    className="btn-download"
                    onClick={() => handleDownload(invoice.id)}
                  >
                    📄 {t('invoices.download')}
                  </button>
                  
                  {invoice.status === 'unpaid' && (
                    <button 
                      className="btn-pay"
                      onClick={() => window.open('/payment', '_blank')}
                    >
                      💳 {t('invoices.payNow')}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Invoices;
