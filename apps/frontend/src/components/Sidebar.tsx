import type { ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

import {
  BarcodeMark,
  BoxIcon,
  GridIcon,
  LayersIcon,
  SettingsIcon,
  SwapIcon,
  TagIcon,
  UsersIcon,
  WarehouseIcon,
} from './icons';
import { MANAGER_ROLE } from '../lib/roles';

type NavItem = {
  label: string;
  icon: ReactNode;
  to?: string;
  active?: boolean;
  soon?: boolean;
  // Không set = ai cũng thấy. 'auth' = phải đăng nhập. Mảng role = phải đăng
  // nhập VÀ đúng role. Khớp với điều kiện các route tương ứng trong App.tsx.
  requires?: 'auth' | string[];
};

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', icon: <GridIcon />, to: '/dashboard', requires: [MANAGER_ROLE] },
  { label: 'Products', icon: <BoxIcon />, to: '/products' },
  { label: 'Categories', icon: <TagIcon />, to: '/categories' },
  { label: 'Inventory', icon: <LayersIcon />, to: '/inventory' },
  { label: 'Racking', icon: <WarehouseIcon />, to: '/racking', requires: [MANAGER_ROLE] },
  { label: 'Transactions', icon: <SwapIcon />, to: '/transactions', requires: [MANAGER_ROLE] },
  { label: 'Team', icon: <UsersIcon />, to: '/team', requires: [MANAGER_ROLE] },
];

export function Sidebar() {
  const { isAuthenticated, role } = useAuth();
  const loggedIn = isAuthenticated();

  const visibleItems = NAV_ITEMS.filter((item) => {
    if (!item.requires) return true;
    if (!loggedIn) return false;
    if (item.requires === 'auth') return true;
    return role !== null && item.requires.includes(role);
  });

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <span className="brand-mark">
          <BarcodeMark />
        </span>
        <span className="brand-text">
          <strong>Smart WMS</strong>
          <small>Warehouse Ops</small>
        </span>
      </div>

      <nav className="sidebar-nav" aria-label="Primary">
        {visibleItems.map((item) =>
          item.to ? (
            <NavLink
              key={item.label}
              to={item.to}
              className={({ isActive }) => `nav-item${isActive ? ' is-active' : ''}`}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </NavLink>
          ) : (
            <button
              key={item.label}
              type="button"
              className={`nav-item${item.active ? ' is-active' : ''}`}
              disabled={item.soon}
              aria-current={item.active ? 'page' : undefined}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
              {item.soon && <span className="nav-soon">Soon</span>}
            </button>
          ),
        )}
      </nav>

      <div className="sidebar-footer">
        <button type="button" className="nav-item" disabled>
          <span className="nav-icon">
            <SettingsIcon />
          </span>
          <span className="nav-label">Settings</span>
        </button>
      </div>
    </aside>
  );
}
