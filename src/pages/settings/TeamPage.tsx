import { useState, useEffect } from "react";
import { TeamCard } from "@/components/admin/TeamCard";
import { MemberList } from "@/components/admin/MemberList";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";

interface TeamMember {
  id: string;
  role: string;
  user_id: string;
  status: "invited" | "accepted";
  name: string;
  first_name: string | null;
  last_name: string | null;
  joined_at: string;
}

export default function TeamPage() {
  const [teamName, setTeamName] = useState("My Team");
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { accessToken, user } = useAuth();

  useEffect(() => {
    const fetchTeamMembers = async () => {
      if (!accessToken) return;

      try {
        const response = await fetch("https://internal-api.autoreply.ing/v1.0/team_members", {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch team members");
        }

        const data = await response.json();
        setMembers(data.items || []);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load team members",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchTeamMembers();
  }, [accessToken]);
  // Determine current user's role from team members
  const currentUserMember = members.find((m) => m.user_id === user?.id);
  const currentUserRole = currentUserMember?.role || "member";

  // Get projects from user object
  const projects = user?.projects || [];

  // Transform API data to component format
  const formattedMembers = members.map((member) => ({
    id: member.id,
    name: member.name || "Unknown",
    email: "", // API doesn't return email, we'll hide it
    role: member.role.charAt(0).toUpperCase() + member.role.slice(1),
    status: member.status,
    isCurrentUser: member.user_id === user?.id,
  }));

  const handleInviteSuccess = () => {
    // Refetch team members after successful invite
    const fetchTeamMembers = async () => {
      if (!accessToken) return;

      try {
        const response = await fetch("https://internal-api.autoreply.ing/v1.0/team_members", {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch team members");
        }

        const data = await response.json();
        setMembers(data.items || []);
      } catch (error) {
        console.error("Failed to refresh team members:", error);
      }
    };

    fetchTeamMembers();
  };

  return (
    <div className="mx-auto max-w-2xl">
      <div className="space-y-6">
        <div className="hidden md:block">
          <h1 className="text-xl font-semibold text-foreground">Team</h1>
        </div>
        
        {isLoading ? (
          <TeamPageSkeleton />
        ) : (
          <>
            {/* <TeamCard
              teamName={teamName}
              memberCount={members.length}
              onNameChange={setTeamName}
            /> */}
      
            <MemberList
              members={formattedMembers}
              currentUserRole={currentUserRole}
              projects={projects}
              accessToken={accessToken || ""}
              onInviteSuccess={handleInviteSuccess}
            />
          </>
        )}
      </div>
    </div>
  );
}

function TeamPageSkeleton() {
  return (
    <div className="space-y-6">
      {/* Team Card Skeleton */}
      {/* <div className="admin-card">
        <div className="admin-card-section space-y-3">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="admin-card-section">
          <Skeleton className="h-4 w-32" />
        </div>
      </div> */}

      {/* Members List Skeleton */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-10 w-32 rounded-full" />
        </div>
        <div className="admin-card">
          <div className="admin-card-section">
            <Skeleton className="h-4 w-20" />
          </div>
          {[1, 2, 3].map((i) => (
            <div key={i} className="admin-card-section flex items-center gap-3">
              <Skeleton className="h-9 w-9 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton className="h-4 w-16" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
