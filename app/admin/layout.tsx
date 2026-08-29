import Link from "next/link";
import { getAdminUser } from "@/lib/admin";
import { logout } from "./actions";
import {
  IconDashboard,
  IconReceipt,
  IconGamepad,
  IconCreditCard,
  IconSettings,
  IconLogout,
  IconGames,
} from "@/components/Icons";
import { ToastHost } from "@/components/Toast";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await getAdminUser();

  return (
    <div className="min-h-screen bg-[#0a0d14] text-white">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-white/10 bg-black/40 p-6 lg:block">
        <div className="mb-8 flex items-center gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 text-sm font-bold">
            Z
          </div>
          <div>
            <div className="font-semibold">Zorivor Admin</div>
            <div className="text-xs text-white/50">{admin?.email ?? ""}</div>
          </div>
        </div>

        <nav className="space-y-1 text-sm">
          <NavItem href="/admin" label="Dashboard" Icon={IconDashboard} />
          <NavItem href="/admin/orders" label="Pesanan" Icon={IconReceipt} />
          <NavItem href="/admin/games" label="Games" Icon={IconGames} />
          <NavItem href="/admin/products" label="Produk" Icon={IconGamepad} />
          <NavItem href="/admin/payment" label="Pembayaran" Icon={IconCreditCard} />
          <NavItem href="/admin/settings" label="Pengaturan" Icon={IconSettings} />
        </nav>

        <form action={logout} className="absolute bottom-6 left-6 right-6">
          <button
            type="submit"
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white/70 transition hover:bg-white/[0.06]"
          >
            <IconLogout />
            <span>Keluar</span>
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
          <nav className="mt-3 flex flex-wrap gap-3 text-sm">
            <Link href="/admin" className="text-white/70">
              Dashboard
            </Link>
            <Link href="/admin/orders" className="text-white/70">
              Pesanan
            </Link>
            <Link href="/admin/games" className="text-white/70">
              Games
            </Link>
            <Link href="/admin/products" className="text-white/70">
              Produk
            </Link>
            <Link href="/admin/payment" className="text-white/70">
              Pembayaran
            </Link>
            <Link href="/admin/settings" className="text-white/70">
              Pengaturan
            </Link>
          </nav>
        </div>
        <div className="p-6 lg:p-8">{children}</div>
      </main>
      <ToastHost />
    </div>
  );
}

function NavItem({
  href,
  label,
  Icon,
}: {
  href: string;
  label: string;
  Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-lg px-3 py-2 text-white/70 transition hover:bg-white/[0.05] hover:text-white"
    >
      <Icon className="shrink-0" />
      <span>{label}</span>
    </Link>
  );
}