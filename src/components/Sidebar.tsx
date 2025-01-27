import { Link, useLocation } from 'react-router-dom';
import { cn } from '../lib/utils';
import { Button } from './ui/button';
import { LayoutDashboard, FileText, Settings } from 'lucide-react';

export function Sidebar() {
  const location = useLocation();

  const navItems = [
    {
      label: 'Dashboard',
      icon: LayoutDashboard,
      href: '/',
    },
    {
      label: 'Estimates',
      icon: FileText,
      href: '/estimates',
    },
    {
      label: 'Settings',
      icon: Settings,
      href: '/settings',
    },
  ];

  return (
    <div className="pb-12 min-h-screen">
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <div className="space-y-1">
            {navItems.map((item) => (
              <Link key={item.href} to={item.href}>
                <Button
                  variant={location.pathname === item.href ? 'secondary' : 'ghost'}
                  className={cn(
                    'w-full justify-start',
                    location.pathname === item.href
                      ? 'bg-accent'
                      : 'hover:bg-accent hover:text-accent-foreground'
                  )}
                >
                  <item.icon className="mr-2 h-4 w-4" />
                  {item.label}
                </Button>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 