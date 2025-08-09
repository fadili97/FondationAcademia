import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { intl, changeLanguage } from '@/i18n';
import {
  CircleUser, Home, Menu, ShieldIcon, Globe,
  Building2, Building, Wallet, ArrowRightLeft, RefreshCw, 
  Users2, FolderKanban, ClipboardList, Wrench,BarChart3,ReceiptText
} from 'lucide-react';

import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from '@/components/ui/button';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ModeToggle } from '@/components/mode-toggle';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { USER_PERMISSIONS } from '@/login/constants';

const BrandLogo = React.memo(() => (
  <span className="font-semibold text-lg text-foreground">TOPOGES</span>
));

const NavLink = React.memo(({ to, children, className = '', onClick, requiredPermission, userPermissions, isLogo }) => {
  const location = useLocation();
  const isActive = isLogo ? false : 
    to === '/' ? location.pathname === '/' : location.pathname.startsWith(to);
  
  if (requiredPermission && !userPermissions.includes(requiredPermission)) {
    return null;
  }

  if (isLogo) {
    return (
      <Link to={to} className={className} onClick={() => onClick(to)}>
        {children}
      </Link>
    );
  }

  const baseClasses = "flex items-center gap-3 rounded-md px-3 py-2 transition-all duration-200 relative";
  const activeClasses = "bg-secondary text-secondary-foreground font-medium";
  const inactiveClasses = "bg-background text-muted-foreground hover:bg-secondary/80 hover:text-secondary-foreground";
  
  return (
    <Link
      to={to}
      className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses} ${className}`}
      onClick={() => onClick(to)}
    >
      {isActive && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-7 bg-primary rounded-r-full" />
      )}
      {children}
    </Link>
  );
});

const Header = React.memo(({ handleNavigation, onLanguageChange, currentLocale, toggleMobileMenu }) => (
  <header className="sticky top-0 z-10 flex justify-end h-14 items-center gap-4 border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 lg:h-[60px] lg:px-6">
    <Button variant="ghost" size="icon" className="shrink-0 md:hidden mr-auto" onClick={toggleMobileMenu}>
      <Menu className="h-5 w-5" />
    </Button>
    <div className="flex-1 md:flex-none" />
    <ModeToggle />
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full">
          <Globe className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        {['en', 'fr'].map(lang => (
          <DropdownMenuItem 
            key={lang}
            onClick={() => onLanguageChange(lang)} 
            className={`${currentLocale === lang ? 'bg-secondary text-secondary-foreground' : ''} cursor-pointer`}
          >
            {lang === 'en' ? 'English' : 'Français'}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full">
          <CircleUser className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel>{intl.formatMessage({ id: "myAccount" })}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          onClick={() => handleNavigation('logout')} 
          className="cursor-pointer text-destructive hover:text-destructive hover:bg-destructive/10"
        >
          {intl.formatMessage({ id: "logout" })}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  </header>
));

const SidebarContent = React.memo(({ mobile, handleNavigation, userPermissions }) => (
  <div className="space-y-1">
    <NavLink
      to="/"
      className={mobile ? 'mx-[-0.65rem]' : ''}
      onClick={handleNavigation}
      userPermissions={userPermissions}
    >
      <Home className="h-5 w-5" />
      {intl.formatMessage({ id: "dashboard" })}
    </NavLink>

    {/* <NavLink
      to="/client"
      className={mobile ? 'mx-[-0.65rem]' : ''}
      onClick={handleNavigation}
      userPermissions={userPermissions}
    >
      <Users2 className="h-5 w-5" />
      {intl.formatMessage({ id: "Clients" })}
    </NavLink> */}


    

    <Accordion type="single" collapsible>


    <AccordionItem value="Invoice">
        <AccordionTrigger>
          <div className='flex items-center gap-3 rounded-lg px-3 text-muted-foreground transition-all hover:text-primary w-full text-left'>
            <ReceiptText className='h-5 w-5' />
            Invoice Management
          </div>
        </AccordionTrigger>
        <AccordionContent>
          {[
            { to: '/invoice', icon: ReceiptText , label: "Invoice" },
            { to: '/client', icon: Users2, label: "Clients" },
            { to: '/quotationlist', icon:ReceiptText, label: "Quotation List" }
          ].map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={mobile ? 'mx-[-0.65rem] ml-4' : 'ml-4'}
              onClick={handleNavigation}
              userPermissions={userPermissions}
            >
              <Icon className="h-5 w-5" />
              {label}
            </NavLink>
          ))}
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="projects">
        <AccordionTrigger>
          <div className='flex items-center gap-3 rounded-lg px-3 text-muted-foreground transition-all hover:text-primary w-full text-left'>
            <FolderKanban className='h-5 w-5' />
            Project Management
          </div>
        </AccordionTrigger>
        <AccordionContent>
          {[
            { to: '/projects', icon: ClipboardList, label: "Projects" },
            { to: '/services', icon: Wrench, label: "Services" }
          ].map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={mobile ? 'mx-[-0.65rem] ml-4' : 'ml-4'}
              onClick={handleNavigation}
              userPermissions={userPermissions}
            >
              <Icon className="h-5 w-5" />
              {label}
            </NavLink>
          ))}
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="treasury">
        <AccordionTrigger>
          <div className='flex items-center gap-3 rounded-lg px-3 text-muted-foreground transition-all hover:text-primary w-full text-left'>
            <Building2 className='h-5 w-5' />
            Treasury
          </div>
        </AccordionTrigger>
        <AccordionContent>
        <NavLink
  to="/treasury-dashboard"
  className={mobile ? 'mx-[-0.65rem] ml-4' : 'ml-4'}
  onClick={handleNavigation}
  userPermissions={userPermissions}
>
  <BarChart3 className="h-5 w-5" />
  Treasury Dashboard
</NavLink>
          {[
            { to: '/bank-accounts', icon: Building, label: "Bank_Accounts" },
            { to: '/cash-register', icon: Wallet, label: "Cash_Register" },
            { to: '/transaction', icon: ArrowRightLeft, label: "Transaction" },
            { to: '/recurring-transaction', icon: RefreshCw, label: "Recurring_Transaction" }
          ].map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={mobile ? 'mx-[-0.65rem] ml-4' : 'ml-4'}
              onClick={handleNavigation}
              userPermissions={userPermissions}
            >
              <Icon className="h-5 w-5" />
              {intl.formatMessage({ id: label })}
            </NavLink>
          ))}
        </AccordionContent>
      </AccordionItem>

     
     
    </Accordion>

    <a
      href="/admin/"
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-3 md:px-3 rounded-md py-2 text-muted-foreground transition-all hover:bg-secondary/80 hover:text-secondary-foreground bg-background"
    >
      <ShieldIcon className="h-5 w-5" />
      {intl.formatMessage({ id: "administratorPage" })}
    </a>
  </div>
));

function Dashboard() {
  const [isOpen, setIsOpen] = useState(false);
  const [userPermissions, setUserPermissions] = useState([]);
  const [currentLocale, setCurrentLocale] = useState(intl.locale);
  const navigate = useNavigate();

  useEffect(() => {
    try {
      const permissions = JSON.parse(localStorage.getItem(USER_PERMISSIONS) || '[]');
      setUserPermissions(permissions);
    } catch (error) {
      console.error('Error parsing permissions:', error);
    }
  }, []);

  const handleNavigation = useCallback((path) => {
    setIsOpen(false);
    navigate(path);
  }, [navigate]);

  const handleLanguageChange = useCallback((newLocale) => {
    changeLanguage(newLocale);
    setCurrentLocale(newLocale);
  }, []);

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[240px_1fr] lg:grid-cols-[280px_1fr]">
      <div className="hidden border-r bg-card md:block">
        <div className="flex h-full max-h-screen flex-col sticky top-0">
          <div className="flex h-14 items-center border-b px-6 lg:h-[60px]">
            <NavLink 
              to="/" 
              className="flex items-center gap-2 group" 
              onClick={handleNavigation} 
              userPermissions={userPermissions}
              isLogo={true}
            >
              <BrandLogo />
            </NavLink>
          </div>
          <nav className="flex-1 overflow-y-auto p-3 text-sm font-medium">
            <SidebarContent 
              handleNavigation={handleNavigation}
              userPermissions={userPermissions}
            />
          </nav>
        </div>
      </div>

      <div className="flex flex-col">
        <Header 
          handleNavigation={handleNavigation}
          onLanguageChange={handleLanguageChange}
          currentLocale={currentLocale}
          toggleMobileMenu={() => setIsOpen(true)}
        />
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetContent side="left" className="flex flex-col p-4 pt-8">
            <nav className="grid gap-2 text-lg font-medium">
              <NavLink 
                to="/" 
                className="flex items-center -m-2 mb-4 gap-2 group" 
                onClick={handleNavigation} 
                userPermissions={userPermissions}
                isLogo={true}
              >
                <BrandLogo />
              </NavLink>
              <SidebarContent 
                mobile
                handleNavigation={handleNavigation}
                userPermissions={userPermissions}
              />
            </nav>
          </SheetContent>
        </Sheet>

        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <div className="h-full w-full rounded-lg border bg-card shadow-sm">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

export default Dashboard;