"use client";
import { useEffect, useState } from "react";
import AddEditProductModal from "@/app/components/addeditproductmodal";
import { useTranslations } from "next-intl";

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [search, setSearch] = useState("");
 const t = useTranslations('');

  const fetchProducts = async () => {
    const res = await fetch(`/api/products?search=${encodeURIComponent(search)}`);
    const data = await res.json();
    setProducts(data);
  };

  useEffect(() => {
    fetchProducts();
  }, [search]);

  const deleteProduct = async (id) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    await fetch("/api/products", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });

    fetchProducts();
  };

  return (
    <div className="p-6">
      <div className="flex justify-between mb-4">
        <h1 className="text-2xl font-bold text-black">{t("products")}</h1>

        <button
          onClick={() => {
            setEditingProduct(null);
            setShowModal(true);
          }}
          className="bg-red-600 text-white px-4 py-2 rounded"
        >
          + {t("add_product")}
        </button>
      </div>

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          placeholder={t("search_products")}
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
              <th className="p-3 text-center">{t("unit")}</th>
              <th className="p-3 text-center">{t("stock")}</th>
              <th className="p-3 text-center">{t("buy")}</th>
              <th className="p-3 text-center">{t("sell")}</th>
              <th className="p-3 text-center">{t("status")}</th>
              <th className="p-3 text-center">{t("actions")}</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-t hover:bg-gray-50">
                <td className="p-3">{p.name}</td>
                <td className="p-3 text-center">{p.unit}</td>
                <td className="p-3 text-center font-semibold">
                  {p.remaining_stock}
                </td>
                <td className="p-3 text-center">{p.buying_price}</td>
                <td className="p-3 text-center">{p.selling_price}</td>
                <td className="p-3 text-center">{p.is_active ? "Active" : "Inactive"}</td>
                <td className="p-3 text-center flex justify-center gap-2">
                  <button
                    onClick={() => {
                      setEditingProduct(p);
                      setShowModal(true);
                    }}
                    className="px-2 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                  >
                    {t("edit")}
                  </button>
                  <button
                    onClick={() => deleteProduct(p.id)}
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
        <AddEditProductModal
          product={editingProduct}
          onClose={() => setShowModal(false)}
          onSaved={fetchProducts}
        />
      )}
    </div>
  );
}
