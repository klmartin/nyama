"use client";
import { useEffect, useState } from "react";
import UserModal from "@/app/components/addeditusermodal";

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);

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
    <div className="bg-white p-6 rounded shadow space-y-4">
      <div className="flex justify-between">
        <input
          placeholder="Search user..."
          className="border p-2 w-64 text-black"
          onChange={(e) => setSearch(e.target.value)}
        />
        <button
          onClick={() => {
            setEditing(null);
            setModal(true);
          }}
          className="bg-red-700 text-white px-4 py-2 rounded"
        >
          + Add User
        </button>
      </div>

      <table className="w-full text-black">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2">Name</th>
            <th className="p-2">Username</th>
            <th className="p-2">Role</th>
            <th className="p-2">Status</th>
            <th className="p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id} className="border-t">
              <td className="p-2">{u.name}</td>
              <td className="p-2">{u.username}</td>
              <td className="p-2">{u.role}</td>
              <td className="p-2">
                {u.is_active ? "Active" : "Inactive"}
              </td>
              <td className="p-2 flex gap-2">
                <button
                  className="text-yellow-600"
                  onClick={() => {
                    setEditing(u);
                    setModal(true);
                  }}
                >
                  Edit
                </button>
                <button
                  className="text-red-600"
                  onClick={() => remove(u.id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

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