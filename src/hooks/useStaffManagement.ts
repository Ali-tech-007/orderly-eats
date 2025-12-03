import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface StaffMember {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  role: "admin" | "manager" | "server" | "kitchen";
  isActive: boolean;
  hiredAt: string | null;
  notes: string | null;
}

export function useStaffManagement() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchStaff = useCallback(async () => {
    try {
      // Get profiles with their roles
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("user_id, full_name");

      if (profilesError) throw profilesError;

      const { data: roles, error: rolesError } = await supabase
        .from("user_roles")
        .select("user_id, role");

      if (rolesError) throw rolesError;

      const { data: management, error: managementError } = await supabase
        .from("staff_management")
        .select("*");

      // Staff management may not exist for all users
      const managementMap = new Map(
        (management || []).map((m) => [m.user_id, m])
      );

      const rolesMap = new Map(roles.map((r) => [r.user_id, r.role]));

      const staffList: StaffMember[] = profiles.map((profile) => {
        const mgmt = managementMap.get(profile.user_id);
        return {
          id: profile.user_id,
          userId: profile.user_id,
          fullName: profile.full_name,
          email: "", // We don't have access to auth.users email directly
          role: (rolesMap.get(profile.user_id) || "server") as StaffMember["role"],
          isActive: mgmt?.is_active ?? true,
          hiredAt: mgmt?.hired_at || null,
          notes: mgmt?.notes || null,
        };
      });

      setStaff(staffList);
    } catch (error) {
      console.error("Error fetching staff:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStaff();
  }, [fetchStaff]);

  const updateStaffRole = async (userId: string, newRole: StaffMember["role"]) => {
    try {
      const { error } = await supabase
        .from("user_roles")
        .update({ role: newRole })
        .eq("user_id", userId);

      if (error) throw error;

      toast({
        title: "Role Updated",
        description: "Staff role has been updated successfully.",
      });

      fetchStaff();
    } catch (error) {
      console.error("Error updating role:", error);
      toast({
        title: "Error",
        description: "Failed to update staff role.",
        variant: "destructive",
      });
    }
  };

  const updateStaffStatus = async (userId: string, isActive: boolean) => {
    try {
      // Check if staff_management entry exists
      const { data: existing } = await supabase
        .from("staff_management")
        .select("id")
        .eq("user_id", userId)
        .single();

      if (existing) {
        const { error } = await supabase
          .from("staff_management")
          .update({ is_active: isActive })
          .eq("user_id", userId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("staff_management").insert({
          user_id: userId,
          is_active: isActive,
        });
        if (error) throw error;
      }

      toast({
        title: isActive ? "Staff Activated" : "Staff Deactivated",
        description: `Staff member has been ${isActive ? "activated" : "deactivated"}.`,
      });

      fetchStaff();
    } catch (error) {
      console.error("Error updating staff status:", error);
      toast({
        title: "Error",
        description: "Failed to update staff status.",
        variant: "destructive",
      });
    }
  };

  return {
    staff,
    isLoading,
    updateStaffRole,
    updateStaffStatus,
    refetch: fetchStaff,
  };
}
