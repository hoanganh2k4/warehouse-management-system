import type { ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
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

type NavItem = {
  label: string;
  icon: ReactNode;
  to?: string;
  active?: boolean;
  soon?: boolean;
};

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', icon: <GridIcon />, to: '/dashboard' },
  { label: 'Products', icon: <BoxIcon />, to: '/products' },
  { label: 'Categories', icon: <TagIcon />, to: '/categories' },
  { label: 'Inventory', icon: <LayersIcon />, soon: true },
  { label: 'Racking', icon: <WarehouseIcon />, soon: true },
  { label: 'Transactions', icon: <SwapIcon />, soon: true },
  { label: 'Team', icon: <UsersIcon />, to: '/team' },
];

export function Sidebar() {
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
        {NAV_ITEMS.map((item) =>
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