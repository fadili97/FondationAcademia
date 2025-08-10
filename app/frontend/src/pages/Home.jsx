import React, { useState, useEffect, useCallback } from 'react';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import { getUserRole, getUserInfo } from '@/login/permissions';
import { intl, changeLanguage } from '@/i18n';
import { ModeToggle } from '@/components/mode-toggle';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  LogOut, Menu, CircleUser, Globe, Users, CreditCard,
  BarChart3, AlertTriangle, User, History, Calendar, Home as HomeIcon,
  PanelLeftClose, PanelLeftOpen, Bell, Settings, Shield, ExternalLink
} from 'lucide-react';
import HomePage from '@/pages/public/HomePage';

const adminMenuItems = [
  { name: 'Dashboard', href: '/dashboard/admin', icon: HomeIcon, translationKey: 'dashboard' },
  { name: 'Laureates', href: '/dashboard/admin/laureates', icon: Users, translationKey: 'laureates' },
  { name: 'Loans', href: '/dashboard/admin/loans', icon: CreditCard, translationKey: 'loans' },
  { name: 'Overdue Cases', href: '/dashboard/admin/overdue', icon: AlertTriangle, translationKey: 'overdue' },
  { name: 'Reports', href: '/dashboard/admin/reports', icon: BarChart3, translationKey: 'reports' },
];

const laureateMenuItems = [
  { name: 'Dashboard', href: '/laureate', icon: HomeIcon, translationKey: 'dashboard' },
  { name: 'My Profile', href: '/laureate/profile', icon: User, translationKey: 'profile' },
  { name: 'Loan History', href: '/laureate/loans', icon: History, translationKey: 'loanHistory' },
  { name: 'Repayment Schedule', href: '/laureate/repayments', icon: Calendar, translationKey: 'repaymentSchedule' },
];

const getInitialSidebarState = () => {
  if (typeof window === 'undefined') return false;
  const savedState = localStorage.getItem('sidebarCollapsed');
  return savedState !== null ? JSON.parse(savedState) : false;
};

