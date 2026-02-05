'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  LogOut,
  Plus,
  Zap,
  HelpCircle,
  Settings,
  ChevronRight,
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const mainNavItems = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'New Order',
    href: '/order',
    icon: ShoppingCart,
  },
];

export function AppSidebar({ user, onLogout }) {
  const pathname = usePathname();

  return (
    <Sidebar className="border-r border-[hsl(222,47%,12%)] bg-[hsl(222,47%,7%)]">
      <SidebarHeader className="p-4 border-b border-[hsl(222,47%,12%)]">
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:shadow-blue-500/30 transition-all">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-[15px] font-semibold text-white tracking-tight">DeliverOn</span>
            <span className="text-[11px] text-[hsl(215,20%,50%)]">Email Infrastructure</span>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent className="p-2">
        {/* Quick Action */}
        <div className="p-2">
          <Link href="/order">
            <Button className="w-full justify-start gap-2 bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/20 h-10 text-sm font-medium">
              <Plus className="w-4 h-4" />
              New Order
            </Button>
          </Link>
        </div>

        <SidebarSeparator className="my-2 bg-[hsl(222,47%,12%)]" />

        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-[11px] font-semibold uppercase tracking-wider text-[hsl(215,20%,45%)] px-3 mb-1">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      className={cn(
                        'h-10 px-3 rounded-lg transition-all duration-150',
                        isActive
                          ? 'bg-blue-600/15 text-blue-400 font-medium'
                          : 'text-[hsl(215,20%,60%)] hover:text-white hover:bg-[hsl(222,47%,11%)]'
                      )}
                    >
                      <Link href={item.href} className="flex items-center gap-3">
                        <item.icon className={cn('w-[18px] h-[18px]', isActive && 'text-blue-500')} />
                        <span>{item.title}</span>
                        {isActive && (
                          <ChevronRight className="w-4 h-4 ml-auto text-blue-500/50" />
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-2 border-t border-[hsl(222,47%,12%)]">
        {/* Help Link */}
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              className="h-9 px-3 rounded-lg text-[hsl(215,20%,55%)] hover:text-white hover:bg-[hsl(222,47%,11%)]"
            >
              <HelpCircle className="w-[18px] h-[18px]" />
              <span>Help & Support</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        <SidebarSeparator className="my-2 bg-[hsl(222,47%,12%)]" />

        {/* User Section */}
        {user && (
          <div className="p-2">
            <div className="flex items-center gap-3 p-2 rounded-lg bg-[hsl(222,47%,9%)] border border-[hsl(222,47%,14%)]">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-semibold">
                {user.email?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {user.email?.split('@')[0] || 'User'}
                </p>
                <p className="text-[11px] text-[hsl(215,20%,50%)] truncate">
                  {user.email}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onLogout}
                className="h-8 w-8 p-0 text-[hsl(215,20%,50%)] hover:text-white hover:bg-[hsl(222,47%,14%)]"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
