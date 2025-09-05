import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/ApiService"; // تم تعديل المسار
import { API_ENDPOINTS } from "../constants";

function Invoices() {
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function fetchInvoices() {
            try {
                const response = await api.get(API_ENDPOINTS.INVOICES.LIST);
                setInvoices(response);
            } catch (err) {
                console.error(err);
                setError("فشل تحميل الفواتير.");
            } finally {
                setLoading(false);
            }
        }
        fetchInvoices();
    }, []);

    if (loading) return <div className="text-center my-5">جارٍ التحميل...</div>;
    if (error) return <div className="alert alert-danger">{error}</div>;

    return (
        <div className="container mt-4">
            <h2 className="mb-4">📄 الفواتير</h2>

            {invoices.length === 0 ? (
                <div className="alert alert-info">لا توجد فواتير حالياً.</div>
            ) : (
                <table className="table table-bordered table-hover">
                    <thead className="table-light">
                        <tr>
                            <th>#</th>
                            <th>العميل</th>
                            <th>المبلغ</th>
                            <th>الحالة</th>
                            <th>تاريخ الإنشاء</th>
                            <th>الحجز المرتبط</th>
                            <th>الإجراءات</th>
                        </tr>
                    </thead>
                    <tbody>
                        {invoices.map((invoice) => (
                            <tr key={invoice.id}>
                                <td>{invoice.id}</td>
                                <td>{invoice.customer_name}</td>
                                <td>{invoice.amount} {invoice.currency || "EGP"}</td>
                                <td>
                                    <span className={`badge ${invoice.status === "paid" ? "bg-success" : "bg-danger"}`}>
                                        {invoice.status === "paid" ? "مدفوعة" : "غير مدفوعة"}
                                    </span>
                                </td>
                                <td>{new Date(invoice.issued_at).toLocaleDateString()}</td>
                                <td>
                                    {invoice.booking_id ? (
                                        <Link to={`/bookings/${invoice.booking_id}`} className="btn btn-sm btn-info">
                                            عرض الحجز
                                        </Link>
                                    ) : (
                                        <span>—</span>
                                    )}
                                </td>
                                <td>
                                    <Link
                                        to={`/invoices/${invoice.id}`}
                                        className="btn btn-sm btn-primary me-1"
                                    >
                                        التفاصيل
                                    </Link>
                                    {invoice.status !== "paid" && invoice.booking_id && (
                                        <Link
                                            to={`/pay-invoice/${invoice.id}`}
                                            className="btn btn-sm btn-warning"
                                        >
                                            دفع الآن
                                        </Link>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}

export default Invoices;