// Main Home Component
function Home() {
  const [isOpen, setIsOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(getInitialSidebarState);
  const [currentLocale, setCurrentLocale] = useState(intl.locale);
  const [key, setKey] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();
  const userRole = getUserRole();

  useEffect(() => {
    // Only redirect if at root path and authenticated
    if (location.pathname === '/' && userRole) {
      if (userRole === 'admin') {
        navigate('/dashboard/admin', { replace: true });
      } else if (userRole === 'laureate') {
        navigate('/laureate', { replace: true });
      }
    }
  }, [userRole, navigate, location.pathname]);

  const handleNavigation = useCallback(
    (path, external = false) => {
      setIsOpen(false);
      if (external) {
        // Open external links in new tab
        window.open(path, '_blank', 'noopener,noreferrer');
      } else {
        navigate(path);
      }
    },
    [navigate]
  );

  const handleLanguageChange = useCallback((newLocale) => {
    changeLanguage(newLocale);
    setCurrentLocale(newLocale);
    setKey(prevKey => prevKey + 1);
  }, []);

  const toggleMobileMenu = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  const toggleSidebar = useCallback(() => {
    setSidebarCollapsed(prev => {
      const newState = !prev;
      localStorage.setItem('sidebarCollapsed', JSON.stringify(newState));
      return newState;
    });
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  // Header Component
  const Header = React.memo(({ handleNavigation, onLanguageChange, currentLocale, toggleMobileMenu, toggleSidebar, sidebarCollapsed }) => {
    const userInfo = getUserInfo();
    const isAdmin = userInfo?.is_superuser === true;
    
    const handleDjangoAdmin = () => {
      window.open('/admin/', '_blank', 'noopener,noreferrer');
    };

    return (
      <header className="sticky top-0 z-10 flex h-14 sm:h-16 items-center gap-2 sm:gap-4 border-b bg-background/95 px-3 sm:px-6 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
        <Button
          variant="ghost"
          size="icon"
          className="hidden md:flex shrink-0 hover:bg-accent"
          onClick={toggleSidebar}
        >
          {sidebarCollapsed ? (
            <PanelLeftOpen className="h-5 w-5" />
          ) : (
            <PanelLeftClose className="h-5 w-5" />
          )}
          <span className="sr-only">{intl.formatMessage({ id: 'toggleSidebar' })}</span>
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="shrink-0 md:hidden hover:bg-accent"
          onClick={toggleMobileMenu}
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">{intl.formatMessage({ id: 'toggleNavigationMenu' })}</span>
        </Button>
        <div className="md:hidden flex-1">
          <span className="font-bold text-lg text-foreground tracking-tight">
            {intl.formatMessage({ id: 'appTitle' })}
          </span>
        </div>
        <div className="flex items-center gap-1 sm:gap-2 ml-auto">
          {/* Django Admin Quick Access for Admins */}
          {isAdmin && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="relative hover:bg-accent hidden sm:flex"
              onClick={handleDjangoAdmin}
              title={intl.formatMessage({ id: 'djangoAdmin' }) || 'Django Admin'}
            >
              <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-orange-600" />
              <span className="sr-only">{intl.formatMessage({ id: 'djangoAdmin' })}</span>
            </Button>
          )}
          <Button variant="ghost" size="icon" className="relative hover:bg-accent hidden xs:flex">
            <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
            <span className="absolute -top-1 -right-1 h-2 w-2 sm:h-3 sm:w-3 bg-destructive rounded-full"></span>
            <span className="sr-only">{intl.formatMessage({ id: 'notifications' })}</span>
          </Button>
          <Button variant="ghost" size="icon" className="hover:bg-accent hidden xs:flex">
            <Settings className="h-4 w-4 sm:h-5 sm:w-5" />
            <span className="sr-only">{intl.formatMessage({ id: 'settings' })}</span>
          </Button>
          <ModeToggle />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full hover:bg-accent">
                <Globe className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="sr-only">{intl.formatMessage({ id: 'toggleLanguage' })}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              {['en', 'fr'].map(lang => (
                <DropdownMenuItem
                  key={lang}
                  onClick={() => onLanguageChange && onLanguageChange(lang)}
                  className={`${currentLocale === lang ? 'bg-accent text-accent-foreground' : ''} cursor-pointer`}
                >
                  {intl.formatMessage({ id: lang === 'en' ? 'english' : 'french' })}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full hover:bg-accent">
                <CircleUser className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="sr-only">{intl.formatMessage({ id: 'toggleUserMenu' })}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>
                {userInfo?.full_name || userInfo?.username || intl.formatMessage({ id: 'user' })}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-sm">
                {isAdmin
                  ? intl.formatMessage({ id: 'administratorRole' })
                  : intl.formatMessage({ id: 'laureateRole' })}
              </DropdownMenuItem>
              {/* Django Admin in User Menu */}
              {isAdmin && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleDjangoAdmin}
                    className="cursor-pointer text-orange-600 hover:text-orange-700 hover:bg-orange-50 dark:hover:bg-orange-950"
                  >
                    <Shield className="h-4 w-4 mr-2" />
                    {intl.formatMessage({ id: 'djangoAdmin' }) || 'Django Admin'}
                    <ExternalLink className="h-3 w-3 ml-auto" />
                  </DropdownMenuItem>
                </>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => handleNavigation('/logout')}
                className="cursor-pointer text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <LogOut className="h-4 w-4 mr-2" />
                {intl.formatMessage({ id: 'logout' })}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
    );
  });

  // NavLink Component
  const NavLink = ({ to, children, className = '', onClick, mobile, collapsed = false, icon, label, external = false, description }) => {
    const location = useLocation();
    const isActive = !external && (to === '/dashboard/admin' || to === '/laureate'
      ? location.pathname === to
      : to === '/' ? location.pathname === '/' : location.pathname.startsWith(to));
    const paddingClass = collapsed ? 'px-3' : 'px-4';
    const baseClasses = `group flex items-center gap-3 rounded-xl ${paddingClass} py-3 transition-colors duration-200 relative text-sm font-medium`;
    const activeClasses = 'bg-primary/10 text-primary border border-primary/20 shadow-sm';
    const inactiveClasses = 'text-muted-foreground hover:bg-accent hover:text-accent-foreground';
    const externalClasses = external ? 'text-orange-600 hover:text-orange-700 hover:bg-orange-50 dark:hover:bg-orange-950' : '';
    
    const handleClick = (e) => {
      if (external) {
        e.preventDefault();
        onClick(to, true);
      } else {
        onClick(to);
      }
    };

    if (collapsed) {
      return (
        <div className="relative group/tooltip">
          {external ? (
            <button
              onClick={handleClick}
              className={`${baseClasses} ${externalClasses} ${className} justify-center w-full border-0 bg-transparent`}
            >
              {icon && React.cloneElement(icon, { className: "h-5 w-5" })}
              {external && <ExternalLink className="h-3 w-3 absolute -top-1 -right-1" />}
            </button>
          ) : (
            <Link
              to={to}
              className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses} ${className} justify-center w-full`}
              onClick={handleClick}
            >
              {icon && React.cloneElement(icon, { className: "h-5 w-5" })}
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-r-full" />
              )}
            </Link>
          )}
          <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 bg-popover text-popover-foreground px-2 py-1 rounded-md text-xs whitespace-nowrap opacity-0 group-hover/tooltip:opacity-100 transition-opacity duration-200 pointer-events-none z-50 shadow-lg border">
            {label}
            {external && description && (
              <div className="text-xs opacity-75 mt-1">{description}</div>
            )}
          </div>
        </div>
      );
    }

    const content = (
      <>
        {isActive && !external && (
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-r-full" />
        )}
        {icon && React.cloneElement(icon, { className: "h-5 w-5" })}
        <span className="flex-1">{label}</span>
        {external && <ExternalLink className="h-4 w-4 opacity-50" />}
      </>
    );

    return external ? (
      <button
        onClick={handleClick}
        className={`${baseClasses} ${externalClasses} ${mobile ? 'mx-[-0.65rem]' : ''} ${className} w-full text-left border-0 bg-transparent`}
      >
        {content}
      </button>
    ) : (
      <Link
        to={to}
        className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses} ${mobile ? 'mx-[-0.65rem]' : ''} ${className}`}
        onClick={handleClick}
      >
        {content}
      </Link>
    );
  };

  // Sidebar Component
  const Sidebar = React.memo(({ handleNavigation, mobile, currentLocale, collapsed = false }) => {
    const userInfo = getUserInfo();
    const userIsAdmin = userInfo?.is_superuser === true;
    const menuItems = userIsAdmin ? adminMenuItems : laureateMenuItems;
    const panelTitle = userIsAdmin
      ? intl.formatMessage({ id: 'adminPanel' })
      : intl.formatMessage({ id: 'laureatePortal' });
    return (
      <div className="flex h-full max-h-screen flex-col sticky top-0 bg-card/50 backdrop-blur-sm shadow-sm">
        <div className={`flex h-16 items-center border-b transition-all duration-300 ${collapsed ? 'justify-center px-4' : 'px-6'}`}>
          <Link to="/" className="flex items-center gap-2 group" onClick={() => handleNavigation('/')}>
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg">
              <span className="text-primary-foreground font-bold text-sm">F</span>
            </div>
            {!collapsed && (
              <span className="font-bold text-lg text-foreground tracking-tight">
                {intl.formatMessage({ id: 'appTitle' })}
              </span>
            )}
          </Link>
        </div>
        <nav className="flex-1 overflow-y-auto px-3 py-4 text-sm font-medium space-y-1 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
          {!collapsed && (
            <div className="text-xs text-muted-foreground mb-4 px-3">{panelTitle}</div>
          )}
          {menuItems.map((item) => {
            const Icon = item.icon;
            const translatedName = intl.formatMessage(
              { id: item.translationKey },
              { defaultMessage: item.name }
            );
            return (
              <NavLink
                key={item.name}
                to={item.href}
                onClick={handleNavigation}
                mobile={mobile}
                collapsed={collapsed}
                icon={<Icon />}
                label={translatedName}
                external={item.external}
                description={item.description}
              />
            );
          })}
          
          {/* Django Admin Link - Only for admins */}
          {userIsAdmin && (
            <>
              {!collapsed && (
                <div className="border-t pt-4 mt-4">
                  <div className="text-xs text-muted-foreground mb-4 px-3">
                    {intl.formatMessage({ id: 'systemAdmin' }) || 'System Administration'}
                  </div>
                </div>
              )}
              <a
                href="/admin/"
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center gap-3 rounded-xl py-3 text-muted-foreground transition-all hover:bg-secondary/80 hover:text-secondary-foreground bg-background ${collapsed ? 'px-3 justify-center' : 'px-4'}`}
              >
                <Shield className="h-5 w-5" />
                {!collapsed && (
                  <span>{intl.formatMessage({ id: "administratorPage" })}</span>
                )}
              </a>
              {collapsed && (
                <div className="relative group/tooltip">
                  <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 bg-popover text-popover-foreground px-2 py-1 rounded-md text-xs whitespace-nowrap opacity-0 group-hover/tooltip:opacity-100 transition-opacity duration-200 pointer-events-none z-50 shadow-lg border">
                    {intl.formatMessage({ id: "administratorPage" })}
                  </div>
                </div>
              )}
            </>
          )}
        </nav>
        <div className="border-t p-4">
          <div className={`text-xs text-muted-foreground text-center transition-all duration-300 ${collapsed ? 'opacity-0' : 'opacity-100'}`}>
            {intl.formatMessage({ id: 'footerCopyright' })}
          </div>
        </div>
      </div>
    );
  });

  // Render HomePage immediately for unauthenticated users
  if (!userRole) {
    return <HomePage />;
  }

  const sidebarWidth = sidebarCollapsed ? 'md:grid-cols-[80px_1fr] lg:grid-cols-[80px_1fr]' : 'md:grid-cols-[280px_1fr] lg:grid-cols-[320px_1fr]';

  // Render dashboard layout for authenticated users
  return (
    <div key={key} className={`grid min-h-screen w-full ${sidebarWidth} transition-all duration-300 bg-background`}>
      <div className="hidden border-r bg-card/50 backdrop-blur-sm md:block shadow-sm">
        <Sidebar
          handleNavigation={handleNavigation}
          currentLocale={currentLocale}
          collapsed={sidebarCollapsed}
        />
      </div>
      <div className="flex flex-col">
        <Header
          toggleMobileMenu={toggleMobileMenu}
          handleNavigation={handleNavigation}
          onLanguageChange={handleLanguageChange}
          currentLocale={currentLocale}
          toggleSidebar={toggleSidebar}
          sidebarCollapsed={sidebarCollapsed}
        />
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetContent side="left" className="flex flex-col p-4 pt-8 bg-card/95 backdrop-blur-sm">
            <nav className="grid gap-2 text-lg font-medium">
              <Link to="/" className="flex items-center -m-2 mb-4 gap-2 group" onClick={() => handleNavigation('/')}>
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg">
                  <span className="text-primary-foreground font-bold text-sm">F</span>
                </div>
                <span className="font-bold text-lg text-foreground tracking-tight">
                  {intl.formatMessage({ id: 'appTitle' })}
                </span>
              </Link>
              <Sidebar
                handleNavigation={handleNavigation}
                mobile
                currentLocale={currentLocale}
                collapsed={false}
              />
            </nav>
          </SheetContent>
        </Sheet>
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 bg-gradient-to-br from-background to-muted/20">
          <div className="h-full w-full rounded-xl border bg-card/50 backdrop-blur-sm shadow-sm p-4 sm:p-6 md:p-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

export default Home;