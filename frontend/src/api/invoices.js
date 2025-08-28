import axios from "axios";
import { API_BASE_URL } from "../constants"; // لو عندك ثابت بيحتوي على رابط الباك اند

export const fetchInvoices = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/api/invoices/`);
        return response.data;
    } catch (error) {
        console.error("Error fetching invoices:", error);
        throw error;
    }
};

export const createInvoice = async (invoiceData) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/api/invoices/`, invoiceData);
        return response.data;
    } catch (error) {
        console.error("Error creating invoice:", error);
        throw error;
    }
};

export const updateInvoice = async (id, invoiceData) => {
    try {
        const response = await axios.put(`${API_BASE_URL}/api/invoices/${id}/`, invoiceData);
        return response.data;
    } catch (error) {
        console.error("Error updating invoice:", error);
        throw error;
    }
};

export const deleteInvoice = async (id) => {
    try {
        await axios.delete(`${API_BASE_URL}/api/invoices/${id}/`);
    } catch (error) {
        console.error("Error deleting invoice:", error);
        throw error;
    }
};

export const fetchTotalRevenue = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/api/invoices/total-revenue/`);
        return response.data;
    } catch (error) {
        console.error("Error fetching total revenue:", error);
        throw error;
    }
};