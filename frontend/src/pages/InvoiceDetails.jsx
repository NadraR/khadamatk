import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../services/ApiService"; // تم تعديل المسار
import { API_ENDPOINTS } from "../constants";
import PayInvoice from "../components/PayInvoice";

function InvoiceDetails() {
    const { id } = useParams();
    const [invoice, setInvoice] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function fetchInvoice() {
            try {
                const response = await api.get(API_ENDPOINTS.INVOICES.DETAIL(id));
                setInvoice(response);
            } catch {
                setError("فشل تحميل تفاصيل الفاتورة.");
            } finally {
                setLoading(false);
            }
        }
        fetchInvoice();
    }, [id]);

    const handleDownload = async () => {
        try {
            const response = await api.get(API_ENDPOINTS.INVOICES.DOWNLOAD(id), {
                responseType: "blob",
            });
            const url = window.URL.createObjectURL(new Blob([response]));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", `invoice_${id}.pdf`);
            document.body.appendChild(link);
            link.click();
        } catch {
            alert("فشل تحميل الفاتورة PDF.");
        }
    };

    const handlePaid = () => {
        setInvoice({ ...invoice, status: "paid" });
    };

    if (loading) return <div className="text-center my-5">جارٍ التحميل...</div>;
    if (error) return <div className="alert alert-danger">{error}</div>;
    if (!invoice) return null;

    return (
        <div className="container mt-4">
            <h2>🧾 تفاصيل الفاتورة #{invoice.id}</h2>
            <div className="card mt-3">
                <div className="card-body">
                    <p><strong>العميل:</strong> {invoice.customer_name}</p>
                    <p><strong>المبلغ:</strong> {invoice.amount} {invoice.currency || "EGP"}</p>
                    <p>
                        <strong>الحالة:</strong>{" "}
                        <span className={`badge ${invoice.status === "paid" ? "bg-success" : "bg-danger"}`}>
                            {invoice.status === "paid" ? "مدفوعة" : "غير مدفوعة"}
                        </span>
                    </p>
                    <p><strong>تاريخ الإنشاء:</strong> {new Date(invoice.issued_at).toLocaleDateString()}</p>

                    {invoice.booking_id && (
                        <p>
                            <strong>الحجز المرتبط:</strong>{" "}
                            <Link to={`/bookings/${invoice.booking_id}`} className="btn btn-sm btn-info">
                                عرض الحجز
                            </Link>
                        </p>
                    )}

                    <div className="d-flex gap-2 mt-3">
                        <button onClick={handleDownload} className="btn btn-outline-primary">
                            تحميل PDF
                        </button>

                        {invoice.status !== "paid" && (
                            <PayInvoice invoiceId={id} onPaid={handlePaid} />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default InvoiceDetails;
