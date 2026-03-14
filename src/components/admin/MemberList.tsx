import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MemberAvatar } from "./MemberAvatar";
import { InviteMemberDialog } from "./InviteMemberDialog";

interface Member {
  id: string;
  name: string;
  email?: string;
  role: string;
  status?: "invited" | "accepted";
  isCurrentUser?: boolean;
}

interface Project {
  id: string;
  name: string;
  is_selected?: boolean;
}

interface MemberListProps {
  members: Member[];
  currentUserRole: string;
  projects: Project[];
  accessToken: string;
  onInviteSuccess?: () => void;
}

const TEAM_MEMBER_LIMIT = 10;

export function MemberList({
  members,
  currentUserRole,
  projects,
  accessToken,
  onInviteSuccess,
}: MemberListProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const memberTitle = `${members.length} ${members.length === 1 ? "Member" : "Members"}`;
  const canInviteByRole = ["owner", "admin"].includes(currentUserRole.toLowerCase());
  const hasInviteCapacity = members.length < TEAM_MEMBER_LIMIT;
  const canInvite = canInviteByRole && hasInviteCapacity;

  useEffect(() => {
    if (!hasInviteCapacity && isDialogOpen) {
      setIsDialogOpen(false);
    }
  }, [hasInviteCapacity, isDialogOpen]);

  return (
    <div className="animate-fade-in" style={{ animationDelay: "0.1s" }}>
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-medium text-foreground">{memberTitle}</h2>
        {canInvite && (
          <Button
            onClick={() => setIsDialogOpen(true)}
            className="gap-2 rounded-full px-5"
          >
            <Plus className="h-4 w-4" />
            Invite members
          </Button>
        )}
      </div>

      <InviteMemberDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        currentUserRole={currentUserRole}
        projects={projects}
        accessToken={accessToken}
        onSuccess={onInviteSuccess}
      />

      {/* Members Card */}
      <div className="admin-card">
        {/* Member Items */}
        {members.map((member) => (
          <div
            key={member.id}
            className="admin-card-section flex items-center gap-3"
          >
            <MemberAvatar name={member.name} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-foreground truncate">
                  {member.name}
                </span>
                {member.isCurrentUser && (
                  <span className="text-sm text-muted-foreground">(you)</span>
                )}
                {member.status === "invited" && (
                  <Badge variant="secondary" className="text-xs">
                    Invited
                  </Badge>
                )}
              </div>
              {member.email && (
                <p className="text-sm text-muted-foreground truncate">{member.email}</p>
              )}
            </div>
            <span className="text-sm text-muted-foreground">{member.role}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
