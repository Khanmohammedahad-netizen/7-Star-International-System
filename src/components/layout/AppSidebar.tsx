import { useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Calendar, 
  FileText, 
  Receipt, 
  CreditCard, 
  Users, 
  Building2, 
  UserCog,
  LogOut,
  Star
} from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import { useAuth } from '@/contexts/AuthContext';
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
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  const location = useLocation();
  const { profile, userRole, signOut, hasPermission, isSuperAdmin } = useAuth();

  const mainNavItems = [
    { 
      title: 'Dashboard', 
      url: '/', 
      icon: LayoutDashboard,
      visible: hasPermission('canViewDashboard'),
    },
    { 
      title: 'Events Calendar', 
      url: '/events', 
      icon: Calendar,
      visible: hasPermission('canViewEvents'),
    },
    { 
      title: 'Accounts', 
      url: '/accounts', 
      icon: FileText,
      visible: hasPermission('canViewAccounts'),
    },
    { 
      title: 'Quotations', 
      url: '/quotations', 
      icon: FileText,
      visible: hasPermission('canViewQuotations'),
    },
    { 
      title: 'Invoices', 
      url: '/invoices', 
      icon: Receipt,
      visible: hasPermission('canViewInvoices'),
    },
    { 
      title: 'Payments', 
      url: '/payments', 
      icon: CreditCard,
      visible: hasPermission('canViewPayments'),
    },
    { 
      title: 'Clients', 
      url: '/clients', 
      icon: Building2,
      visible: hasPermission('canViewClients'),
    },
    { 
      title: 'Employees', 
      url: '/employees', 
      icon: Users,
      visible: hasPermission('canViewEmployees'),
    },
    { 
      title: 'Users', 
      url: '/users', 
      icon: UserCog,
      visible: hasPermission('canViewUsers'),
    },
  ];

  const visibleItems = mainNavItems.filter(item => item.visible);

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Star className="h-5 w-5" />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="font-semibold text-sm">7 Star International</span>
              <span className="text-xs text-muted-foreground capitalize">
                {userRole?.role?.replace('_', ' ')} • {userRole?.region}
              </span>
            </div>
          )}
        </div>
      </SidebarHeader>
      
      <Separator />
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {visibleItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={isActive(item.url)}
                    tooltip={item.title}
                  >
                    <NavLink 
                      to={item.url} 
                      end={item.url === '/'}
                      className="flex items-center gap-3"
                      activeClassName="bg-sidebar-accent text-sidebar-accent-foreground"
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {isSuperAdmin && (
          <SidebarGroup>
            <SidebarGroupLabel>Private</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton 
                    asChild 
                    isActive={isActive('/personal-accounts')}
                    tooltip="Personal Accounts"
                  >
                    <NavLink 
                      to="/personal-accounts"
                      className="flex items-center gap-3"
                      activeClassName="bg-sidebar-accent text-sidebar-accent-foreground"
                    >
                      <FileText className="h-4 w-4" />
                      <span>Personal Accounts</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="p-4">
        <div className="flex items-center gap-3">
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{profile?.full_name}</p>
              <p className="text-xs text-muted-foreground truncate">{profile?.email}</p>
            </div>
          )}
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={signOut}
            className="shrink-0"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
