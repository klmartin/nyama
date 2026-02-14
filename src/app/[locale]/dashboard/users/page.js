"use client";
import { useEffect, useState } from "react";
import UserModal from "@/app/components/addeditusermodal";
import { useTranslations } from "next-intl";

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
 const t = useTranslations('');

  async function load() {
    const res = await fetch(`/api/users?q=${search}`);
    setUsers(await res.json());
  }

  async function remove(id) {
    if (!confirm("Delete user?")) return;
    await fetch(`/api/users/${id}`, { method: "DELETE" });
    load();
  }

  useEffect(() => {
    load();
  }, [search]);

  return (
    <div className="p-6">
      <div className="flex justify-between mb-4">
      <h1 className="text-2xl font-bold text-black">{t("users")}</h1>
        <button
          onClick={() => {
            setEditing(null);
            setModal(true);
          }}
          className="bg-red-600 text-white px-4 py-2 rounded"
        >
          + {t("add_user")}
        </button>
 </div>
  <div className="mb-4">
        <input
          placeholder={t("search_users")}
          className="border p-2 rounded w-full md:w-1/3 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500"
          onChange={(e) => setSearch(e.target.value)}
        />
</div>
     
      <div className="bg-white rounded shadow text-gray-900">
      <table className="w-full">
        <thead className="bg-gray-100 text-gray-700">
          <tr>
            <th className="p-3 text-left">{t("name")}</th>
            <th className="p-3 text-left">{t("username")}</th>
            <th className="p-3 text-left">{t("email")}</th>
            <th className="p-3 text-left">{t("role")}</th>
            <th className="p-3 text-left">{t("status")}</th>
            <th className="p-3 text-left">{t("actions")}</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id} className="border-t  hover:bg-gray-50">
              <td className="p-2">{u.name}</td>
              <td className="p-2">{u.username}</td>
              <td className="p-2">{u.email}</td>
              <td className="p-2">{u.role}</td>
              <td className="p-2">
                {u.is_active ? "Active" : "Inactive"}
              </td>
              <td className="p-2 flex gap-2">
                <button
                  className="px-2 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                  onClick={() => {
                    setEditing(u);
                    setModal(true);
                  }}
                >
                  {t("edit")}
                </button>
                <button
                  className="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                  onClick={() => remove(u.id)}
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
        <UserModal
          user={editing}
          onClose={() => setModal(false)}
          onSaved={load}
        />
      )}
    </div>
  );
}