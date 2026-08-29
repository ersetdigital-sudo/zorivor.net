import { redirect } from "next/navigation";
import { headers } from "next/headers";
import Link from "next/link";
import { getAdminUser } from "@/lib/admin";
import { logout } from "./actions";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const h = await headers();
  const pathname = h.get("x-pathname") ?? h.get("x-invoke-path") ?? "";

  // Skip shell for the login page so unauthenticated users can see it.
  if (pathname.endsWith("/admin/login")) {
    return <>{children}</>;
  }

  const admin = await getAdminUser();
  if (!admin) redirect("/admin/login");

  return (
    <div className="min-h-screen bg-[#0a0d14] text-white">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-white/10 bg-black/40 p-6 lg:block">
        <div className="mb-8 flex items-center gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 text-sm font-bold">
            Z
          </div>
          <div>
            <div className="font-semibold">Zorivor Admin</div>
            <div className="text-xs text-white/50">{admin.email}</div>
          </div>
        </div>

        <nav className="space-y-1 text-sm">
          <NavItem href="/admin" label="Dashboard" icon="📊" />
          <NavItem href="/admin/orders" label="Pesanan" icon="🧾" />
          <NavItem href="/admin/products" label="Produk" icon="🎮" />
          <NavItem href="/admin/settings" label="Pengaturan" icon="⚙️" />
        </nav>

        <form action={logout} className="absolute bottom-6 left-6 right-6">
          <button
            type="submit"
            className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white/70 transition hover:bg-white/[0.06]"
          >
            Keluar
          </button>
        </form>
      </aside>

      <main className="lg:pl-64">
        <div className="border-b border-white/10 bg-black/40 px-6 py-4 lg:hidden">
          <div className="flex items-center justify-between">
            <div className="font-semibold">Zorivor Admin</div>
            <form action={logout}>
              <button className="text-xs text-white/60 underline">Keluar</button>
            </form>
          </div>
          <nav className="mt-3 flex gap-3 text-sm">
            <Link href="/admin" className="text-white/70">
              Dashboard
            </Link>
            <Link href="/admin/orders" className="text-white/70">
              Pesanan
            </Link>
            <Link href="/admin/products" className="text-white/70">
              Produk
            </Link>
            <Link href="/admin/settings" className="text-white/70">
              Settings
            </Link>
          </nav>
        </div>
        <div className="p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}

function NavItem({
  href,
  label,
  icon,
}: {
  href: string;
  label: string;
  icon: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-lg px-3 py-2 text-white/70 transition hover:bg-white/[0.05] hover:text-white"
    >
      <span className="w-5 text-center">{icon}</span>
      <span>{label}</span>
    </Link>
  );
}