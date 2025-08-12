import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { ModeToggle } from '@/components/mode-toggle';
import { intl, changeLanguage } from '@/i18n';
import { getUserInfo } from '@/login/permissions';
import {
  GraduationCap, Heart, BookOpen, ArrowRight, Globe, Award, Users,
  TrendingUp, CheckCircle, Star, Mail, Phone, MapPin,
  Menu, LogIn, UserPlus, LayoutDashboard, Settings, Calendar, FileText, CreditCard, 
  Target, Briefcase, MessageCircle
} from 'lucide-react';

function HomePage() {
  const navigate = useNavigate();
  const [currentLocale, setCurrentLocale] = useState(intl.locale);
  const [key, setKey] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Better authentication check - check if user info exists and has valid token
  const userInfo = getUserInfo();
  const isLoggedIn = userInfo !== null && userInfo !== undefined;
  
  // Get user role for dashboard routing
  const userRole = userInfo?.role || userInfo?.user?.role;
  const isAdmin = userRole === 'admin';
  const isLaureate = userRole === 'laureate';

  const handleLogin = () => {
    navigate('/login');
    setMobileMenuOpen(false);
  };

  const handleRegister = () => {
    navigate('/register');
    setMobileMenuOpen(false);
  };

  const handleDashboard = () => {
    if (isAdmin) {
      navigate('/dashboard/admin');
    } else if (isLaureate) {
      navigate('/laureate');
    }
    setMobileMenuOpen(false);
  };

  const handleLanguageChange = useCallback((newLocale) => {
    changeLanguage(newLocale);
    setCurrentLocale(newLocale);
    setKey(prevKey => prevKey + 1);
  }, []);

  // Get dashboard button text based on role
  const getDashboardButtonText = () => {
    if (isAdmin) {
      return currentLocale === 'fr' ? 'Tableau de Bord Admin' : 'Admin Dashboard';
    } else if (isLaureate) {
      return currentLocale === 'fr' ? 'Mon Tableau de Bord' : 'My Dashboard';
    }
    return 'Dashboard';
  };

  return (
    <div key={key} className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-slate-900 dark:to-indigo-950">
      {/* Header */}
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
                  Fondation Academia
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
                      {lang === 'en' ? 'English 🇺🇸' : 'Français 🇫🇷'}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <ModeToggle />

              {/* Show dashboard button if logged in, auth buttons if not */}
              {isLoggedIn ? (
                <Button
                  onClick={handleDashboard}
                  className="h-9 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white"
                >
                  <LayoutDashboard className="h-4 w-4 mr-2" />
                  {getDashboardButtonText()}
                </Button>
              ) : (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLogin}
                    className="h-9 px-3"
                  >
                    <LogIn className="h-4 w-4 mr-2" />
                    {currentLocale === 'fr' ? 'Connexion' : 'Login'}
                  </Button>

                  <Button
                    onClick={handleRegister}
                    className="h-9 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white"
                  >
                    {currentLocale === 'fr' ? 'Candidater' : 'Apply'}
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
                          Fondation Academia
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

                    {/* Navigation Actions */}
                    <div className="space-y-3 pt-6 border-t">
                      {isLoggedIn ? (
                        <Button
                          onClick={handleDashboard}
                          className="w-full justify-start h-12 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white"
                        >
                          <LayoutDashboard className="h-4 w-4 mr-3" />
                          {getDashboardButtonText()}
                        </Button>
                      ) : (
                        <>
                          <Button
                            variant="outline"
                            onClick={handleLogin}
                            className="w-full justify-start h-12"
                          >
                            <LogIn className="h-4 w-4 mr-3" />
                            {currentLocale === 'fr' ? 'Connexion' : 'Login'}
                          </Button>

                          <Button
                            onClick={handleRegister}
                            className="w-full justify-start h-12 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white"
                          >
                            <UserPlus className="h-4 w-4 mr-3" />
                            {currentLocale === 'fr' ? 'Candidater' : 'Apply'}
                          </Button>
                        </>
                      )}
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
        <div className="absolute inset-0 bg-gradient-to-br from-green-600/10 to-emerald-600/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="mb-8">
              <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300 mb-6">
                <Star className="h-4 w-4 mr-2" />
                {currentLocale === 'fr' ? '🇲🇦 Excellence depuis 1996' : '🇲🇦 Excellence since 1996'}
              </span>
            </div>
            
            {/* Show personalized message if logged in */}
            {isLoggedIn && (
              <div className="mb-8">
                <h2 className="text-2xl sm:text-3xl font-bold text-indigo-600 dark:text-indigo-400 mb-4">
                  {currentLocale === 'fr' 
                    ? `Bienvenue, ${userInfo?.name || userInfo?.user?.name || 'Utilisateur'} !`
                    : `Welcome back, ${userInfo?.name || userInfo?.user?.name || 'User'}!`
                  }
                </h2>
                <Button
                  size="lg"
                  onClick={handleDashboard}
                  className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-lg font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 rounded-2xl"
                >
                  <LayoutDashboard className="mr-3 h-5 w-5" />
                  {getDashboardButtonText()}
                  <ArrowRight className="ml-3 h-5 w-5" />
                </Button>
              </div>
            )}
            
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold text-gray-900 dark:text-white mb-6 leading-tight">
              <span className="block">
                {currentLocale === 'fr' ? 'Fondation Academia' : 'Academia Foundation'}
              </span>
              <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                {currentLocale === 'fr' ? 'pour l\'Excellence et le Mérite' : 'for Excellence and Merit'}
              </span>
            </h1>
            <p className="text-lg sm:text-xl lg:text-2xl text-gray-600 dark:text-gray-300 mb-10 max-w-4xl mx-auto leading-relaxed">
              {currentLocale === 'fr' 
                ? 'Créée par de grandes entreprises au Maroc, la Fondation Academia offre des prêts d\'honneur aux étudiants marocains les plus méritants et de condition modeste pour leur permettre de financer des études de haut niveau au Maroc ou à l\'étranger.'
                : 'Created by major companies in Morocco, the Academia Foundation offers honor loans to the most deserving Moroccan students from modest backgrounds to enable them to finance high-level studies in Morocco or abroad.'
              }
            </p>
            
            {/* Only show CTA buttons if not logged in */}
            {!isLoggedIn && (
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
                <Button
                  size="lg"
                  onClick={handleRegister}
                  className="w-full sm:w-auto px-8 lg:px-12 py-4 lg:py-6 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-lg font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 rounded-2xl"
                >
                  {currentLocale === 'fr' ? 'Déposer ma candidature' : 'Submit my application'}
                  <ArrowRight className="ml-3 h-5 w-5" />
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleLogin}
                  className="w-full sm:w-auto px-8 lg:px-12 py-4 lg:py-6 border-2 border-green-200 text-green-700 hover:bg-green-50 dark:border-green-800 dark:text-green-400 dark:hover:bg-green-950 text-lg font-semibold transition-all duration-300 rounded-2xl"
                >
                  {currentLocale === 'fr' ? 'Espace Étudiant' : 'Student Portal'}
                </Button>
              </div>
            )}

            {/* Quick Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-8 max-w-4xl mx-auto">
              {[
                { 
                  number: '28e', 
                  label: currentLocale === 'fr' ? 'Campagne' : 'Campaign' 
                },
                { 
                  number: '25', 
                  label: currentLocale === 'fr' ? 'Bourses par an' : 'Scholarships per year' 
                },
                { 
                  number: '70K DH', 
                  label: currentLocale === 'fr' ? 'Prêt max/an' : 'Max loan/year' 
                },
                { 
                  number: '10 ans', 
                  label: currentLocale === 'fr' ? 'Remboursement' : 'Repayment period' 
                },
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
              {currentLocale === 'fr' ? 'Notre Mission' : 'Our Mission'}
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-4xl mx-auto">
              {currentLocale === 'fr' 
                ? 'Soutenir l\'excellence académique et offrir des opportunités d\'éducation de haut niveau aux étudiants marocains méritants, quelle que soit leur situation financière.'
                : 'Support academic excellence and provide high-level educational opportunities to deserving Moroccan students, regardless of their financial situation.'
              }
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: BookOpen,
                title: currentLocale === 'fr' ? 'Excellence Académique' : 'Academic Excellence',
                description: currentLocale === 'fr' 
                  ? 'Soutien aux étudiants admis dans les grandes écoles marocaines et étrangères de premier plan, avec un focus sur l\'excellence académique et le mérite.'
                  : 'Support for students admitted to top Moroccan and foreign institutions, with a focus on academic excellence and merit.',
                color: 'from-emerald-500 to-teal-600'
              },
              {
                icon: Heart,
                title: currentLocale === 'fr' ? 'Égalité des Chances' : 'Equal Opportunities',
                description: currentLocale === 'fr' 
                  ? 'Accompagnement des étudiants de condition modeste pour leur donner accès à une formation de haut niveau, indépendamment de leur situation financière.'
                  : 'Supporting students from modest backgrounds to give them access to high-level education, regardless of their financial situation.',
                color: 'from-rose-500 to-pink-600'
              },
              {
                icon: Globe,
                title: currentLocale === 'fr' ? 'Formation Internationale' : 'International Education',
                description: currentLocale === 'fr' 
                  ? 'Financement d\'études de haut niveau soit au Maroc soit à l\'étranger, pour préparer les leaders de demain du Maroc.'
                  : 'Financing high-level studies either in Morocco or abroad, to prepare Morocco\'s leaders of tomorrow.',
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

      {/* Eligibility Criteria */}
      <section className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              {currentLocale === 'fr' ? 'Critères d\'Éligibilité' : 'Eligibility Criteria'}
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              {currentLocale === 'fr' 
                ? 'Les conditions requises pour bénéficier d\'un prêt d\'honneur'
                : 'Required conditions to benefit from an honor loan'
              }
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                step: '🇲🇦',
                title: currentLocale === 'fr' ? 'Nationalité Marocaine' : 'Moroccan Nationality',
                description: currentLocale === 'fr' 
                  ? 'Être de nationalité marocaine est une condition obligatoire pour bénéficier du prêt d\'honneur.'
                  : 'Being of Moroccan nationality is a mandatory condition to benefit from the honor loan.',
                color: 'from-red-500 to-green-500'
              },
              {
                step: '🎓',
                title: currentLocale === 'fr' ? 'Admission dans une Grande École' : 'Admission to a Top School',
                description: currentLocale === 'fr' 
                  ? 'Avoir réussi aux concours d\'entrée d\'une grande école marocaine ou étrangère, ou être admis en cycle universitaire de type anglo-saxon.'
                  : 'Having passed entrance exams to a top Moroccan or foreign school, or being admitted to an Anglo-Saxon university cycle.',
                color: 'from-amber-500 to-orange-500'
              },
              {
                step: '💰',
                title: currentLocale === 'fr' ? 'Situation Financière' : 'Financial Situation',
                description: currentLocale === 'fr' 
                  ? 'Produire des documents justifiant l\'insuffisance des ressources familiales et permettant de calculer ces ressources.'
                  : 'Provide documents proving insufficient family resources and allowing calculation of these resources.',
                color: 'from-blue-500 to-indigo-500'
              },
            ].map((criteria, index) => (
              <div key={index} className="text-center group">
                <div className={`inline-flex items-center justify-center w-20 h-20 lg:w-24 lg:h-24 bg-gradient-to-br ${criteria.color} rounded-3xl text-white font-bold text-2xl lg:text-3xl mb-6 shadow-xl group-hover:shadow-2xl transition-all duration-300 transform group-hover:scale-110`}>
                  {criteria.step}
                </div>
                <h3 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  {criteria.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  {criteria.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Application Programs */}
      <section className="py-16 lg:py-24 bg-white/50 dark:bg-gray-800/50 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              {currentLocale === 'fr' ? 'Programmes de Candidature' : 'Application Programs'}
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              {currentLocale === 'fr' 
                ? 'Trois programmes spécialisés selon votre parcours académique'
                : 'Three specialized programs according to your academic path'
              }
            </p>
          </div>
          <div className="grid gap-8 lg:grid-cols-3">
            {[
              {
                icon: Target,
                title: currentLocale === 'fr' ? 'Programme Post-CPGE' : 'Post-CPGE Program',
                description: currentLocale === 'fr' 
                  ? 'Pour les étudiants issus de classes préparatoires admis dans une grande école marocaine ou française.'
                  : 'For students from preparatory classes admitted to a major Moroccan or French school.',
                deadline: currentLocale === 'fr' ? 'Deadline: 5 septembre 2025' : 'Deadline: September 5, 2025',
                link: 'https://forms.gle/vntMeG8Mw5E7crFm6',
                color: 'from-purple-500 to-indigo-600'
              },
              {
                icon: Globe,
                title: currentLocale === 'fr' ? 'Double Diplôme/Master' : 'Dual Degree/Master',
                description: currentLocale === 'fr' 
                  ? 'Pour les étudiants titulaires d\'au moins un Bac+2, inscrits dans un Master ou Double Diplôme à l\'étranger.'
                  : 'For students with at least a Bachelor\'s degree, enrolled in a Master\'s or Dual Degree abroad.',
                deadline: currentLocale === 'fr' ? 'Deadline: 9 mai 2025' : 'Deadline: May 9, 2025',
                link: 'https://forms.gle/yqkZb3U6KkR3aPZ57',
                color: 'from-emerald-500 to-teal-600'
              },
              {
                icon: FileText,
                title: currentLocale === 'fr' ? 'Accompagnement Visa' : 'Visa Support',
                description: currentLocale === 'fr' 
                  ? 'Lettre de soutien officielle pour les épreuves orales des concours d\'entrée aux Grandes Écoles françaises.'
                  : 'Official support letter for oral exams of entrance competitions to French Grandes Écoles.',
                deadline: currentLocale === 'fr' ? 'Deadline: 7 juin 2025' : 'Deadline: June 7, 2025',
                link: 'https://forms.gle/NkwYEE2Zd7pbU1th8',
                color: 'from-orange-500 to-red-600'
              },
            ].map((program, index) => {
              const Icon = program.icon;
              return (
                <Card key={index} className="group hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur h-full">
                  <CardHeader className="text-center pb-4">
                    <div className={`mx-auto w-16 h-16 lg:w-20 lg:h-20 bg-gradient-to-br ${program.color} rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:shadow-xl transition-all duration-300 transform group-hover:scale-110`}>
                      <Icon className="h-8 w-8 lg:h-10 lg:w-10 text-white" />
                    </div>
                    <CardTitle className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white mb-2">
                      {program.title}
                    </CardTitle>
                    <div className="text-sm font-semibold text-orange-600 dark:text-orange-400 mb-4">
                      {program.deadline}
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col">
                    <CardDescription className="text-gray-600 dark:text-gray-300 text-center leading-relaxed mb-6 flex-1">
                      {program.description}
                    </CardDescription>
                    <Button 
                      className={`w-full bg-gradient-to-r ${program.color} hover:shadow-lg text-white`}
                      onClick={() => window.open(program.link, '_blank')}
                    >
                      {currentLocale === 'fr' ? 'Candidater' : 'Apply Now'}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Loan Details */}
      <section className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              {currentLocale === 'fr' ? 'Détails du Prêt d\'Honneur' : 'Honor Loan Details'}
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              {currentLocale === 'fr' 
                ? 'Conditions et modalités de remboursement du prêt d\'honneur Academia'
                : 'Terms and repayment conditions of the Academia honor loan'
              }
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-2 mb-16">
            {/* Loan Amount Card */}
            <Card className="group hover:shadow-2xl transition-all duration-300 border-0 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20">
              <CardHeader className="text-center">
                <div className="mx-auto w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mb-4">
                  <CreditCard className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                  {currentLocale === 'fr' ? 'Montant du Prêt' : 'Loan Amount'}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <div className="text-4xl font-bold text-indigo-600 dark:text-indigo-400">
                  17,500 - 70,000 DH
                </div>
                <p className="text-gray-600 dark:text-gray-300">
                  {currentLocale === 'fr' ? 'Par année académique' : 'Per academic year'}
                </p>
                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                  <p>• {currentLocale === 'fr' ? '10 mensualités par an' : '10 monthly payments per year'}</p>
                  <p>• {currentLocale === 'fr' ? 'Durée : 1, 2 ou 3 années' : 'Duration: 1, 2 or 3 years'}</p>
                  <p>• {currentLocale === 'fr' ? 'Sous condition de réussite' : 'Subject to academic success'}</p>
                </div>
              </CardContent>
            </Card>

            {/* Repayment Card */}
            <Card className="group hover:shadow-2xl transition-all duration-300 border-0 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
              <CardHeader className="text-center">
                <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-4">
                  <Calendar className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                  {currentLocale === 'fr' ? 'Remboursement' : 'Repayment'}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <div className="text-4xl font-bold text-blue-600 dark:text-blue-400">
                  10 {currentLocale === 'fr' ? 'ans max' : 'years max'}
                </div>
                <p className="text-gray-600 dark:text-gray-300">
                  {currentLocale === 'fr' ? 'Mensualités étalées' : 'Monthly installments'}
                </p>
                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                  <p>• {currentLocale === 'fr' ? 'Démarrage dès la vie active' : 'Starts upon entering active life'}</p>
                  <p>• {currentLocale === 'fr' ? 'Remboursements anticipés bienvenus' : 'Early repayments welcome'}</p>
                  <p>• {currentLocale === 'fr' ? 'Taux d\'intérêt préférentiel' : 'Preferential interest rate'}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Selection Process */}
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur rounded-3xl p-8 lg:p-12 shadow-xl">
            <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white text-center mb-8">
              {currentLocale === 'fr' ? 'Processus de Sélection' : 'Selection Process'}
            </h3>
            <div className="grid gap-6 md:grid-cols-4">
              {[
                {
                  step: '1',
                  title: currentLocale === 'fr' ? 'Dépôt du Dossier' : 'Application Submission',
                  description: currentLocale === 'fr' 
                    ? 'Avant le 30 août 2024 au siège de la Fondation'
                    : 'Before August 30, 2024 at the Foundation headquarters',
                  date: currentLocale === 'fr' ? '30 août' : 'Aug 30'
                },
                {
                  step: '2',
                  title: currentLocale === 'fr' ? 'Évaluation' : 'Evaluation',
                  description: currentLocale === 'fr' 
                    ? 'Étude approfondie par le Comité de sélection'
                    : 'Thorough review by the Selection Committee',
                  date: currentLocale === 'fr' ? 'Sept' : 'Sept'
                },
                {
                  step: '3',
                  title: currentLocale === 'fr' ? 'Résultats' : 'Results',
                  description: currentLocale === 'fr' 
                    ? 'Communication des résultats par courrier'
                    : 'Results communicated by mail',
                  date: currentLocale === 'fr' ? 'Début oct' : 'Early Oct'
                },
                {
                  step: '4',
                  title: currentLocale === 'fr' ? 'Confirmation' : 'Confirmation',
                  description: currentLocale === 'fr' 
                    ? 'Confirmation avant le 15 octobre'
                    : 'Confirmation before October 15',
                  date: currentLocale === 'fr' ? '15 oct' : 'Oct 15'
                }
              ].map((process, index) => (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center text-white font-bold text-xl mb-4 mx-auto">
                    {process.step}
                  </div>
                  <h4 className="font-bold text-gray-900 dark:text-white mb-2">{process.title}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">{process.description}</p>
                  <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">{process.date}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Contact Information */}
      <section className="py-16 lg:py-24 bg-white/50 dark:bg-gray-800/50 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              {currentLocale === 'fr' ? 'Contact' : 'Contact'}
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              {currentLocale === 'fr' 
                ? 'Présidence actuelle Nov 2023 - 2025 de Fondation ACADEMIA'
                : 'Current Presidency Nov 2023 - 2025 of ACADEMIA Foundation'
              }
            </p>
          </div>

          {/* Contact Details - Single Card */}
          <div className="max-w-4xl mx-auto">
            <Card className="hover:shadow-2xl transition-all duration-300 border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white flex items-center justify-center">
                  <MapPin className="h-6 w-6 mr-3 text-green-600" />
                  {currentLocale === 'fr' ? 'Informations de Contact' : 'Contact Information'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-3">
                  <div className="text-center space-y-2">
                    <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900 rounded-xl flex items-center justify-center mx-auto">
                      <Briefcase className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">Fondation CDG</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">B.P. 408, Place Moulay EL Hassan</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Rabat, Maroc</p>
                  </div>

                  <div className="text-center space-y-2">
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-xl flex items-center justify-center mx-auto">
                      <Mail className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">Email</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">foundationacademia@gmail.com</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">academiafondation@gmail.com</p>
                  </div>

                  <div className="text-center space-y-2">
                    <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-xl flex items-center justify-center mx-auto">
                      <Phone className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">Téléphone</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">05 37 66 90 23</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">WhatsApp: +212 669-231359</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      ({currentLocale === 'fr' ? 'heures de bureau' : 'office hours'} - Mme El Maarouf)
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section - Only show if not logged in */}
      {!isLoggedIn && (
        <section className="py-16 lg:py-24 bg-gradient-to-br from-indigo-600 to-purple-700 relative overflow-hidden">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="relative max-w-5xl mx-auto text-center px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl lg:text-5xl font-bold text-white mb-6">
              {currentLocale === 'fr' ? 'Prêt à Commencer ?' : 'Ready to Start?'}
            </h2>
            <p className="text-xl text-indigo-100 mb-10 max-w-3xl mx-auto">
              {currentLocale === 'fr' 
                ? 'Rejoignez des centaines d\'étudiants marocains qui ont transformé leur avenir grâce à la Fondation Academia.'
                : 'Join hundreds of Moroccan students who have transformed their future thanks to the Academia Foundation.'
              }
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                onClick={handleRegister}
                className="w-full sm:w-auto px-12 py-6 bg-white text-indigo-600 hover:bg-gray-50 text-lg font-bold shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 rounded-2xl"
              >
                {currentLocale === 'fr' ? 'Déposer ma Candidature' : 'Submit My Application'}
              </Button>
              <Button
                size="lg"
                className="w-full sm:w-auto px-12 py-6 bg-white text-indigo-600 hover:bg-gray-50 text-lg font-bold shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 rounded-2xl"
                onClick={() => window.open('mailto:foundationacademia@gmail.com', '_blank')}
              >
                {currentLocale === 'fr' ? 'Nous Contacter' : 'Contact Us'}
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
                <span className="text-xl font-bold">Fondation Academia</span>
              </div>
              <p className="text-gray-300 leading-relaxed mb-6">
                {currentLocale === 'fr' 
                  ? 'Ensemble, transformons l\'avenir de l\'éducation et créons les leaders de demain du Maroc.'
                  : 'Together, let\'s transform the future of education and create Morocco\'s leaders of tomorrow.'
                }
              </p>
            </div>
            
            <div>
              <h4 className="text-lg font-bold mb-6 text-indigo-300">
                {currentLocale === 'fr' ? 'Liens Rapides' : 'Quick Links'}
              </h4>
              <div className="space-y-3">
                {isLoggedIn ? (
                  <button
                    onClick={handleDashboard}
                                            className="block text-gray-300 hover:text-indigo-300 transition-colors duration-200 font-medium"
                  >
                    {getDashboardButtonText()}
                  </button>
                ) : (
                  <>
                    <button
                      onClick={handleRegister}
                      className="block text-gray-300 hover:text-indigo-300 transition-colors duration-200 font-medium"
                    >
                      {currentLocale === 'fr' ? 'Candidater' : 'Apply Now'}
                    </button>
                    <button
                      onClick={handleLogin}
                                              className="block text-gray-300 hover:text-indigo-300 transition-colors duration-200 font-medium"
                    >
                      {currentLocale === 'fr' ? 'Espace Étudiant' : 'Student Portal'}
                    </button>
                  </>
                )}
              </div>
            </div>
            
            <div>
              <h4 className="text-lg font-bold mb-6 text-emerald-300">
                {currentLocale === 'fr' ? 'Programmes' : 'Programs'}
              </h4>
              <div className="space-y-3">
                <p className="text-gray-300 font-medium">
                  {currentLocale === 'fr' ? 'Post-CPGE' : 'Post-CPGE'}
                </p>
                <p className="text-gray-300 font-medium">
                  {currentLocale === 'fr' ? 'Double Diplôme/Master' : 'Dual Degree/Master'}
                </p>
                <p className="text-gray-300 font-medium">
                  {currentLocale === 'fr' ? 'Accompagnement Visa' : 'Visa Support'}
                </p>
              </div>
            </div>
            
            <div>
              <h4 className="text-lg font-bold mb-6 text-rose-300">Contact</h4>
              <div className="space-y-4">
                <div className="flex items-center text-gray-300">
                  <Mail className="h-4 w-4 mr-3 text-gray-400" />
                  <span className="font-medium text-sm">foundationacademia@gmail.com</span>
                </div>
                <div className="flex items-center text-gray-300">
                  <Phone className="h-4 w-4 mr-3 text-gray-400" />
                  <span className="font-medium text-sm">05 37 66 90 23</span>
                </div>
                <div className="flex items-center text-gray-300">
                  <MapPin className="h-4 w-4 mr-3 text-gray-400" />
                  <span className="font-medium text-sm">Rabat, Maroc</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-700 pt-8 text-center">
            <p className="text-gray-400">
              © 2025 Fondation Academia. {currentLocale === 'fr' ? 'Tous droits réservés.' : 'All rights reserved.'}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default HomePage;