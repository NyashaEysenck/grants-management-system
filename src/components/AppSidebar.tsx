
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { 
  LayoutDashboard, 
  FileText, 
  Folder, 
  Users, 
  Settings, 
  Megaphone,
  PlusCircle
} from 'lucide-react';

const menuItems = {
  researcher: [
    { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard },
    { title: 'Applications', url: '/applications', icon: FileText },
    { title: 'Projects', url: '/projects', icon: Folder },
    { title: 'Documents', url: '/documents', icon: FileText },
  ],
  'grants manager': [
    { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard },
    { title: 'Call Management', url: '/call-management', icon: Megaphone },
    { title: 'Applications', url: '/applications', icon: FileText },
    { title: 'Projects', url: '/projects', icon: Folder },
    { title: 'Documents', url: '/documents', icon: FileText },
  ],
  admin: [
    { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard },
    { title: 'User Management', url: '/user-management', icon: Users },
    { title: 'System Config', url: '/system-config', icon: Settings },
    { title: 'Documents', url: '/documents', icon: FileText },
  ],
};

export function AppSidebar() {
  const { user } = useAuth();
  const location = useLocation();
  
  if (!user) return null;
  
  const userRole = user.role.toLowerCase() as keyof typeof menuItems;
  const items = menuItems[userRole] || [];
  
  const isActive = (path: string) => location.pathname === path;
  
  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-sm font-semibold text-gray-900 mb-2">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)}>
                    <NavLink 
                      to={item.url}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                          isActive 
                            ? 'bg-blue-100 text-blue-700 font-medium' 
                            : 'text-gray-700 hover:bg-gray-100'
                        }`
                      }
                    >
                      <item.icon className="h-5 w-5" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
