"use client";
import { useEffect, useState } from "react";
import AddEditCustomerModal from  "@/app/components/addeditcustomermodal"
import { useTranslations } from "next-intl";

export default function Page() {
  const [customers, setCustomers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [search, setSearch] = useState("");

  const fetchCustomers = async () => {
    const res = await fetch(`/api/customers?search=${encodeURIComponent(search)}`);
    const data = await res.json();
    setCustomers(data);
  };

  useEffect(() => {
    fetchCustomers();
  }, [search]);

  const deleteCustomer = async (id) => {
    if (!confirm("Are you sure you want to delete this customer?")) return;

    await fetch("/api/customers", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });

    fetchCustomers();
  };
const t = useTranslations('');
  return (
    <div className="p-6">
      <div className="flex justify-between mb-4">
        <h1 className="text-2xl font-bold text-black">{t("customers")}</h1>

        <button
          onClick={() => {
            setEditingCustomer(null);
            setShowModal(true);
          }}
          className="bg-red-600 text-white px-4 py-2 rounded"
        >
          + {t("add_customer")}
        </button>
      </div>

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          placeholder={t("search_customers")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border p-2 rounded w-full md:w-1/3 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500"
        />
      </div>

      <div className="bg-white rounded shadow text-gray-900">
        <table className="w-full">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="p-3 text-left">{t("name")}</th>
              <th className="p-3 text-center">{t("phone")}</th>
              <th className="p-3 text-left">{t("address")}</th>
              <th className="p-3 text-left">{t("email")}</th>
              <th className="p-3 text-center">{t("balance")}</th>
              <th className="p-3 text-center">{t("status")}</th>
              <th className="p-3 text-center">{t("actions")}</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((c) => (
              <tr key={c.id} className="border-t hover:bg-gray-50">
                <td className="p-3">{c.name}</td>
                <td className="p-3 text-center">{c.phone}</td>
                <td className="p-3">{c.address}</td>
                <td className="p-3">{c.email}</td>
                <td className="p-3 text-center">{c.balance}</td>
                <td className="p-3 text-center">{c.is_active ? "Active" : "Inactive"}</td>
                <td className="p-3 text-center flex justify-center gap-2">
                  <button
                    onClick={() => {
                      setEditingCustomer(c);
                      setShowModal(true);
                    }}
                    className="px-2 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                  >
                    {t("edit")}
                  </button>
                  <button
                    onClick={() => deleteCustomer(c.id)}
                    className="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    {t("delete")}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <AddEditCustomerModal
          customer={editingCustomer}
          onClose={() => setShowModal(false)}
          onSaved={fetchCustomers}
        />
      )}
    </div>
  );
}
