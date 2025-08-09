import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { ModeToggle } from '@/components/mode-toggle';
import { intl, changeLanguage } from '@/i18n';
import { getUserInfo } from '@/login/permissions'; // Change to getUserInfo instead
import {
  GraduationCap, Heart, BookOpen, ArrowRight, Globe, Award, Users,
  TrendingUp, CheckCircle, Star, Mail, Phone, MapPin, Facebook, Twitter, Linkedin, Instagram,
  Menu, LogIn, UserPlus
} from 'lucide-react';

function HomePage() {
  const navigate = useNavigate();
  const [currentLocale, setCurrentLocale] = useState(intl.locale);
  const [key, setKey] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Better authentication check - check if user info exists and has valid token
  const userInfo = getUserInfo();
  const isLoggedIn = userInfo !== null && userInfo !== undefined;

  const handleLogin = () => {
    navigate('/login');
    setMobileMenuOpen(false);
  };

  const handleRegister = () => {
    navigate('/register');
    setMobileMenuOpen(false);
  };

  const handleLanguageChange = useCallback((newLocale) => {
    changeLanguage(newLocale);
    setCurrentLocale(newLocale);
    setKey(prevKey => prevKey + 1);
  }, []);

  return (
    <div key={key} className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-slate-900 dark:to-indigo-950">
      {/* Improved Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-white/95 dark:bg-gray-900/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-gray-900/60">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg">
                <GraduationCap className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-base sm:text-lg font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  {intl.formatMessage({ id: 'homeTitle' })}
                </h1>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-3">
              {/* Language Toggle */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-9 px-3">
                    <Globe className="h-4 w-4" />
                    <span className="ml-1 text-sm">{currentLocale.toUpperCase()}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {['en', 'fr'].map(lang => (
                    <DropdownMenuItem
                      key={lang}
                      onClick={() => handleLanguageChange(lang)}
                      className={currentLocale === lang ? 'bg-accent' : ''}
                    >
                      {intl.formatMessage({ id: lang === 'en' ? 'english' : 'french' })} {lang === 'en' ? '🇺🇸' : '🇫🇷'}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <ModeToggle />

              {/* Only show auth buttons if not logged in */}
              {!isLoggedIn && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLogin}
                    className="h-9 px-3"
                  >
                    <LogIn className="h-4 w-4 mr-2" />
                    {intl.formatMessage({ id: 'homeLogin' })}
                  </Button>

                  <Button
                    onClick={handleRegister}
                    className="h-9 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white"
                  >
                    {intl.formatMessage({ id: 'homeApply' })}
                  </Button>
                </>
              )}
            </div>

            {/* Mobile Navigation */}
            <div className="flex md:hidden items-center space-x-2">
              <ModeToggle />
              
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Toggle menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-80">
                  <SheetHeader>
                    <SheetTitle className="text-left">
                      <div className="flex items-center space-x-2">
                        <div className="p-2 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg">
                          <GraduationCap className="h-4 w-4 text-white" />
                        </div>
                        <span className="text-lg font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                          {intl.formatMessage({ id: 'homeTitle' })}
                        </span>
                      </div>
                    </SheetTitle>
                  </SheetHeader>

                  <div className="mt-8 space-y-4">
                    {/* Language Selection */}
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Language / Langue
                      </h3>
                      <div className="grid grid-cols-2 gap-2">
                        {['en', 'fr'].map(lang => (
                          <Button
                            key={lang}
                            variant={currentLocale === lang ? "default" : "outline"}
                            size="sm"
                            onClick={() => handleLanguageChange(lang)}
                            className="justify-start"
                          >
                            {lang === 'en' ? '🇺🇸 English' : '🇫🇷 Français'}
                          </Button>
                        ))}
                      </div>
                    </div>

                    {/* Navigation Actions - Only show if not logged in */}
                    {!isLoggedIn && (
                      <div className="space-y-3 pt-6 border-t">
                        <Button
                          variant="outline"
                          onClick={handleLogin}
                          className="w-full justify-start h-12"
                        >
                          <LogIn className="h-4 w-4 mr-3" />
                          {intl.formatMessage({ id: 'homeLogin' })}
                        </Button>

                        <Button
                          onClick={handleRegister}
                          className="w-full justify-start h-12 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white"
                        >
                          <UserPlus className="h-4 w-4 mr-3" />
                          {intl.formatMessage({ id: 'homeApply' })}
                        </Button>
                      </div>
                    )}

                    {/* Additional Info */}
                    <div className="pt-6 border-t">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {intl.formatMessage({ id: 'homeTagline' })}
                      </p>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-16 lg:py-24">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/10 to-purple-600/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="mb-8">
              <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300 mb-6">
                <Star className="h-4 w-4 mr-2" />
                {intl.formatMessage({ id: 'homeHeroBadge' })}
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold text-gray-900 dark:text-white mb-6 leading-tight">
              <span className="block">{intl.formatMessage({ id: 'homeHeroTitle1' })}</span>
              <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                {intl.formatMessage({ id: 'homeHeroTitle2' })}
              </span>
            </h1>
            <p className="text-lg sm:text-xl lg:text-2xl text-gray-600 dark:text-gray-300 mb-10 max-w-4xl mx-auto leading-relaxed">
              {intl.formatMessage({ id: 'homeHeroDescription' })}
            </p>
            
            {/* Only show CTA buttons if not logged in */}
            {!isLoggedIn && (
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
                <Button
                  size="lg"
                  onClick={handleRegister}
                  className="w-full sm:w-auto px-8 lg:px-12 py-4 lg:py-6 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-lg font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 rounded-2xl"
                >
                  {intl.formatMessage({ id: 'homeHeroStartApplication' })}
                  <ArrowRight className="ml-3 h-5 w-5" />
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleLogin}
                  className="w-full sm:w-auto px-8 lg:px-12 py-4 lg:py-6 border-2 border-indigo-200 text-indigo-700 hover:bg-indigo-50 dark:border-indigo-800 dark:text-indigo-400 dark:hover:bg-indigo-950 text-lg font-semibold transition-all duration-300 rounded-2xl"
                >
                  {intl.formatMessage({ id: 'homeHeroStudentPortal' })}
                </Button>
              </div>
            )}

            {/* Quick Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-8 max-w-4xl mx-auto">
              {[
                { number: '500+', label: intl.formatMessage({ id: 'homeStatsStudents' }) },
                { number: '50+', label: intl.formatMessage({ id: 'homeStatsUniversities' }) },
                { number: '2M€+', label: intl.formatMessage({ id: 'homeStatsScholarships' }) },
                { number: '95%', label: intl.formatMessage({ id: 'homeStatsSuccess' }) },
              ].map((stat, index) => (
                <div key={index} className="text-center p-4 bg-white/50 dark:bg-gray-800/50 backdrop-blur rounded-xl border border-gray-200/50 dark:border-gray-700/50">
                  <div className="text-2xl lg:text-3xl font-bold text-indigo-600 dark:text-indigo-400">{stat.number}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Values */}
      <section className="py-16 lg:py-24 bg-white/50 dark:bg-gray-800/50 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              {intl.formatMessage({ id: 'homeMissionTitle' })}
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              {intl.formatMessage({ id: 'homeMissionDescription' })}
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: BookOpen,
                title: intl.formatMessage({ id: 'homeValuesExcellenceTitle' }),
                description: intl.formatMessage({ id: 'homeValuesExcellenceDescription' }),
                color: 'from-emerald-500 to-teal-600'
              },
              {
                icon: Heart,
                title: intl.formatMessage({ id: 'homeValuesImpactTitle' }),
                description: intl.formatMessage({ id: 'homeValuesImpactDescription' }),
                color: 'from-rose-500 to-pink-600'
              },
              {
                icon: Globe,
                title: intl.formatMessage({ id: 'homeValuesGlobalTitle' }),
                description: intl.formatMessage({ id: 'homeValuesGlobalDescription' }),
                color: 'from-blue-500 to-indigo-600'
              },
            ].map((value, index) => {
              const Icon = value.icon;
              return (
                <Card key={index} className="group hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur">
                  <CardHeader className="text-center pb-4">
                    <div className={`mx-auto w-16 h-16 lg:w-20 lg:h-20 bg-gradient-to-br ${value.color} rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:shadow-xl transition-all duration-300 transform group-hover:scale-110`}>
                      <Icon className="h-8 w-8 lg:h-10 lg:w-10 text-white" />
                    </div>
                    <CardTitle className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">
                      {value.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-gray-600 dark:text-gray-300 text-center leading-relaxed">
                      {value.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Application Process */}
      <section className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              {intl.formatMessage({ id: 'homeProcessTitle' })}
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              {intl.formatMessage({ id: 'homeProcessSubtitle' })}
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                step: '01',
                title: intl.formatMessage({ id: 'homeProcessStep1Title' }),
                description: intl.formatMessage({ id: 'homeProcessStep1Description' }),
                color: 'from-emerald-500 to-teal-500'
              },
              {
                step: '02',
                title: intl.formatMessage({ id: 'homeProcessStep2Title' }),
                description: intl.formatMessage({ id: 'homeProcessStep2Description' }),
                color: 'from-amber-500 to-orange-500'
              },
              {
                step: '03',
                title: intl.formatMessage({ id: 'homeProcessStep3Title' }),
                description: intl.formatMessage({ id: 'homeProcessStep3Description' }),
                color: 'from-blue-500 to-indigo-500'
              },
            ].map((step, index) => (
              <div key={index} className="text-center group">
                <div className={`inline-flex items-center justify-center w-20 h-20 lg:w-24 lg:h-24 bg-gradient-to-br ${step.color} rounded-3xl text-white font-bold text-2xl lg:text-3xl mb-6 shadow-xl group-hover:shadow-2xl transition-all duration-300 transform group-hover:scale-110`}>
                  {step.step}
                </div>
                <h3 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  {step.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section - Only show if not logged in */}
      {!isLoggedIn && (
        <section className="py-16 lg:py-24 bg-gradient-to-br from-indigo-600 to-purple-700 relative overflow-hidden">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="relative max-w-5xl mx-auto text-center px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl lg:text-5xl font-bold text-white mb-6">
              {intl.formatMessage({ id: 'homeCtaTitle' })}
            </h2>
            <p className="text-xl text-indigo-100 mb-10 max-w-3xl mx-auto">
              {intl.formatMessage({ id: 'homeCtaDescription' })}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                onClick={handleRegister}
                className="w-full sm:w-auto px-12 py-6 bg-white text-indigo-600 hover:bg-gray-50 text-lg font-bold shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 rounded-2xl"
              >
                {intl.formatMessage({ id: 'homeCtaApply' })}
              </Button>
              <Button
                size="lg"
                className="w-full sm:w-auto px-12 py-6 bg-white text-indigo-600 hover:bg-gray-50 text-lg font-bold shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 rounded-2xl"
              >
                {intl.formatMessage({ id: 'homeCtaLearnMore' })}
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-4 mb-12">
            <div className="lg:col-span-1">
              <div className="flex items-center mb-6">
                <div className="p-2 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl mr-3">
                  <GraduationCap className="h-6 w-6 text-white" />
                </div>
                <span className="text-xl font-bold">
                  {intl.formatMessage({ id: 'homeTitle' })}
                </span>
              </div>
              <p className="text-gray-300 leading-relaxed mb-6">
                {intl.formatMessage({ id: 'homeFooterDescription' })}
              </p>
              <div className="flex space-x-4">
                {[Facebook, Twitter, Linkedin, Instagram].map((Icon, index) => (
                  <Button key={index} variant="ghost" size="sm" className="text-gray-400 hover:text-white hover:bg-gray-800 rounded-full p-2">
                    <Icon className="h-5 w-5" />
                  </Button>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-lg font-bold mb-6 text-indigo-300">
                {intl.formatMessage({ id: 'homeFooterQuickLinks' })}
              </h4>
              <div className="space-y-3">
                {/* Only show auth links if not logged in */}
                {!isLoggedIn && (
                  <>
                    <button
                      onClick={handleRegister}
                      className="block text-gray-300 hover:text-indigo-300 transition-colors duration-200 font-medium"
                    >
                      {intl.formatMessage({ id: 'homeFooterApplyNow' })}
                    </button>
                    <button
                      onClick={handleLogin}
                      className="block text-gray-300 hover:text-indigo-300 transition-colors duration-200 font-medium"
                    >
                      {intl.formatMessage({ id: 'homeFooterStudentPortal' })}
                    </button>
                  </>
                )}
              </div>
            </div>
            <div>
              <h4 className="text-lg font-bold mb-6 text-emerald-300">
                {intl.formatMessage({ id: 'homeFooterPrograms' })}
              </h4>
              <div className="space-y-3">
                {[
                  intl.formatMessage({ id: 'homeFooterUndergraduate' }),
                  intl.formatMessage({ id: 'homeFooterGraduate' }),
                  intl.formatMessage({ id: 'homeFooterResearch' }),
                ].map((program, index) => (
                  <p key={index} className="text-gray-300 font-medium">{program}</p>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-lg font-bold mb-6 text-rose-300">
                {intl.formatMessage({ id: 'homeFooterContact' })}
              </h4>
              <div className="space-y-4">
                {[
                  { icon: Mail, text: 'contact@fondation-academia.fr' },
                  { icon: Phone, text: '+33 1 23 45 67 89' },
                  { icon: MapPin, text: 'Paris, France' },
                ].map((contact, index) => {
                  const Icon = contact.icon;
                  return (
                    <div key={index} className="flex items-center text-gray-300">
                      <Icon className="h-4 w-4 mr-3 text-gray-400" />
                      <span className="font-medium">{contact.text}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          <div className="border-t border-gray-700 pt-8 text-center">
            <p className="text-gray-400">
              {intl.formatMessage({ id: 'homeFooterCopyright' })}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default HomePage;