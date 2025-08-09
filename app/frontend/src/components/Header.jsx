
import { Link } from 'react-router-dom';
import { LogOut, Menu, CircleUser, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ModeToggle } from '@/components/mode-toggle';
import { intl, changeLanguage } from '@/i18n';
import { getUserInfo } from '@/login/permissions';

function Header({ toggleMobileMenu, handleNavigation }) {
  const userInfo = getUserInfo();
  const isAdmin = userInfo?.is_superuser === true;

  const handleLanguageChange = (newLocale) => {
    changeLanguage(newLocale);
  };

  return (
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
              onClick={() => handleLanguageChange(lang)}
              className={`${intl.locale === lang ? 'bg-secondary text-secondary-foreground' : ''} cursor-pointer`}
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
          <DropdownMenuLabel>
            {userInfo?.full_name || userInfo?.username || 'User'}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="text-sm">
            {isAdmin ? 'Administrator' : 'Laureate'}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => handleNavigation('/logout')}
            className="cursor-pointer text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}

export default Header;