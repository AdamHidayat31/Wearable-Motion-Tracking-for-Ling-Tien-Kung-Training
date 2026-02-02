"use client";

import { useRouter } from "next/navigation";
import { useState, useMemo, useEffect, useRef } from "react";
import { UserCheck, Shield } from "lucide-react";
import { io } from "socket.io-client";

import CardSummary from "@/components/desktop/card/cardSummary";
import UserInfo from "@/components/desktop/ui/userInfo";
import StatusUser from "@/components/desktop/ui/statusUser";
import ButtonNonIcon from "@/components/desktop/button/buttonNonIcon";
import ButtonIcon from "@/components/desktop/button/buttonIcon";
import SearchBar from "@/components/desktop/searchBar";
import FilterSelect from "@/components/desktop/filterSelect";
import RoleUI from "@/components/desktop/ui/roleUI";
import React from "react";

// fungsi untuk menghitung statistik user
const getUserStats = (users) => {
  return users.reduce(
    (stats, user) => {
      stats.totalUser += 1;

      if (user.status === "pending") {
        stats.pendingUser += 1;
      } else if (user.status === "active") {
        stats.activeUser += 1;
      }

      if (user.role === "admin") {
        stats.admin += 1;
      }

      return stats;
    },
    {
      totalUser: 0,
      pendingUser: 0,
      activeUser: 0,
      admin: 0,
    },
  );
};

