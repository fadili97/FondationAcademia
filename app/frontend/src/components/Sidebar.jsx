import { Link, useLocation } from 'react-router-dom';
import {
  Users, CreditCard, BarChart3, AlertTriangle, User, History, Calendar, Home
} from 'lucide-react';
import { getUserInfo } from '@/login/permissions';

const adminMenuItems = [
  { name: 'Dashboard', href: '/admin', icon: Home },
  { name: 'Laureates', href: '/admin/laureates', icon: Users },
  { name: 'Loans', href: '/admin/loans', icon: CreditCard },
  { name: 'Overdue Cases', href: '/admin/overdue', icon: AlertTriangle },
  { name: 'Reports', href: '/admin/reports', icon: BarChart3 },
];

const laureateMenuItems = [
  { name: 'Dashboard', href: '/laureate', icon: Home },
  { name: 'My Profile', href: '/laureate/profile', icon: User },
  { name: 'Loan History', href: '/laureate/loans', icon: History },
  { name: 'Repayment Schedule', href: '/laureate/repayments', icon: Calendar },
];

const NavLink = ({ to, children, className = '', onClick, mobile }) => {
  const location = useLocation();
  // Exact match for root paths (/admin or /laureate), startsWith for others
  const isActive = to === '/admin' || to === '/laureate'
    ? location.pathname === to
    : to === '/' ? location.pathname === '/' : location.pathname.startsWith(to);
  const baseClasses = 'flex items-center gap-3 rounded-md px-3 py-2 transition-all duration-200 relative';
  const activeClasses = 'bg-secondary text-secondary-foreground font-medium';
  const inactiveClasses = 'bg-background text-muted-foreground hover:bg-secondary/80 hover:text-secondary-foreground';

  return (
    <Link
      to={to}
      className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses} ${mobile ? 'mx-[-0.65rem]' : ''} ${className}`}
      onClick={() => onClick(to)}
    >
      {isActive && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-7 bg-primary rounded-r-full" />
      )}
      {children}
    </Link>
  );
};

function Sidebar({ handleNavigation, mobile }) {
  const userInfo = getUserInfo();
  const userIsAdmin = userInfo?.is_superuser === true;
  const menuItems = userIsAdmin ? adminMenuItems : laureateMenuItems;
  const panelTitle = userIsAdmin ? 'Administration Panel' : 'Laureate Portal';

  return (
    <div className="flex h-full max-h-screen flex-col sticky top-0 bg-card">
      <div className="flex h-14 items-center border-b px-6 lg:h-[60px]">
        <Link to="/" className="flex items-center gap-2 group" onClick={() => handleNavigation('/')}>
          <span className="font-semibold text-lg text-foreground">Fondation Académia</span>
        </Link>
      </div>
      <nav className="flex-1 overflow-y-auto p-3 text-sm font-medium">
        <div className="text-sm text-muted-foreground mb-4 px-3">{panelTitle}</div>
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.name}
              to={item.href}
              onClick={handleNavigation}
              mobile={mobile}
            >
              <Icon className="h-5 w-5" />
              {item.name}
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
}

export default Sidebar;