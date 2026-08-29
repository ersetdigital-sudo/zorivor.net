"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ConfirmModal, useConfirm } from "@/components/ConfirmModal";
import { Toast } from "@/components/Toast";
import { AddAdminModal } from "./AddAdminModal";
import { ChangePasswordModal } from "./ChangePasswordModal";
import { IconPlus, IconTrash, IconKey } from "@/components/Icons";

type Admin = {
  user_id: string;
  email: string;
  is_super_admin: boolean;
  created_at: string;
  last_sign_in_at: string | null;
  display_name: string | null;
};

function formatDate(d: string | null | undefined): string {
  if (!d) return "—";
  const date = new Date(d);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function AdminsManager({
  initialAdmins,
  currentUserId,
}: {
  initialAdmins: Admin[];
  currentUserId: string;
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [admins, setAdmins] = useState<Admin[]>(initialAdmins);
  const [showAdd, setShowAdd] = useState(false);
  const [passwordTarget, setPasswordTarget] = useState<Admin | null>(null);
  const { ask, ConfirmNode } = useConfirm();

  // Keep state in sync if parent re-fetches
  useEffect(() => {
    setAdmins(initialAdmins);
  }, [initialAdmins]);

  function refresh() {
    startTransition(() => router.refresh());
  }

  function askDelete(a: Admin) {
    if (a.user_id === currentUserId) {
      Toast.error("Tidak bisa menghapus akun sendiri");
      return;
    }
    if (admins.length <= 1) {
      Toast.error("Sistem harus punya minimal 1 admin");
      return;
    }
    ask({
      title: "Hapus Admin?",
      itemName: a.display_name ?? a.email,
      description:
        "Admin ini tidak akan bisa login lagi setelah dihapus. Order yang sudah ada tetap aman. Aksi ini tidak bisa dibatalkan.",
      onConfirm: async () => {
        const res = await fetch(`/api/admin/admins/${a.user_id}`, {
          method: "DELETE",
        });
        if (!res.ok) {
          const e = await res.json().catch(() => ({}));
          throw new Error(e.error ?? `HTTP ${res.status}`);
        }
        setAdmins((prev) => prev.filter((x) => x.user_id !== a.user_id));
        Toast.success("Admin dihapus");
        refresh();
      },
    });
  }

  return (
    <>
      <section className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-white">Manajemen Admin</h2>
            <p className="text-xs text-white/50">
              Akun yang bisa login ke dashboard admin. Minimal 1 admin harus
              selalu aktif.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowAdd(true)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-violet-500 to-fuchsia-500 px-3 py-2 text-xs font-semibold text-white transition hover:opacity-90"
          >
            <IconPlus /> Tambah Admin
          </button>
        </div>

        <div className="overflow-hidden rounded-2xl border border-white/10">
          <table className="w-full text-sm">
            <thead className="bg-white/[0.04] text-left text-xs uppercase text-white/50">
              <tr>
                <th className="px-4 py-2">Nama / Email</th>
                <th className="px-4 py-2">Role</th>
                <th className="px-4 py-2">Login terakhir</th>
                <th className="px-4 py-2">Dibuat</th>
                <th className="px-4 py-2 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {admins.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-10 text-center text-white/50"
                  >
                    Belum ada admin
                  </td>
                </tr>
              ) : (
                admins.map((a) => {
                  const isSelf = a.user_id === currentUserId;
                  const isLast = admins.length <= 1;
                  const canDelete = !isSelf && !isLast;
                  const deleteTitle = isSelf
                    ? "Tidak bisa menghapus akun sendiri"
                    : isLast
                    ? "Minimal 1 admin harus selalu aktif"
                    : "Hapus admin";
                  return (
                    <tr key={a.user_id} className="border-t border-white/5">
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-2">
                          <div className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-violet-500/20 text-xs font-semibold text-violet-200">
                            {(a.display_name ?? a.email)
                              .slice(0, 1)
                              .toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <div className="truncate text-sm font-medium text-white">
                              {a.display_name ?? a.email.split("@")[0]}
                            </div>
                            <div className="truncate text-xs text-white/50">
                              {a.email}
                            </div>
                          </div>
                          {isSelf && (
                            <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] text-emerald-300">
                              Kamu
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-2.5 text-xs">
                        {a.is_super_admin ? (
                          <span className="rounded-full bg-violet-500/15 px-2 py-0.5 text-violet-300">
                            Super Admin
                          </span>
                        ) : (
                          <span className="rounded-full bg-white/5 px-2 py-0.5 text-white/60">
                            Admin
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-2.5 text-xs text-white/60">
                        {formatDate(a.last_sign_in_at)}
                      </td>
                      <td className="px-4 py-2.5 text-xs text-white/60">
                        {formatDate(a.created_at)}
                      </td>
                      <td className="px-4 py-2.5">
                        <div className="flex justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => setPasswordTarget(a)}
                            title="Ubah password"
                            className="inline-flex items-center gap-1 rounded-md border border-white/10 bg-white/[0.04] px-2 py-1 text-xs text-white/80 transition hover:bg-white/[0.08]"
                          >
                            <IconKey />
                            <span className="hidden sm:inline">Password</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => askDelete(a)}
                            disabled={!canDelete}
                            title={deleteTitle}
                            className="rounded-md bg-red-500/10 px-2 py-1 text-xs text-red-300 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            <IconTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>

      <AddAdminModal
        open={showAdd}
        onClose={() => setShowAdd(false)}
        onCreated={(a) => {
          setAdmins((prev) => [...prev, a]);
          setShowAdd(false);
          Toast.success("Admin berhasil ditambahkan");
          refresh();
        }}
      />

      <ChangePasswordModal
        target={passwordTarget}
        currentUserId={currentUserId}
        onClose={() => setPasswordTarget(null)}
        onSuccess={() => {
          setPasswordTarget(null);
          Toast.success("Password berhasil diubah");
        }}
      />

      <ConfirmNode />
    </>
  );
}