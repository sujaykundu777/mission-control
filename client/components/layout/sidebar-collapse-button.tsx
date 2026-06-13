import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useSidebarContext } from "./sidebar-context";

export function SidebarCollapseButton() {
  const { isCollapsed, toggleSidebar } = useSidebarContext();

  return (
    <Button variant="ghost" size="icon" onClick={toggleSidebar} className="h-8 w-8">
      {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
    </Button>
  );
}
