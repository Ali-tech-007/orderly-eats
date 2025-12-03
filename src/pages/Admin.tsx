import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useStaffManagement } from "@/hooks/useStaffManagement";
import { usePOSSettings } from "@/hooks/usePOSSettings";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  Users,
  Settings,
  ShieldCheck,
  RefreshCw,
  Save,
} from "lucide-react";

export default function Admin() {
  const navigate = useNavigate();
  const { user, role, isLoading: authLoading } = useAuth();
  const { staff, isLoading: staffLoading, updateStaffRole, updateStaffStatus } = useStaffManagement();
  const { taxRates, updateTaxRate } = usePOSSettings();
  const { toast } = useToast();

  const [cashTax, setCashTax] = useState("");
  const [cardTax, setCardTax] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
      return;
    }

    if (!authLoading && role !== "admin") {
      toast({
        title: "Access Denied",
        description: "Only administrators can access this page.",
        variant: "destructive",
      });
      navigate("/");
    }
  }, [user, role, authLoading, navigate]);

  useEffect(() => {
    setCashTax((taxRates.cash * 100).toString());
    setCardTax((taxRates.card * 100).toString());
  }, [taxRates]);

  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      await updateTaxRate("cash", parseFloat(cashTax) / 100);
      await updateTaxRate("card", parseFloat(cardTax) / 100);
      toast({
        title: "Settings Saved",
        description: "Tax rates have been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save settings.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      case "manager":
        return "bg-purple-500/20 text-purple-400 border-purple-500/30";
      case "server":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "kitchen":
        return "bg-amber-500/20 text-amber-400 border-amber-500/30";
      default:
        return "";
    }
  };

  if (authLoading || staffLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <RefreshCw className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (role !== "admin") {
    return null;
  }

  return (
    <>
      <Helmet>
        <title>Admin Dashboard | Restaurant POS</title>
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="bg-card border-b border-border px-6 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-primary" />
              <h1 className="text-xl font-bold">Admin Dashboard</h1>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="container mx-auto p-6">
          <Tabs defaultValue="staff" className="space-y-6">
            <TabsList>
              <TabsTrigger value="staff" className="gap-2">
                <Users className="w-4 h-4" />
                Staff Management
              </TabsTrigger>
              <TabsTrigger value="settings" className="gap-2">
                <Settings className="w-4 h-4" />
                System Settings
              </TabsTrigger>
            </TabsList>

            {/* Staff Management Tab */}
            <TabsContent value="staff">
              <Card>
                <CardHeader>
                  <CardTitle>Staff Members</CardTitle>
                  <CardDescription>
                    Manage staff roles and access permissions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {staff.map((member) => (
                        <TableRow key={member.id}>
                          <TableCell className="font-medium">
                            {member.fullName}
                          </TableCell>
                          <TableCell>
                            <Select
                              value={member.role}
                              onValueChange={(value) =>
                                updateStaffRole(member.userId, value as typeof member.role)
                              }
                              disabled={member.userId === user?.id}
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="admin">Admin</SelectItem>
                                <SelectItem value="manager">Manager</SelectItem>
                                <SelectItem value="server">Server</SelectItem>
                                <SelectItem value="kitchen">Kitchen</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={
                                member.isActive
                                  ? "bg-success/20 text-success border-success/30"
                                  : "bg-destructive/20 text-destructive border-destructive/30"
                              }
                            >
                              {member.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Switch
                                checked={member.isActive}
                                onCheckedChange={(checked) =>
                                  updateStaffStatus(member.userId, checked)
                                }
                                disabled={member.userId === user?.id}
                              />
                              <span className="text-sm text-muted-foreground">
                                {member.isActive ? "Deactivate" : "Activate"}
                              </span>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                      {staff.length === 0 && (
                        <TableRow>
                          <TableCell
                            colSpan={4}
                            className="text-center text-muted-foreground py-8"
                          >
                            No staff members found
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings">
              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Tax Settings</CardTitle>
                    <CardDescription>
                      Configure tax rates for different payment methods
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="cashTax">Cash Payment Tax (%)</Label>
                      <Input
                        id="cashTax"
                        type="number"
                        value={cashTax}
                        onChange={(e) => setCashTax(e.target.value)}
                        min="0"
                        max="100"
                        step="0.1"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cardTax">Card Payment Tax (%)</Label>
                      <Input
                        id="cardTax"
                        type="number"
                        value={cardTax}
                        onChange={(e) => setCardTax(e.target.value)}
                        min="0"
                        max="100"
                        step="0.1"
                      />
                    </div>
                    <Button
                      onClick={handleSaveSettings}
                      disabled={isSaving}
                      className="w-full"
                    >
                      {isSaving ? (
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Save className="w-4 h-4 mr-2" />
                      )}
                      Save Settings
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Role Permissions</CardTitle>
                    <CardDescription>
                      Overview of role-based access control
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className={getRoleBadgeColor("admin")}>
                            Admin
                          </Badge>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          Full system access
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className={getRoleBadgeColor("manager")}>
                            Manager
                          </Badge>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          Tax settings, view staff
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className={getRoleBadgeColor("server")}>
                            Server
                          </Badge>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          Orders, payments, tables
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className={getRoleBadgeColor("kitchen")}>
                            Kitchen
                          </Badge>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          View and manage orders
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
}
