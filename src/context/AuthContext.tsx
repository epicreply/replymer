import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface Project {
  id: string;
  name: string;
  is_selected: boolean;
}

interface User {
  id: string;
  email: string;
  name: string;
  first_name?: string | null;
  last_name?: string | null;
  theme?: string;
  default_project_id?: string;
  team_member_status: string;
  projects?: Project[];
}

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  accessToken: string | null;
  login: (accessToken: string, user: User) => void;
  logout: () => void;
  selectProject: (projectId: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  useEffect(() => {
    // Check if user is authenticated on mount
    let isMounted = true;
    const hydrateAuth = async () => {
      const storedToken = localStorage.getItem("accessToken");
      const storedUser = localStorage.getItem("user");

      if (!storedToken || !storedUser) {
        if (isMounted) {
          setIsLoading(false);
        }
        return;
      }

      try {
        const parsedUser = JSON.parse(storedUser);
        setAccessToken(storedToken);
        setUser(parsedUser);
        setIsAuthenticated(true);

        const response = await fetch("https://internal-api.autoreply.ing/v1.0/users/me", {
          headers: {
            Authorization: `Bearer ${storedToken}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to refresh user data");
        }

        const userData = await response.json();
        const mergedUser = {
          ...parsedUser,
          ...userData,
          projects: userData.projects ?? parsedUser.projects,
          default_project_id: userData.default_project_id ?? parsedUser.default_project_id,
          first_name: userData.first_name ?? parsedUser.first_name,
          last_name: userData.last_name ?? parsedUser.last_name,
          theme: userData.theme ?? parsedUser.theme,
        };

        localStorage.setItem("user", JSON.stringify(mergedUser));
        if (isMounted) {
          setUser(mergedUser);
        }
      } catch {
        // Invalid stored data or token, clear it
        localStorage.removeItem("accessToken");
        localStorage.removeItem("user");
        if (isMounted) {
          setAccessToken(null);
          setUser(null);
          setIsAuthenticated(false);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    hydrateAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  const login = (token: string, userData: User) => {
    localStorage.setItem("accessToken", token);
    localStorage.setItem("user", JSON.stringify(userData));
    setAccessToken(token);
    setUser(userData);
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    setAccessToken(null);
    setUser(null);
    setIsAuthenticated(false);
  };

  const selectProject = async (projectId: string) => {
    if (!accessToken || !user) {
      throw new Error("Missing access token or user");
    }

    const previousUser = user;
    const updatedProjects = user.projects?.map((project) => ({
      ...project,
      is_selected: project.id === projectId,
    }));
    const updatedUser = {
      ...user,
      projects: updatedProjects,
      default_project_id: projectId,
    };

    setUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));

    try {
      const response = await fetch(
        "https://internal-api.autoreply.ing/v1.0/users/me/selected-project",
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ selected_project: projectId }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update selected project");
      }
    } catch (error) {
      setUser(previousUser);
      localStorage.setItem("user", JSON.stringify(previousUser));
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        user,
        accessToken,
        login,
        logout,
        selectProject,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export type { Project, User };
