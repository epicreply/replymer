import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MemberAvatar } from "@/components/admin/MemberAvatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuth } from "@/context/AuthContext";

interface UserProfile {
  email: string;
  first_name: string | null;
  last_name: string | null;
  theme: string;
  default_project_id: string;
}

function ProfilePageSkeleton() {
  return (
    <div className="mx-auto max-w-2xl">
      <div className="space-y-6">
        <Skeleton className="h-7 w-24" />
        
        <div className="admin-card animate-fade-in">
          {/* Avatar Section Skeleton */}
          <div className="admin-card-section flex items-center gap-4">
            <Skeleton className="h-16 w-16 rounded-full" />
            <Skeleton className="h-5 w-32" />
          </div>
  
          {/* Name Field Skeleton */}
          <div className="admin-card-section flex items-center justify-between gap-4">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-10 w-[250px] rounded-lg" />
          </div>
  
          {/* Email Field Skeleton */}
          <div className="admin-card-section flex items-center justify-between gap-4">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-10 w-[250px] rounded-lg" />
          </div>
  
          {/* Appearance Skeleton */}
          <div className="admin-card-section flex items-center justify-between gap-4">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-48 rounded-full" />
          </div>
        </div>
  
        {/* Delete Account Section Skeleton */}
        <div className="admin-card animate-fade-in">
          <div className="admin-card-section flex items-center justify-between gap-4">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-10 w-32 rounded-md" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const { accessToken } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const { theme, setTheme } = useTheme();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [confirmEmail, setConfirmEmail] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      if (!accessToken) return;
      
      try {
        const response = await fetch("https://internal-api.autoreply.ing/v1.0/users/me", {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch profile");
        }

        const data = await response.json();
        setProfile(data);
        setFirstName(data.first_name || "");
        setLastName(data.last_name || "");
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [accessToken]);

  const displayName = profile 
    ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || profile.email
    : "";

  const handleDeleteAccount = () => {
    if (profile && confirmEmail === profile.email) {
      // Handle delete account logic
      console.log("Account deleted");
      setDeleteDialogOpen(false);
    }
  };

  if (isLoading) {
    return <ProfilePageSkeleton />;
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="space-y-6">
        <h1 className="text-xl font-semibold text-foreground">Profile</h1>
  
        <div className="admin-card animate-fade-in">
          {/* Avatar Section */}
          <div className="admin-card-section flex items-center gap-4">
            <MemberAvatar name={displayName} className="h-16 w-16 text-xl" />
            <div>
              <p className="text-base font-medium text-foreground">{displayName}</p>
            </div>
          </div>
  
          {/* First Name Field */}
          <div className="admin-card-section flex items-center justify-between gap-4">
            <span className="text-sm font-medium text-foreground">First Name</span>
            <Input
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="max-w-[250px] rounded-lg border-border bg-card text-right text-sm"
            />
          </div>

          {/* Last Name Field */}
          <div className="admin-card-section flex items-center justify-between gap-4">
            <span className="text-sm font-medium text-foreground">Last Name</span>
            <Input
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="max-w-[250px] rounded-lg border-border bg-card text-right text-sm"
            />
          </div>
  
          {/* Email Field */}
          <div className="admin-card-section flex items-center justify-between gap-4">
            <span className="text-sm font-medium text-foreground">Email</span>
            <div className="flex h-10 w-full max-w-[250px] items-center justify-end rounded-lg bg-card px-3 text-sm text-foreground">
              {profile?.email}
            </div>
          </div>
  
          {/* Appearance */}
          <div className="admin-card-section flex items-center justify-between gap-4">
            <span className="text-sm font-medium text-foreground">Appearance</span>
            <div className="flex rounded-full bg-muted p-1">
              {(["light", "dark", "system"] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setTheme(mode)}
                  className={`px-4 py-1.5 text-sm font-medium rounded-full transition-all capitalize ${
                    theme === mode
                      ? "bg-card text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>
        </div>
  
        {/* Delete Account Section */}
        <div className="admin-card animate-fade-in">
          <div className="admin-card-section flex items-center justify-between gap-4">
            <span className="text-sm font-medium text-foreground">Delete account</span>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(true)}
              className="text-destructive border-border hover:bg-destructive/10 hover:text-destructive"
            >
              Delete account
            </Button>
          </div>
        </div>
  
        {/* Delete Account Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent className="sm:max-w-md rounded-2xl">
            <DialogHeader>
              <DialogTitle>Delete your account?</DialogTitle>
              <DialogDescription className="text-muted-foreground">
                All the videos and projects made by this account will also be deleted. 
                This cannot be undone, and you will no longer be able to create an account with this email.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-2">
              <p className="text-sm text-foreground">Type the email below to delete your account.</p>
              <Input
                placeholder={profile?.email}
                value={confirmEmail}
                onChange={(e) => setConfirmEmail(e.target.value)}
                className="rounded-xl"
              />
            </div>
            <DialogFooter className="gap-2 sm:gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setDeleteDialogOpen(false);
                  setConfirmEmail("");
                }}
                className="rounded-full"
              >
                Cancel
              </Button>
              <Button
                variant="outline"
                disabled={!profile || confirmEmail !== profile.email}
                onClick={handleDeleteAccount}
                className="rounded-full text-destructive hover:text-destructive disabled:opacity-50"
              >
                Delete account
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
