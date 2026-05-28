// components/NotificationMenu.tsx

import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Bell, Loader2, User, MessageSquare, EyeOff } from "lucide-react";

// 1. Data Type Definition
interface Notification {
  id: number;
  icon: React.ReactNode;
  message: string;
  unread: boolean;
  link: string; // Placeholdser for routing
}

// 2. Mock Data (Replace this with your actual API fetch)
const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: 1,
    icon: <User className="h-4 w-4 text-blue-500" />,
    message: "Jane Doe updated their profile.",
    unread: true,
    link: "/profile/jane",
  },
  {
    id: 2,
    icon: <MessageSquare className="h-4 w-4 text-yellow-500" />,
    message: "John Smith commented on your post.",
    unread: true,
    link: "/posts/john-comment",
  },
  {
    id: 3,
    icon: <Loader2 className="h-4 w-4 text-green-500" />,
    message: "Your subscription is renewing next month.",
    unread: false,
    link: "/settings/billing",
  },
  {
    id: 4,
    icon: <EyeOff className="h-4 w-4 text-red-500" />,
    message: "The system maintenance window will start at 2 AM.",
    unread: false,
    link: "/system-info",
  },
];

// --- Component Logic ---

/**
 * Individual Notification Item Display Component
 */
const NotificationItem: React.FC<{ notification: Notification }> = ({ notification }) => {
  return (
    <div
      className="flex cursor-pointer items-start p-2 transition-colors hover:bg-accent/50"
      onClick={() => {
        console.log(`Navigating to: ${notification.link}`);
        // In a real app, you would use router.push(notification.link) here
      }}
    >
      {/* Icon Area */}
      <div className="mr-3 mt-1 flex-shrink-0">{notification.icon}</div>

      {/* Content Area */}
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium leading-none">{notification.message}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {/* Show timestamp or date here */}• Just now
        </p>
      </div>
      {/* Status Indicator (optional) */}
      {!notification.unread && (
        <div className="ml-2 flex-shrink-0">
          <div className="h-2 w-2 rounded-full bg-gray-200 opacity-50"></div>
        </div>
      )}
    </div>
  );
};

/**
 * Main Notification Dropdown Menu Component
 */
const NotificationMenu: React.FC = () => {
  // Calculate unread count
  const unreadCount = MOCK_NOTIFICATIONS.filter((n) => n.unread).length;

  return (
    <DropdownMenu>
      {/* 1. Trigger (The Bell Icon) */}
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" aria-label="Open notifications" className="relative p-2">
          <Bell className="h-5 w-5 text-foreground" />
          {/* Notification Badge */}
          {unreadCount > 0 && (
            <span className="absolute right-0 top-0 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-xs text-white">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>

      {/* 2. Menu Content */}
      <DropdownMenuContent className="w-max min-w-[300px] p-0 pt-2 shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between border-b bg-background p-3">
          <h3 className="text-lg font-semibold tracking-tight">Notifications</h3>
          <Button variant="ghost" className="text-sm hover:bg-red-50 hover:text-red-600">
            Mark All Read
          </Button>
        </div>

        {/* Notification List Body */}
        <div className="max-h-72 divide-y overflow-y-auto">
          {MOCK_NOTIFICATIONS.length > 0 ? (
            MOCK_NOTIFICATIONS.map((notification) => (
              <React.Fragment key={notification.id}>
                <NotificationItem notification={notification} />
                {/* Separator needed between items */}
                {notification.id < MOCK_NOTIFICATIONS.length && <Separator />}
              </React.Fragment>
            ))
          ) : (
            // Empty State
            <div className="p-6 text-center text-muted-foreground">
              <h4 className="mb-2 text-xl font-medium">You&apos;re all caught up!</h4>
              <p>No new notifications. Check back later!</p>
            </div>
          )}
        </div>

        {/* Footer/Action */}
        <div className="flex justify-center border-t p-2">
          <Button variant="ghost" className="w-full text-sm">
            View All Notifications →
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationMenu;
