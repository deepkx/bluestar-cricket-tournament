import { motion, useScroll, useTransform } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { AdminGateModal } from '../admin/AdminGateModal';

const links = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About' },
  { to: '/teams', label: 'Teams' },
  { to: '/pools', label: 'Pools' },
  { to: '/fixtures', label: 'Fixtures' },
];

type LayoutProps = { introActive?: boolean };

export function Layout({ introActive = false }: LayoutProps) {
  const [open, setOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);
  const navigate = useNavigate();
  const { scrollY } = useScroll();
  const headerBg = useTransform(scrollY, [0, 80], ['rgba(8,12,10,0)', 'rgba(8,12,10,0.92)']);
  const location = useLocation();
  const onHome = location.pathname === '/';

  const openAdmin = () => {
    setOpen(false);
    if (localStorage.getItem('admin_token')) {
      navigate('/admin');
    } else {
      setAdminOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-ink-deep text-paper">
      <motion.header
        style={{
          backgroundColor: onHome && !introActive ? headerBg : introActive ? 'transparent' : 'rgba(8,12,10,0.92)',
        }}
        className={`fixed top-0 w-full backdrop-blur-md ${introActive ? 'z-40' : 'z-50'} pt-[env(safe-area-inset-top,0px)]`}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:py-4">
          <Link to="/" className="font-display flex min-w-0 items-center gap-2 text-lg tracking-widest sm:text-xl">
            <img src="/bluestar-star.svg" alt="" className="h-6 w-6 shrink-0" />
            <span className="truncate">Bluestar</span>
          </Link>
          <nav className="hidden items-center gap-8 text-sm font-medium lg:flex">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                className={({ isActive }) =>
                  isActive ? 'text-floodlight-bright' : 'text-paper/55 hover:text-floodlight-bright'
                }
              >
                {l.label}
              </NavLink>
            ))}
            <button
              type="button"
              onClick={openAdmin}
              className="text-sm text-paper/45 hover:text-floodlight-bright"
            >
              Admin
            </button>
            <Link
              to="/register"
              className="bg-floodlight px-5 py-2 text-sm font-semibold text-black hover:bg-floodlight-bright"
            >
              Register
            </Link>
          </nav>
          <button
            type="button"
            className="-mr-2 flex min-h-[44px] min-w-[44px] items-center justify-center lg:hidden"
            onClick={() => setOpen(!open)}
            aria-expanded={open}
            aria-label="Menu"
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
        {open && (
          <nav className="flex max-h-[min(70dvh,24rem)] flex-col gap-1 overflow-y-auto border-t border-white/10 px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))] lg:hidden">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                className="rounded py-3 text-base active:bg-white/10"
              >
                {l.label}
              </NavLink>
            ))}
            <button
              type="button"
              onClick={openAdmin}
              className="rounded py-3 text-left text-base text-paper/55 active:bg-white/10"
            >
              Admin
            </button>
            <Link
              to="/register"
              onClick={() => setOpen(false)}
              className="mt-2 bg-floodlight py-3 text-center text-sm font-semibold text-black"
            >
              Register
            </Link>
          </nav>
        )}
      </motion.header>
      <AdminGateModal open={adminOpen} onClose={() => setAdminOpen(false)} />
      <main className={onHome ? 'pt-0' : 'pt-[calc(3.75rem+env(safe-area-inset-top,0px))]'}>
        <Outlet />
      </main>
      <footer className="border-t border-paper/10 bg-ink-deep py-14 text-center">
        <p className="font-display text-lg tracking-widest text-paper/80">Bluestar Cricket</p>
        <p className="mt-2 text-sm text-paper/40">One tournament. One champion.</p>
      </footer>
    </div>
  );
}
