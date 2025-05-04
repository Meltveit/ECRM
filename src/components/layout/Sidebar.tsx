import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { 
  LayoutDashboard, 
  Users, 
  UserCircle, 
  Settings, 
  CreditCard,
  Activity
} from 'lucide-react';

interface SidebarLink {
  href: string;
  label: string;
  icon: React.ReactNode;
  adminOnly?: boolean;
}

export default function Sidebar() {
  const pathname = usePathname();
  const { currentUser } = useAuth();
  const isAdmin = currentUser?.role === 'admin';

  const links: SidebarLink[] = [
    {
      href: '/dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard size={18} />,
    },
    {
      href: '/clients',
      label: 'Clients',
      icon: <Users size={18} />,
    },
    {
      href: '/contacts',
      label: 'Contacts',
      icon: <UserCircle size={18} />,
    },
    {
      href: '/activities',
      label: 'Activities',
      icon: <Activity size={18} />,
    },
    {
      href: '/team',
      label: 'Team',
      icon: <Users size={18} />,
      adminOnly: true,
    },
    {
      href: '/subscription',
      label: 'Subscription',
      icon: <CreditCard size={18} />,
      adminOnly: true,
    },
    {
      href: '/settings',
      label: 'Settings',
      icon: <Settings size={18} />,
    },
  ];

  // Filter out admin-only links if user is not admin
  const filteredLinks = links.filter(link => !link.adminOnly || isAdmin);

  return (
    <aside className="bg-gray-100 w-64 min-h-screen p-4">
      <nav className="space-y-1">
        {filteredLinks.map((link) => {
          const isActive = pathname === link.href || pathname?.startsWith(`${link.href}/`);
          
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`sidebar-link ${
                isActive ? 'sidebar-link-active' : 'sidebar-link-inactive'
              }`}
            >
              {link.icon}
              <span className="ml-3">{link.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}