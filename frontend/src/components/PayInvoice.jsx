import React, { useState } from "react";
import api from "../services/ApiService"; // تم تعديل المسار
import { API_ENDPOINTS } from "../constants";

function PayInvoice({ invoiceId, onPaid }) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handlePay = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await api.post(API_ENDPOINTS.INVOICES.PAY(invoiceId));
            if (response.success) {
                onPaid(); // تحديث الحالة في الصفحة الأب
            } else {
                setError(response.message || "فشل الدفع.");
            }
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.detail || err.message || "حدث خطأ أثناء الدفع.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <button
                className="btn btn-sm btn-warning"
                onClick={handlePay}
                disabled={loading}
            >
                {loading ? "جارٍ الدفع..." : "دفع الآن"}
            </button>
            {error && <div className="text-danger mt-1">{error}</div>}
        </div>
    );
}

export default PayInvoice;
