import { ReactNode } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { AgeGroupSelector } from "@/components/AgeGroupSelector";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";

interface AppLayoutProps {
  children: ReactNode;
  pageTitle?: string;
  pageSubtitle?: string;
}

export function AppLayout({ children, pageTitle, pageSubtitle }: AppLayoutProps) {
  return (
    <SidebarProvider>
      <div className="min-h-screen w-full flex bg-gradient-to-br from-background via-background to-secondary/5">
        <AppSidebar />
        
        <main className="flex-1 flex flex-col">
          {/* Top Header */}
          <header className="h-16 border-b bg-card/50 backdrop-blur-sm flex items-center px-4">
            <div className="flex items-center gap-4 flex-1">
              <SidebarTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Menu className="h-4 w-4" />
                </Button>
              </SidebarTrigger>
              
              {(pageTitle || pageSubtitle) && (
                <div className="flex flex-col">
                  {pageTitle && (
                    <h1 className="text-xl font-display font-bold text-foreground">
                      {pageTitle}
                    </h1>
                  )}
                  {pageSubtitle && (
                    <p className="text-sm text-muted-foreground">
                      {pageSubtitle}
                    </p>
                  )}
                </div>
              )}
            </div>
            
            <AgeGroupSelector />
          </header>

          {/* Main Content */}
          <div className="flex-1 p-6">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}