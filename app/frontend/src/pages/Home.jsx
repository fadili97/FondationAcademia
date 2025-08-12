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

  // Header Component - Mobile Optimized
  const Header = React.memo(({ handleNavigation, onLanguageChange, currentLocale, toggleMobileMenu, toggleSidebar, sidebarCollapsed }) => {
    const userInfo = getUserInfo();
    const isAdmin = userInfo?.is_superuser === true;
    
    const handleDjangoAdmin = () => {
      window.open('/admin/', '_blank', 'noopener,noreferrer');
    };

    return (
      <header className="sticky top-0 z-10 flex h-14 sm:h-16 items-center gap-2 sm:gap-4 border-b bg-background/95 px-3 sm:px-6 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
        {/* Desktop Sidebar Toggle */}
        <Button
          variant="ghost"
          size="icon"
          className="hidden lg:flex shrink-0 hover:bg-accent h-8 w-8 sm:h-9 sm:w-9"
          onClick={toggleSidebar}
        >
          {sidebarCollapsed ? (
            <PanelLeftOpen className="h-4 w-4 sm:h-5 sm:w-5" />
          ) : (
            <PanelLeftClose className="h-4 w-4 sm:h-5 sm:w-5" />
          )}
          <span className="sr-only">{intl.formatMessage({ id: 'toggleSidebar' })}</span>
        </Button>

        {/* Mobile Menu Toggle */}
        <Button
          variant="ghost"
          size="icon"
          className="shrink-0 lg:hidden hover:bg-accent h-8 w-8 sm:h-9 sm:w-9"
          onClick={toggleMobileMenu}
        >
          <Menu className="h-4 w-4 sm:h-5 sm:w-5" />
          <span className="sr-only">{intl.formatMessage({ id: 'toggleNavigationMenu' })}</span>
        </Button>

        {/* Mobile App Title */}
        <div className="lg:hidden flex-1 min-w-0">
          <span className="font-bold text-base sm:text-lg text-foreground tracking-tight truncate">
            {intl.formatMessage({ id: 'appTitle' })}
          </span>
        </div>

        {/* Header Actions - Responsive */}
        <div className="flex items-center gap-1 sm:gap-2 ml-auto">
          {/* Django Admin - Desktop Only */}
          {isAdmin && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="relative hover:bg-accent hidden sm:flex h-8 w-8 sm:h-9 sm:w-9"
              onClick={handleDjangoAdmin}
              title={intl.formatMessage({ id: 'djangoAdmin' }) || 'Django Admin'}
            >
              <Shield className="h-4 w-4 text-orange-600" />
              <span className="sr-only">{intl.formatMessage({ id: 'djangoAdmin' })}</span>
            </Button>
          )}

          {/* Notifications - Hidden on Small Mobile */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="relative hover:bg-accent hidden sm:flex h-8 w-8 sm:h-9 sm:w-9"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute -top-1 -right-1 h-2 w-2 bg-destructive rounded-full"></span>
            <span className="sr-only">{intl.formatMessage({ id: 'notifications' })}</span>
          </Button>

          {/* Settings - Hidden on Small Mobile */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="hover:bg-accent hidden sm:flex h-8 w-8 sm:h-9 sm:w-9"
          >
            <Settings className="h-4 w-4" />
            <span className="sr-only">{intl.formatMessage({ id: 'settings' })}</span>
          </Button>

          {/* Mode Toggle */}
          <div className="h-8 w-8 sm:h-9 sm:w-9">
            <ModeToggle />
          </div>

          {/* Language Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full hover:bg-accent h-8 w-8 sm:h-9 sm:w-9">
                <Globe className="h-4 w-4" />
                <span className="sr-only">{intl.formatMessage({ id: 'toggleLanguage' })}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-36 sm:w-40">
              {['en', 'fr'].map(lang => (
                <DropdownMenuItem
                  key={lang}
                  onClick={() => onLanguageChange && onLanguageChange(lang)}
                  className={`${currentLocale === lang ? 'bg-accent text-accent-foreground' : ''} cursor-pointer text-sm`}
                >
                  {intl.formatMessage({ id: lang === 'en' ? 'english' : 'french' })}
                  <span className="ml-2">{lang === 'en' ? '🇺🇸' : '🇫🇷'}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full hover:bg-accent h-8 w-8 sm:h-9 sm:w-9">
                <CircleUser className="h-4 w-4" />
                <span className="sr-only">{intl.formatMessage({ id: 'toggleUserMenu' })}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 sm:w-52">
              <DropdownMenuLabel className="text-sm">
                {userInfo?.full_name || userInfo?.username || intl.formatMessage({ id: 'user' })}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-xs sm:text-sm">
                {isAdmin
                  ? intl.formatMessage({ id: 'administratorRole' })
                  : intl.formatMessage({ id: 'laureateRole' })}
              </DropdownMenuItem>
              
              {/* Django Admin in User Menu - Mobile Access */}
              {isAdmin && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleDjangoAdmin}
                    className="cursor-pointer text-orange-600 hover:text-orange-700 hover:bg-orange-50 dark:hover:bg-orange-950 text-sm"
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
                className="cursor-pointer text-destructive hover:text-destructive hover:bg-destructive/10 text-sm"
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

  // NavLink Component - Enhanced for Mobile
  const NavLink = ({ to, onClick, collapsed = false, icon, label, external = false, mobile = false }) => {
    const location = useLocation();
    const isActive = !external && (to === '/dashboard/admin' || to === '/laureate'
      ? location.pathname === to
      : to === '/' ? location.pathname === '/' : location.pathname.startsWith(to));
    
    const baseClasses = `group flex items-center gap-3 rounded-xl py-3 transition-all duration-200 relative text-sm font-medium`;
    const paddingClass = collapsed ? 'px-3' : 'px-4';
    const activeClasses = 'bg-primary/10 text-primary border border-primary/20 shadow-sm';
    const inactiveClasses = 'text-muted-foreground hover:bg-accent hover:text-accent-foreground';
    const externalClasses = external ? 'text-orange-600 hover:text-orange-700 hover:bg-orange-50 dark:hover:bg-orange-950' : '';
    const mobileClasses = mobile ? 'mx-0' : '';
    
    const handleClick = (e) => {
      if (external) {
        e.preventDefault();
        onClick(to, true);
      } else {
        onClick(to);
      }
    };

    // Collapsed tooltip for desktop
    if (collapsed && !mobile) {
      return (
        <div className="relative group/tooltip">
          {external ? (
            <button
              onClick={handleClick}
              className={`${baseClasses} ${externalClasses} ${paddingClass} justify-center w-full border-0 bg-transparent`}
            >
              {icon && React.cloneElement(icon, { className: "h-5 w-5" })}
              {external && <ExternalLink className="h-3 w-3 absolute -top-1 -right-1" />}
            </button>
          ) : (
            <Link
              to={to}
              className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses} ${paddingClass} justify-center w-full`}
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
          </div>
        </div>
      );
    }

    // Normal link for expanded desktop and mobile
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
        className={`${baseClasses} ${externalClasses} ${paddingClass} ${mobileClasses} w-full text-left border-0 bg-transparent`}
      >
        {content}
      </button>
    ) : (
      <Link
        to={to}
        className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses} ${paddingClass} ${mobileClasses}`}
        onClick={handleClick}
      >
        {content}
      </Link>
    );
  };

  // Desktop Sidebar Component
  const Sidebar = React.memo(({ handleNavigation, collapsed = false }) => {
    const userInfo = getUserInfo();
    const userIsAdmin = userInfo?.is_superuser === true;
    const menuItems = userIsAdmin ? adminMenuItems : laureateMenuItems;
    const panelTitle = userIsAdmin
      ? intl.formatMessage({ id: 'adminPanel' })
      : intl.formatMessage({ id: 'laureatePortal' });

    return (
      <div className="flex h-full max-h-screen flex-col sticky top-0 bg-card/50 backdrop-blur-sm shadow-sm">
        {/* Sidebar Header */}
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

        {/* Navigation */}
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
                collapsed={collapsed}
                icon={<Icon />}
                label={translatedName}
                external={item.external}
              />
            );
          })}

          {/* Django Admin Link for Admins */}
          {userIsAdmin && (
            <>
              {!collapsed && (
                <div className="border-t pt-4 mt-4">
                  <div className="text-xs text-muted-foreground mb-4 px-3">
                    {intl.formatMessage({ id: 'systemAdmin' }) || 'System Administration'}
                  </div>
                </div>
              )}
              <NavLink
                to="/admin/"
                onClick={handleNavigation}
                collapsed={collapsed}
                icon={<Shield />}
                label={intl.formatMessage({ id: 'djangoAdmin' }) || 'Django Admin'}
                external={true}
              />
            </>
          )}
        </nav>

        {/* Footer */}
        <div className="border-t p-4">
          <div className={`text-xs text-muted-foreground text-center transition-all duration-300 ${collapsed ? 'opacity-0' : 'opacity-100'}`}>
            {intl.formatMessage({ id: 'footerCopyright' })}
          </div>
        </div>
      </div>
    );
  });

  // Mobile Navigation Sheet Content
  const MobileNavigation = React.memo(({ handleNavigation, currentLocale }) => {
    const userInfo = getUserInfo();
    const userIsAdmin = userInfo?.is_superuser === true;
    const menuItems = userIsAdmin ? adminMenuItems : laureateMenuItems;
    const panelTitle = userIsAdmin
      ? intl.formatMessage({ id: 'adminPanel' })
      : intl.formatMessage({ id: 'laureatePortal' });

    return (
      <div className="flex flex-col h-full">
        {/* Mobile Header */}
        <div className="flex items-center gap-3 pb-6 border-b">
          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg">
            <span className="text-primary-foreground font-bold">F</span>
          </div>
          <div>
            <div className="font-bold text-lg text-foreground tracking-tight">
              {intl.formatMessage({ id: 'appTitle' })}
            </div>
            <div className="text-xs text-muted-foreground">{panelTitle}</div>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        <nav className="flex-1 py-6 space-y-2">
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
                icon={<Icon />}
                label={translatedName}
                mobile={true}
              />
            );
          })}

          {/* Django Admin for Mobile */}
          {userIsAdmin && (
            <div className="pt-4 mt-4 border-t">
              <div className="text-xs text-muted-foreground mb-3 px-4 font-medium">
                {intl.formatMessage({ id: 'systemAdmin' }) || 'System Administration'}
              </div>
              <NavLink
                to="/admin/"
                onClick={handleNavigation}
                icon={<Shield />}
                label={intl.formatMessage({ id: 'djangoAdmin' }) || 'Django Admin'}
                external={true}
                mobile={true}
              />
            </div>
          )}
        </nav>

        {/* Mobile Footer */}
        <div className="border-t pt-4">
          <div className="text-xs text-muted-foreground text-center">
            {intl.formatMessage({ id: 'footerCopyright' })}
          </div>
        </div>
      </div>
    );
  });

  // Render HomePage for unauthenticated users
  if (!userRole) {
    return <HomePage />;
  }

  const sidebarWidth = sidebarCollapsed ? 'lg:grid-cols-[80px_1fr]' : 'lg:grid-cols-[280px_1fr] xl:grid-cols-[320px_1fr]';

  // Render dashboard layout for authenticated users
  return (
    <div key={key} className={`grid min-h-screen w-full ${sidebarWidth} transition-all duration-300 bg-background`}>
      {/* Desktop Sidebar */}
      <div className="hidden lg:block border-r bg-card/50 backdrop-blur-sm shadow-sm">
        <Sidebar
          handleNavigation={handleNavigation}
          collapsed={sidebarCollapsed}
        />
      </div>

      {/* Main Content Area */}
      <div className="flex flex-col min-h-screen">
        {/* Header */}
        <Header
          toggleMobileMenu={toggleMobileMenu}
          handleNavigation={handleNavigation}
          onLanguageChange={handleLanguageChange}
          currentLocale={currentLocale}
          toggleSidebar={toggleSidebar}
          sidebarCollapsed={sidebarCollapsed}
        />

        {/* Mobile Navigation Sheet */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetContent side="left" className="w-72 sm:w-80 p-0">
            <div className="p-6 h-full">
              <MobileNavigation
                handleNavigation={handleNavigation}
                currentLocale={currentLocale}
              />
            </div>
          </SheetContent>
        </Sheet>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-3 sm:p-4 lg:p-6 bg-gradient-to-br from-background to-muted/20">
          <div className="h-full w-full rounded-xl border bg-card/50 backdrop-blur-sm shadow-sm overflow-hidden">
            <div className="h-full overflow-y-auto">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default Home;