export default function KelolaPenggunaPage() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (!token) {
      router.push("/auth/login");
      return;
    }

    if (role !== "admin") {
      router.push("/forbidden");
      return;
    }
  }, []);

  const [query, setQuery] = useState("");
  const [role, setRole] = useState("All");

  // ==== BAGIAN DATA BACKEND ====
  const [users, setUsers] = useState([]);
  const socketRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem("token");

    // ===== FETCH DATA AWAL =====
    fetch("http://localhost:5000/api/pengguna", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setUsers(
            data.data.map((u) => ({
              id: u.id_pengguna,
              name: u.nama,
              email: u.email,
              role: u.role,
              status: u.status_pengguna,
              joindate: u.tanggal_daftar,
            })),
          );
        }
      });

    // ==== CONNECT SOCKET ====
    socketRef.current = io("http://localhost:5000", {
      transports: ["websocket"],
    });

    const socket = socketRef.current;

    // Ketika ada user baru ditambahkan
    socket.on("pengguna_add", (newUser) => {
      setUsers((prev) => [...prev, newUser]);
    });

    // Ketika ada atribut user diupdate
    socket.on("pengguna_update", (updatedUser) => {
      setUsers((prev) =>
        prev.map((u) => (u.id === updatedUser.id ? updatedUser : u)),
      );
    });

    // Ketika ada user dihapus
    socket.on("pengguna_delete", (deletedId) => {
      setUsers((prev) => prev.filter((u) => u.id !== deletedId));
    });

    // Bersihkan listener
    return () => {
      socket.off("pengguna_add");
      socket.off("pengguna_update");
      socket.off("pengguna_delete");
    };
  }, []);

  // Hitung statistik user menggunakan useMemo untuk optimasi
  const stats = useMemo(() => getUserStats(users), [users]);

  // Filter berdasarkan query & role
  const filteredUsers = users.filter((user) => {
    const matchesQuery =
      user.name.toLowerCase().includes(query.toLowerCase()) ||
      user.email.toLowerCase().includes(query.toLowerCase());
    const matchesRole = role === "All" || user.role === role;
    return matchesQuery && matchesRole;
  });

  const [selectedUser, setSelectedUser] = useState(null);
  const [newRole, setNewRole] = useState("");
  // ==== BUTTON STATUS HANDLER ===
  // Fungsi edit role User
  const handleEditRole = (user) => {
    if (user.status !== "active") {
      alert("❌ Hanya user dengan status 'active' yang bisa diedit rolenya!");
      return;
    }
    setSelectedUser(user);
    setNewRole(user.role);
  };
  // Fungsi save role User
  const handleSaveRole = async () => {
    if (!selectedUser) return;

    const token = localStorage.getItem("token");

    const res = await fetch(
      `http://localhost:5000/api/pengguna/ubah-role/${selectedUser.id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ role: newRole }),
      },
    );

    const data = await res.json();

    if (data.success) {
      setUsers((prev) =>
        prev.map((u) =>
          u.id === selectedUser.id ? { ...u, role: newRole } : u,
        ),
      );
      setSelectedUser(null);
    } else {
      alert("Gagal update role!");
    }
  };
  // Fungsi Approve Akun User
  const handleApprove = async (userId) => {
    const token = localStorage.getItem("token");

    const res = await fetch(
      `http://localhost:5000/api/pengguna/ubah-status/${userId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status_pengguna: "active" }),
      },
    );

    const data = await res.json();

    if (data.success) {
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, status: "active" } : u)),
      );
    }
  };
  // Fungsi Reject Akun User
  const handleReject = (userId) => {
    setUsers((prevUsers) =>
      // Filter array: Hanya kembalikan pengguna yang ID-nya TIDAK sama dengan userId yang dihapus.
      prevUsers.filter((user) => user.id !== userId),
    );
  };
  // Fungsi Deactive Akun User
  const handleDeactivate = async (userId) => {
    const token = localStorage.getItem("token");

    await fetch(`http://localhost:5000/api/pengguna/ubah-status/${userId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status_pengguna: "deactive" }),
    });

    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, status: "deactive" } : u)),
    );
  };
  // Fungsi Active Akun User
  const handleActivate = async (userId) => {
    const token = localStorage.getItem("token");

    await fetch(`http://localhost:5000/api/pengguna/ubah-status/${userId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status_pengguna: "active" }),
    });

    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, status: "active" } : u)),
    );
  };

  return (
    <div>
      {/* HEADER PAGE */}
      <div className="pb-4">
        <h1 className="text-2xl text-black font-semibold">Kelola Pengguna</h1>
        <p className="text-black">Manage users, roles, and permissions.</p>
      </div>
      {/* CARD SUMMARY */}
      <div className="pb-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <CardSummary
            icon={UserCheck}
            title="Total Users"
            value={stats.totalUser}
            iconBgColor="#EFF6FF"
            iconColor="#155DFC"
          />
          <CardSummary
            icon={UserCheck}
            title="Pending Approval"
            value={stats.pendingUser}
            iconBgColor="#FEFCE8"
            iconColor="#D08700"
          />
          <CardSummary
            icon={UserCheck}
            title="Active Users"
            value={stats.activeUser}
            iconBgColor="#F0FDF4"
            iconColor="#00A63E"
          />
          <CardSummary
            icon={Shield}
            title="Admins"
            value={stats.admin}
            iconBgColor="#FAF5FF"
            iconColor="#9810FA"
          />
        </div>
      </div>
      {/* SECTION APPROVAL USER
          -----------------------------------------------------
          Section ini berisikan Row untuk User di approval
          Isi Row:
            - UserInfo(name, type[email(default), jadwal(tanggal & jam), dan sesi] )
            - StatusUser(label, bgColor, textColor)
            - ButtonNonIcon(text="Approve", bgColor="#00A63E", textColor="#FFFFFF", borderColor="#00A63E")
            - ButtonNonIcon(text="Reject", bgColor="#FFFFFF", textColor="#FF0000", borderColor="#FF0000")  
       */}
      <div className="items-center gap-4 bg-white p-4 rounded-2xl border border-gray-200 w-full">
        <p className="text-black font-medium">Pending User Approvals</p>

        <div>
          {users
            .filter((user) => user.status === "pending") // hanya menampilkan pending
            .map((user) => (
              <div
                key={user.id}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between pt-2 w-full bg-[#F9FAFB] rounded-xl p-3 mb-2 border"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-3 sm:mb-0">
                  <UserInfo name={user.name} email={user.email} />
                  <StatusUser
                    label={
                      user.status.charAt(0).toUpperCase() + user.status.slice(1)
                    }
                    bgColor="#FEF9C2"
                    textColor="#A65F00"
                  />
                </div>
                <div className="flex gap-2 justify-end sm:justify-start">
                  <ButtonNonIcon
                    text="Approve"
                    bgColor="#00A63E"
                    textColor="#FFFFFF"
                    borderColor="#00A63E"
                    onClick={() => handleApprove(user.id)}
                  />
                  <ButtonNonIcon
                    text="Reject"
                    bgColor="#FF0000"
                    textColor="#FFFFFF"
                    borderColor="#FF0000"
                    onClick={() => handleReject(user.id)}
                  />
                </div>
              </div>
            ))}
        </div>
      </div>
      {/* DATA LIST USER */}
      <div className="mt-4 bg-white rounded-2xl border border-gray-200 w-full p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <div className="flex-1">
            <SearchBar
              placeholder="Search user by name or email..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <FilterSelect
            value={role}
            onChange={(e) => setRole(e.target.value)}
            options={[
              { label: "All Roles", value: "All" },
              { label: "Admin", value: "admin" },
              { label: "User", value: "user" },
            ]}
          />
        </div>

        {/* 🧾 Tabel Data User */}
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="text-left bg-gray-50 border-b">
                <th className="px-4 py-2 text-sm font-semibold text-gray-700">
                  User
                </th>
                <th className="px-4 py-2 text-sm font-semibold text-gray-700">
                  Email
                </th>
                <th className="px-4 py-2 text-sm font-semibold text-gray-700">
                  Role
                </th>
                <th className="px-4 py-2 text-sm font-semibold text-gray-700">
                  Status
                </th>
                <th className="px-4 py-2 text-sm font-semibold text-gray-700">
                  Join Date
                </th>
                <th className="px-4 py-2 text-sm font-semibold text-gray-700">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredUsers.map((user) => (
                <tr
                  key={user.id}
                  className="border-b hover:bg-gray-50 transition-colors"
                >
                  <td className="px-4 py-3">
                    <UserInfo
                      name={user.name}
                      type="none"
                      avatarBg="#E0EAFF"
                      avatarColor="#155DFC"
                    />
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {user.email}
                  </td>
                  <td className="px-4 py-3 capitalize text-sm text-gray-600">
                    <RoleUI
                      label={user.role}
                      bgColor={user.role === "user" ? "#F3F4F6" : "#F3E8FF"}
                      textColor={user.role === "user" ? "#3A465C" : "#823DE7"}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <StatusUser
                      label={user.status}
                      bgColor={
                        user.status === "active"
                          ? "#DCFCE7"
                          : user.status === "pending"
                            ? "#FEF9C2"
                            : user.status === "rejected"
                              ? "#ff8800ff"
                              : "#ff0000ff"
                      }
                      textColor={
                        user.status === "active"
                          ? "#166534"
                          : user.status === "pending"
                            ? "#A65F00"
                            : user.status === "rejected"
                              ? "#ffffffff"
                              : "#ffffffff"
                      }
                    />
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {new Date(user.joindate).toLocaleString("id-ID", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })}
                  </td>
                  <td className="px-4 py-3 flex items-center gap-2">
                    <ButtonIcon
                      text="Edit Role"
                      icon="lucide:shield"
                      bgColor="#FFFFFF"
                      textColor="#363636"
                      borderColor="#363636"
                      onClick={() => handleEditRole(user)}
                    />
                    {user.status === "active" && (
                      <ButtonIcon
                        text="Deactivate"
                        icon="lucide:user-x"
                        bgColor="#FFFFFF"
                        textColor="#FF0000"
                        borderColor="#FF0000"
                        onClick={() => handleDeactivate(user.id)}
                      />
                    )}
                    {user.status === "deactive" && (
                      <ButtonIcon
                        text="Activate"
                        icon="lucide:user-check"
                        bgColor="#FFFFFF"
                        textColor="#008000"
                        borderColor="#008000"
                        onClick={() => handleActivate(user.id)}
                      />
                    )}
                    {user.status === "rejected" && (
                      <ButtonIcon
                        text="Approve"
                        icon="lucide:check"
                        bgColor="#FFFFFF"
                        textColor="#007BFF"
                        borderColor="#007BFF"
                        onClick={() => handleApprove(user.id)}
                      />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Popup Edit Role */}
          {selectedUser && (
            <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
              <div className="bg-white rounded-xl p-6 shadow-lg w-80">
                <h3 className="font-semibold text-black mb-4">
                  Edit Role: {selectedUser.name}
                </h3>

                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  className="border rounded p-2 w-full mb-4 text-black"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>

                <div className="flex justify-end gap-2">
                  <button
                    className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400"
                    onClick={() => setSelectedUser(null)}
                  >
                    Batal
                  </button>
                  <button
                    className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
                    onClick={handleSaveRole}
                  >
                    Simpan
                  </button>
                </div>
              </div>
            </div>
          )}

          {filteredUsers.length === 0 && (
            <p className="text-center text-gray-500 py-6 text-sm">
              No users found.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
