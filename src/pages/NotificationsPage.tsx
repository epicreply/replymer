import { Bell } from "lucide-react";

export default function NotificationsPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
        <Bell className="h-8 w-8 text-muted-foreground" />
      </div>
      <h2 className="text-xl font-semibold text-foreground mb-2">No notifications yet</h2>
      <p className="text-muted-foreground max-w-sm">
        When you receive notifications about your leads and activity, they'll appear here.
      </p>
    </div>
  );
}
