"use client";
import { useEffect, useState } from "react";
import VendorModal  from "@/app/components/addeditvendormodal";
import { useTranslations } from "next-intl";

export default function VendorsPage() {
  const [vendors, setVendors] = useState([]);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(false);
  const [editVendor, setEditVendor] = useState(null);
const t = useTranslations('');
  const loadVendors = async () => {
    const res = await fetch(`/api/vendors?search=${search}`);
    setVendors(await res.json());
  };

  useEffect(() => {
    loadVendors();
  }, [search]);

  const remove = async (id) => {
    if (!confirm("Delete vendor?")) return;
    await fetch(`/api/vendors?id=${id}`, { method: "DELETE" });
    loadVendors();
  };

  return (
    <div className="p-6">
      <div className="flex justify-between mb-4">
        <input
          className="border p-2 rounded w-full md:w-1/3 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500"
          placeholder={t("search_vendors")}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button
          className="bg-red-600 text-white px-4 py-2 rounded"
          onClick={() => {
            setEditVendor(null);
            setModal(true);
          }}
        >
          {t("add_vendor")}
        </button>
      </div>

    <div className="bg-white rounded shadow text-gray-900">
  <table className="w-full">
    <thead className="bg-gray-100 text-gray-700">
      <tr>
        <th className="p-3 text-left">{t("name")}</th>
        <th className="p-3 text-center">{t("phone")}</th>
        <th className="p-3 text-center">{t("address")}</th>
        <th className="p-3 text-center">{t("actions")}</th>
      </tr>
    </thead>

    <tbody>
      {vendors.map((v) => (
        <tr
          key={v.id}
          className="border-t hover:bg-gray-50"
        >
          <td className="p-3">{v.name}</td>
          <td className="p-3 text-center">{v.phone}</td>
          <td className="p-3 text-center">{v.address || "-"}</td>
          <td className="p-3 text-center flex justify-center gap-2">
            <button
              className="px-2 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
              onClick={() => {
                setEditVendor(v);
                setModal(true);
              }}
            >
              {t("edit")}
            </button>

            <button
              className="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700"
              onClick={() => remove(v.id)}
            >
              {t("delete")}
            </button>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
</div>


      {modal && (
        <VendorModal
          vendor={editVendor}
          onClose={() => setModal(false)}
          onSaved={loadVendors}
        />
      )}
    </div>
  );
}
