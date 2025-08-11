
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
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from '@/components/ui/sidebar';
import { 
  LayoutDashboard, 
  FileText, 
  Folder, 
  Users, 
  Settings, 
  Megaphone,
  University,
  LogOut,
  User,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';

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
  const { user, logout } = useAuth();
  const location = useLocation();
  const sidebarContext = useSidebar();
  const collapsed = sidebarContext?.state === 'collapsed';
  
  if (!user) return null;
  
  const userRole = user.role.toLowerCase() as keyof typeof menuItems;
  const items = menuItems[userRole] || [];
  
  const isActive = (path: string) => location.pathname === path;
  
  const handleLogout = () => {
    logout();
  };
  
  return (
    <Sidebar className="border-r border-sidebar-border bg-sidebar">
      <SidebarHeader className="p-6 border-b border-sidebar-border/50">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-sidebar-primary rounded-xl flex items-center justify-center shadow-md">
            <University className="w-5 h-5 text-sidebar-primary-foreground" />
          </div>
          {!collapsed && (
            <div>
              <h2 className="text-lg font-bold text-sidebar-foreground font-playfair">
                Grant Portal
              </h2>
              <p className="text-xs text-sidebar-foreground/70">
                Research Management
              </p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="p-4">
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold text-sidebar-foreground/60 uppercase tracking-wider mb-3 px-2">
            {collapsed ? '•••' : 'Navigation'}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url}
                      className={({ isActive }) =>
                        `group flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 relative ${
                          isActive 
                            ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-md' 
                            : 'text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:shadow-sm'
                        }`
                      }
                    >
                      <item.icon className={`h-5 w-5 flex-shrink-0 ${
                        isActive(item.url) ? 'text-sidebar-primary-foreground' : 'text-sidebar-foreground/70'
                      }`} />
                      {!collapsed && (
                        <>
                          <span className="font-medium">{item.title}</span>
                          {isActive(item.url) && (
                            <ChevronRight className="h-4 w-4 ml-auto text-sidebar-primary-foreground/70" />
                          )}
                        </>
                      )}
                      {isActive(item.url) && (
                        <div className="absolute left-0 top-0 w-1 h-full bg-sidebar-primary-foreground/30 rounded-r"></div>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-sidebar-border/50 mt-auto">
        <div className="space-y-3">
          {/* User Info */}
          <div className="flex items-center space-x-3 p-3 rounded-lg bg-sidebar-accent/30">
            <div className="w-8 h-8 bg-sidebar-primary/20 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-sidebar-foreground/70" />
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-sidebar-foreground truncate">
                  {user.name}
                </p>
                <p className="text-xs text-sidebar-foreground/60 truncate">
                  {user.role}
                </p>
              </div>
            )}
          </div>
          
          {/* Logout Button */}
          <Button
            onClick={handleLogout}
            variant="ghost"
            size={collapsed ? "icon" : "sm"}
            className="w-full justify-start text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            {!collapsed && <span className="ml-2">Sign Out</span>}
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
