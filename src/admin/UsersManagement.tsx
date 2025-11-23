import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  MoreHorizontal,
  Shield,
  User,
  Mail,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Ban,
  Lock,
  Unlock,
  Eye,
  ChevronLeft,
  ChevronRight,
  Download,
  FileText,
  MessageSquare,
  CreditCard,
  Flag,
  MoreVertical,
  Trash2
} from 'lucide-react';
import { useAdminApi } from '@/hooks/useAdminApi';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";

interface UsersManagementProps {
  className?: string;
}

export const UsersManagement: React.FC<UsersManagementProps> = ({ className }) => {
  const { getUsers, getUserDetails, banUser, updateUserStatus, loading } = useAdminApi();
  
  // State for list view
  const [users, setUsers] = useState<any[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 1
  });
  const [filters, setFilters] = useState({
    search: '',
    status: 'all', // all | active | banned | suspended
    role: 'all'    // all | user | admin | moderator
  });

  // State for detailed view
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  // State for actions
  const [banDialogOpen, setBanDialogOpen] = useState(false);
  const [banReason, setBanReason] = useState('');
  const [banType, setBanType] = useState<'temporary' | 'permanent'>('permanent');
  const [banDuration, setBanDuration] = useState(24);
  const [banDurationUnit, setBanDurationUnit] = useState<'hours' | 'days' | 'months'>('hours');

  useEffect(() => {
    loadUsers();
  }, [pagination.page, filters.status, filters.role]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      loadUsers();
    }, 500);
    return () => clearTimeout(timer);
  }, [filters.search]);

  useEffect(() => {
    if (selectedUserId) {
      loadUserDetails(selectedUserId);
    } else {
      setSelectedUser(null);
    }
  }, [selectedUserId]);

  const loadUsers = async () => {
    try {
      const params: any = {
        page: pagination.page,
        limit: pagination.limit,
        search: filters.search,
      };
      
      if (filters.status !== 'all') {
        params.status = filters.status;
      }
      // Note: Backend currently filters by status. Role filtering might need backend update or client-side (if small dataset, but pagination suggests backend).
      // Assuming backend might ignore role for now or we add it later.

      const data = await getUsers(params);
      setUsers(data.users);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Failed to load users:', error);
      toast({
        title: "Error",
        description: "Failed to load users list",
        variant: "destructive"
      });
    }
  };

  const loadUserDetails = async (id: string) => {
    setDetailsLoading(true);
    try {
      const data = await getUserDetails(id);
      setSelectedUser(data);
    } catch (error) {
      console.error('Failed to load user details:', error);
      toast({
        title: "Error",
        description: "Failed to load user details",
        variant: "destructive"
      });
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleBanUser = async () => {
    if (!selectedUserId) return;
    
    try {
      await banUser(selectedUserId, {
        reason: banReason,
        banType,
        duration: banType === 'temporary' ? banDuration : undefined,
        durationUnit: banType === 'temporary' ? banDurationUnit : undefined,
      });
      
      toast({
        title: "Success",
        description: "User has been banned successfully",
      });
      
      setBanDialogOpen(false);
      loadUserDetails(selectedUserId); // Reload details to show new status
      loadUsers(); // Reload list to update status
    } catch (error) {
      console.error('Failed to ban user:', error);
      toast({
        title: "Error",
        description: "Failed to ban user",
        variant: "destructive"
      });
    }
  };

  const handleUnbanUser = async () => {
    if (!selectedUserId) return;

    try {
      await updateUserStatus(selectedUserId, 'active');
      toast({
        title: "Success",
        description: "User has been unbanned",
      });
      loadUserDetails(selectedUserId);
      loadUsers();
    } catch (error) {
      console.error('Failed to unban user:', error);
      toast({
        title: "Error",
        description: "Failed to unban user",
        variant: "destructive"
      });
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('ru-RU', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className={cn("grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6 h-[calc(100vh-100px)]", className)}>
      
      {/* Users List Column */}
      <div className="flex flex-col bg-[#1f1f1f] border border-[#2d2d2d] rounded-lg overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-[#2d2d2d] flex flex-col sm:flex-row gap-4 justify-between items-center bg-[#1a1a1a]">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-500" />
              <Input 
                placeholder="Search users..." 
                className="pl-10 bg-[#111111] border-[#2d2d2d] text-white h-9"
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              />
            </div>
          </div>
          
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Select 
              value={filters.status} 
              onValueChange={(val) => setFilters(prev => ({ ...prev, status: val }))}
            >
              <SelectTrigger className="w-[130px] bg-[#111111] border-[#2d2d2d] text-white h-9">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="bg-[#1a1a1a] border-[#2d2d2d] text-white">
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="banned">Banned</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex items-center bg-[#111111] border border-[#2d2d2d] rounded-md h-9 px-2 gap-1">
               <span className="text-xs text-neutral-500">Total: {pagination.total}</span>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-neutral-400 uppercase bg-[#262626] sticky top-0 z-10">
              <tr>
                <th className="px-4 py-3 font-medium">User</th>
                <th className="px-4 py-3 font-medium">Role</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium text-right">Joined</th>
                <th className="px-4 py-3 font-medium text-right">Last Login</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2d2d2d]">
              {loading && users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-neutral-500">
                    Loading users...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-neutral-500">
                    No users found matching your criteria.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr 
                    key={user.id}
                    className={cn(
                      "hover:bg-[#2d2d2d] transition-colors cursor-pointer",
                      selectedUserId === user.id && "bg-[#2d2d2d] border-l-2 border-blue-500"
                    )}
                    onClick={() => setSelectedUserId(user.id)}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-[#333] flex items-center justify-center text-neutral-400 font-medium text-xs overflow-hidden">
                           {user.avatar_url ? (
                             <img src={user.avatar_url} alt={user.full_name} className="h-full w-full object-cover" />
                           ) : (
                             (user.full_name || user.email || '?').charAt(0).toUpperCase()
                           )}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-white font-medium text-sm truncate max-w-[150px]">
                            {user.full_name || 'No Name'}
                          </span>
                          <span className="text-neutral-500 text-xs truncate max-w-[150px]">
                            {user.email}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="outline" className="bg-[#1a1a1a] border-[#404040] text-neutral-300 text-[10px] font-normal">
                        {user.role || 'user'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      {user.status === 'active' && (
                        <Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/20 border-0 text-[10px]">Active</Badge>
                      )}
                      {user.status === 'banned' && (
                        <Badge className="bg-red-500/10 text-red-500 hover:bg-red-500/20 border-0 text-[10px]">Banned</Badge>
                      )}
                      {user.status === 'suspended' && (
                        <Badge className="bg-orange-500/10 text-orange-500 hover:bg-orange-500/20 border-0 text-[10px]">Suspended</Badge>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right text-neutral-400 text-xs whitespace-nowrap">
                      {formatDate(user.created_at).split(',')[0]}
                    </td>
                    <td className="px-4 py-3 text-right text-neutral-400 text-xs whitespace-nowrap">
                      {user.last_login_at ? formatDate(user.last_login_at).split(',')[0] : '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-3 border-t border-[#2d2d2d] bg-[#1a1a1a] flex items-center justify-between">
          <div className="text-xs text-neutral-500">
            Page {pagination.page} of {pagination.pages}
          </div>
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="sm"
              className="h-7 w-7 p-0 bg-[#111111] border-[#2d2d2d]"
              disabled={pagination.page <= 1}
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-7 w-7 p-0 bg-[#111111] border-[#2d2d2d]"
              disabled={pagination.page >= pagination.pages}
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Detail View Column */}
      <div className="flex flex-col gap-4">
        {!selectedUser ? (
          <div className="h-full bg-[#1f1f1f] border border-[#2d2d2d] rounded-lg flex flex-col items-center justify-center p-6 text-center text-neutral-500">
             <User className="h-12 w-12 mb-4 opacity-20" />
             <p>Select a user to view details</p>
          </div>
        ) : (
          <>
            {/* User Profile Card */}
            <Card className="bg-[#1f1f1f] border border-[#2d2d2d] overflow-hidden">
              <div className="h-24 bg-gradient-to-r from-blue-900/20 to-purple-900/20 relative">
                 <div className="absolute -bottom-10 left-6">
                    <div className="h-20 w-20 rounded-full border-4 border-[#1f1f1f] bg-[#2d2d2d] overflow-hidden flex items-center justify-center">
                      {selectedUser.avatar_url ? (
                        <img src={selectedUser.avatar_url} alt={selectedUser.full_name} className="h-full w-full object-cover" />
                      ) : (
                        <span className="text-2xl text-neutral-400 font-bold">
                          {(selectedUser.full_name || '?').charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                 </div>
              </div>
              <CardContent className="pt-12 pb-6 px-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-white">{selectedUser.full_name || 'No Name'}</h3>
                    <div className="flex items-center gap-2 text-neutral-400 text-sm mt-1">
                      <Mail className="h-3 w-3" />
                      {selectedUser.email}
                    </div>
                    <div className="flex items-center gap-2 text-neutral-500 text-xs mt-1">
                      <span className="font-mono">{selectedUser.id}</span>
                    </div>
                  </div>
                  <Badge 
                     variant="outline" 
                     className={cn(
                       "text-xs px-2 py-0.5",
                       selectedUser.status === 'active' ? "border-green-800 text-green-500 bg-green-500/10" : 
                       selectedUser.status === 'banned' ? "border-red-800 text-red-500 bg-red-500/10" :
                       "border-orange-800 text-orange-500 bg-orange-500/10"
                     )}
                  >
                    {selectedUser.status.toUpperCase()}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-6">
                   <div className="bg-[#111111] rounded p-3 border border-[#2d2d2d]">
                      <div className="text-xs text-neutral-500 mb-1">Created</div>
                      <div className="text-sm text-white">{formatDate(selectedUser.created_at).split(',')[0]}</div>
                   </div>
                   <div className="bg-[#111111] rounded p-3 border border-[#2d2d2d]">
                      <div className="text-xs text-neutral-500 mb-1">Last Login</div>
                      <div className="text-sm text-white">
                        {selectedUser.last_login_at ? formatDate(selectedUser.last_login_at) : 'Never'}
                      </div>
                   </div>
                </div>
              </CardContent>
            </Card>

            {/* Stats Card */}
            <Card className="bg-[#1f1f1f] border border-[#2d2d2d]">
               <CardHeader className="pb-2 border-b border-[#2d2d2d]">
                  <CardTitle className="text-sm font-medium text-neutral-400">Activity Stats</CardTitle>
               </CardHeader>
               <CardContent className="pt-4">
                 <div className="space-y-3">
                   <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2 text-sm text-neutral-300">
                         <MessageSquare className="h-4 w-4 text-blue-500" />
                         Tickets
                      </div>
                      <span className="font-medium text-white">{selectedUser.stats?.tickets || 0}</span>
                   </div>
                   <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2 text-sm text-neutral-300">
                         <FileText className="h-4 w-4 text-purple-500" />
                         Scripts
                      </div>
                      <span className="font-medium text-white">{selectedUser.stats?.scripts || 0}</span>
                   </div>
                   <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2 text-sm text-neutral-300">
                         <Download className="h-4 w-4 text-green-500" />
                         Downloads
                      </div>
                      <span className="font-medium text-white">{selectedUser.downloads || 0}</span>
                   </div>
                 </div>
               </CardContent>
            </Card>

            {/* Actions Card */}
            <Card className="bg-[#1f1f1f] border border-[#2d2d2d] mt-auto">
               <CardHeader className="pb-2 border-b border-[#2d2d2d]">
                  <CardTitle className="text-sm font-medium text-neutral-400">Actions</CardTitle>
               </CardHeader>
               <CardContent className="pt-4 space-y-2">
                 {selectedUser.status === 'active' ? (
                   <Button 
                     variant="destructive" 
                     className="w-full justify-start bg-red-900/20 hover:bg-red-900/40 text-red-500 border border-red-900/50"
                     onClick={() => setBanDialogOpen(true)}
                   >
                     <Ban className="h-4 w-4 mr-2" />
                     Ban User
                   </Button>
                 ) : (
                   <Button 
                     variant="outline" 
                     className="w-full justify-start border-green-900/50 text-green-500 hover:bg-green-900/20 bg-green-900/10"
                     onClick={handleUnbanUser}
                   >
                     <CheckCircle className="h-4 w-4 mr-2" />
                     Unban User
                   </Button>
                 )}
                 
                 <Button variant="outline" className="w-full justify-start border-[#2d2d2d] bg-[#111111] text-neutral-300 hover:text-white">
                   <Shield className="h-4 w-4 mr-2" />
                   Change Role
                 </Button>

                 <Button variant="outline" className="w-full justify-start border-[#2d2d2d] bg-[#111111] text-neutral-300 hover:text-white">
                    <Lock className="h-4 w-4 mr-2" />
                    Reset Password
                 </Button>
               </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Ban Dialog */}
      <Dialog open={banDialogOpen} onOpenChange={setBanDialogOpen}>
        <DialogContent className="bg-[#1f1f1f] border-[#2d2d2d] text-white sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Ban User</DialogTitle>
            <DialogDescription className="text-neutral-400">
              You are about to ban {selectedUser?.full_name}. This will restrict their access to the platform.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-300">Ban Type</label>
              <Select value={banType} onValueChange={(v: any) => setBanType(v)}>
                <SelectTrigger className="bg-[#111111] border-[#2d2d2d] text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1a1a1a] border-[#2d2d2d] text-white">
                  <SelectItem value="temporary">Temporary</SelectItem>
                  <SelectItem value="permanent">Permanent</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {banType === 'temporary' && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                   <label className="text-sm font-medium text-neutral-300">Duration</label>
                   <Input 
                     type="number" 
                     value={banDuration} 
                     onChange={(e) => setBanDuration(Number(e.target.value))}
                     className="bg-[#111111] border-[#2d2d2d] text-white"
                   />
                </div>
                <div className="space-y-2">
                   <label className="text-sm font-medium text-neutral-300">Unit</label>
                   <Select value={banDurationUnit} onValueChange={(v: any) => setBanDurationUnit(v)}>
                    <SelectTrigger className="bg-[#111111] border-[#2d2d2d] text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1a1a1a] border-[#2d2d2d] text-white">
                      <SelectItem value="hours">Hours</SelectItem>
                      <SelectItem value="days">Days</SelectItem>
                      <SelectItem value="months">Months</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-300">Reason (Required)</label>
              <Input 
                placeholder="Violation of terms..."
                value={banReason}
                onChange={(e) => setBanReason(e.target.value)}
                className="bg-[#111111] border-[#2d2d2d] text-white"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBanDialogOpen(false)} className="border-[#2d2d2d] text-neutral-300">
              Cancel
            </Button>
            <Button onClick={handleBanUser} variant="destructive" className="bg-red-600 hover:bg-red-700">
              Confirm Ban
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
};

