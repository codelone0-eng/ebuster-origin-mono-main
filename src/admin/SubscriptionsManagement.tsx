import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  Crown,
  Zap,
  Shield,
  Gift,
  Plus,
  RefreshCcw,
  MoreHorizontal,
  CheckCircle,
  XCircle,
  Calendar,
  CreditCard,
  Clock,
  DollarSign,
  Users,
  Trash2,
  Edit
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { Label } from "@/components/ui/label";
import { Combobox } from '@/components/ui/combobox';

interface SubscriptionsManagementProps {
  className?: string;
}

const PLAN_PRICES = {
  free: 0,
  premium: 9.99,
  pro: 29.99,
  enterprise: 99.99
};

const PLAN_FEATURES = {
  free: ['Basic Scripts', 'Community Support'],
  premium: ['Premium Scripts', 'Priority Support', 'No Ads'],
  pro: ['Pro Scripts', 'API Access', 'Analytics', 'Custom Scripts'],
  enterprise: ['Unlimited Scripts', 'Dedicated Support', 'SLA', 'Custom Integration']
};

export const SubscriptionsManagement: React.FC<SubscriptionsManagementProps> = ({ className }) => {
  const { 
    getSubscriptions, 
    getSubscriptionStats, 
    createSubscription, 
    updateSubscription, 
    cancelSubscription, 
    renewSubscription, 
    deleteSubscription 
  } = useAdminApi();
  
  // State
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSubId, setSelectedSubId] = useState<string | null>(null);
  
  // Filters
  const [filters, setFilters] = useState({
    search: '',
    plan: 'all',
    status: 'all'
  });

  // Dialogs
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  // Form Data
  const [formData, setFormData] = useState({
    user_email: '',
    plan: 'premium',
    duration_months: 1,
    auto_renew: true,
    status: 'active'
  });
  
  const [userOptions, setUserOptions] = useState<{ value: string; label: string }[]>([]);
  const [searchingUsers, setSearchingUsers] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  // Debounced user search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (formData.user_email && isCreateOpen) {
        searchUsers(formData.user_email);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [formData.user_email, isCreateOpen]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [subsData, statsData] = await Promise.all([
        getSubscriptions(),
        getSubscriptionStats()
      ]);
      
      if (subsData.success) {
        setSubscriptions(subsData.data.subscriptions || []);
        // Select first item if none selected
        if (!selectedSubId && subsData.data.subscriptions?.length > 0) {
           setSelectedSubId(subsData.data.subscriptions[0].id);
        }
      }
      if (statsData.success) {
        setStats(statsData.data);
      }
    } catch (error) {
      console.error('Failed to load subscriptions:', error);
      toast({ title: 'Error', description: 'Failed to load data', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const searchUsers = async (query: string) => {
    if (!query || query.length < 2) return;
    try {
      setSearchingUsers(true);
      // Note: Assuming searchUsers exists on API or use a specific endpoint. 
      // Since useAdminApi exposes searchUsers (imported in AdminDashboard), we might need to add it to useAdminApi return if not present.
      // For now, let's assume we can search via the users endpoint or similar.
      // We'll fetch from /api/admin/users/search?email=...
      const token = localStorage.getItem('ebuster_token');
      const response = await fetch(`/api/admin/users/search?email=${encodeURIComponent(query)}`, {
         headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      
      if (data.success && data.data) {
        setUserOptions(data.data.map((u: any) => ({
           value: u.email,
           label: `${u.email} (${u.full_name || 'No Name'})`
        })));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSearchingUsers(false);
    }
  };

  const handleCreate = async () => {
    try {
       const res = await createSubscription(formData);
       if (res.success) {
         toast({ title: 'Success', description: 'Subscription created' });
         setIsCreateOpen(false);
         loadData();
       } else {
         throw new Error(res.error);
       }
    } catch (error: any) {
       toast({ title: 'Error', description: error.message || 'Failed to create', variant: 'destructive' });
    }
  };

  const handleUpdate = async () => {
    if (!selectedSubId) return;
    try {
       const res = await updateSubscription(selectedSubId, formData);
       if (res.success) {
         toast({ title: 'Success', description: 'Subscription updated' });
         setIsEditOpen(false);
         loadData();
       }
    } catch (error: any) {
       toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const handleRenew = async (months: number) => {
    if (!selectedSubId) return;
    try {
      await renewSubscription(selectedSubId, months);
      toast({ title: 'Success', description: `Renewed for ${months} months` });
      loadData();
    } catch (e) {
      toast({ title: 'Error', variant: 'destructive' });
    }
  };

  const handleCancel = async () => {
    if (!selectedSubId) return;
    if (!confirm('Are you sure?')) return;
    try {
      await cancelSubscription(selectedSubId);
      toast({ title: 'Success', description: 'Subscription cancelled' });
      loadData();
    } catch (e) {
      toast({ title: 'Error', variant: 'destructive' });
    }
  };

  const handleDelete = async () => {
    if (!selectedSubId) return;
    if (!confirm('Delete subscription? This cannot be undone.')) return;
    try {
      await deleteSubscription(selectedSubId);
      toast({ title: 'Success', description: 'Subscription deleted' });
      setSelectedSubId(null);
      loadData();
    } catch (e) {
      toast({ title: 'Error', variant: 'destructive' });
    }
  };

  const filteredSubscriptions = subscriptions.filter(sub => {
    const matchesSearch = 
      sub.user_email?.toLowerCase().includes(filters.search.toLowerCase()) || 
      sub.user_name?.toLowerCase().includes(filters.search.toLowerCase());
    const matchesPlan = filters.plan === 'all' || sub.plan === filters.plan;
    const matchesStatus = filters.status === 'all' || sub.status === filters.status;
    return matchesSearch && matchesPlan && matchesStatus;
  });

  const selectedSubscription = subscriptions.find(s => s.id === selectedSubId);

  const getPlanIcon = (plan: string) => {
    switch (plan) {
      case 'premium': return <Crown className="h-4 w-4 text-yellow-500" />;
      case 'pro': return <Zap className="h-4 w-4 text-blue-500" />;
      case 'enterprise': return <Shield className="h-4 w-4 text-purple-500" />;
      default: return <Gift className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-500 bg-green-500/10 border-green-500/20';
      case 'trial': return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
      case 'expired': return 'text-red-500 bg-red-500/10 border-red-500/20';
      default: return 'text-gray-500 bg-gray-500/10 border-gray-500/20';
    }
  };

  return (
    <div className={cn("grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6 h-[calc(100vh-100px)]", className)}>
      
      {/* List Column */}
      <div className="flex flex-col bg-[#1f1f1f] border border-[#2d2d2d] rounded-lg overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-[#2d2d2d] flex flex-col sm:flex-row gap-4 justify-between items-center bg-[#1a1a1a]">
          <div className="flex items-center gap-2">
             <div className="relative w-48">
                <Search className="absolute left-2 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                <Input 
                   placeholder="Search users..." 
                   className="pl-8 h-9 bg-[#111111] border-[#2d2d2d] text-white"
                   value={filters.search}
                   onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                />
             </div>
             <Select value={filters.plan} onValueChange={(v) => setFilters(prev => ({ ...prev, plan: v }))}>
                <SelectTrigger className="w-32 h-9 bg-[#111111] border-[#2d2d2d] text-white">
                   <SelectValue placeholder="Plan" />
                </SelectTrigger>
                <SelectContent className="bg-[#1a1a1a] border-[#2d2d2d] text-white">
                   <SelectItem value="all">All Plans</SelectItem>
                   <SelectItem value="free">Free</SelectItem>
                   <SelectItem value="premium">Premium</SelectItem>
                   <SelectItem value="pro">Pro</SelectItem>
                   <SelectItem value="enterprise">Enterprise</SelectItem>
                </SelectContent>
             </Select>
          </div>
          <div className="flex items-center gap-2">
             <Button variant="outline" size="sm" onClick={loadData} className="h-9 bg-[#111111] border-[#2d2d2d] text-white hover:bg-[#2d2d2d]">
                <RefreshCcw className="h-3.5 w-3.5" />
             </Button>
             <Button onClick={() => setIsCreateOpen(true)} size="sm" className="h-9 bg-blue-600 hover:bg-blue-700 text-white">
                <Plus className="h-3.5 w-3.5 mr-2" /> New
             </Button>
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-auto">
           <table className="w-full text-sm text-left">
              <thead className="text-xs text-neutral-400 uppercase bg-[#262626] sticky top-0 z-10">
                 <tr>
                    <th className="px-4 py-3 font-medium">User</th>
                    <th className="px-4 py-3 font-medium">Plan</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium text-right">Expires</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-[#2d2d2d]">
                 {loading && subscriptions.length === 0 ? (
                    <tr><td colSpan={4} className="p-4 text-center text-muted-foreground">Loading...</td></tr>
                 ) : filteredSubscriptions.length === 0 ? (
                    <tr><td colSpan={4} className="p-4 text-center text-muted-foreground">No subscriptions found</td></tr>
                 ) : (
                    filteredSubscriptions.map((sub) => (
                       <tr 
                          key={sub.id} 
                          className={cn(
                             "hover:bg-[#2d2d2d] cursor-pointer transition-colors",
                             selectedSubId === sub.id && "bg-[#2d2d2d] border-l-2 border-blue-500"
                          )}
                          onClick={() => setSelectedSubId(sub.id)}
                       >
                          <td className="px-4 py-3">
                             <div className="flex flex-col">
                                <span className="font-medium text-white text-sm">{sub.user_name || 'No Name'}</span>
                                <span className="text-xs text-muted-foreground">{sub.user_email}</span>
                             </div>
                          </td>
                          <td className="px-4 py-3">
                             <div className="flex items-center gap-2">
                                {getPlanIcon(sub.plan)}
                                <span className="capitalize text-neutral-300">{sub.plan}</span>
                             </div>
                          </td>
                          <td className="px-4 py-3">
                             <Badge variant="outline" className={cn("text-[10px] border-0 font-normal", getStatusColor(sub.status))}>
                                {sub.status}
                             </Badge>
                          </td>
                          <td className="px-4 py-3 text-right text-neutral-400 text-xs">
                             {new Date(sub.end_date).toLocaleDateString()}
                          </td>
                       </tr>
                    ))
                 )}
              </tbody>
           </table>
        </div>
      </div>

      {/* Detail Column */}
      <div className="flex flex-col gap-4">
         {/* Stats Cards (Small) */}
         {stats && (
            <div className="grid grid-cols-2 gap-4">
               <Card className="bg-[#1f1f1f] border-[#2d2d2d] p-4">
                  <div className="text-xs text-muted-foreground mb-1">Total Revenue</div>
                  <div className="text-xl font-bold text-white">${stats.revenue?.total?.toFixed(2) || '0.00'}</div>
               </Card>
               <Card className="bg-[#1f1f1f] border-[#2d2d2d] p-4">
                  <div className="text-xs text-muted-foreground mb-1">Active Subs</div>
                  <div className="text-xl font-bold text-white">{stats.active || 0}</div>
               </Card>
            </div>
         )}

         {/* Selected Details */}
         {selectedSubscription ? (
            <>
               <Card className="bg-[#1f1f1f] border-[#2d2d2d] flex-1">
                  <CardHeader className="pb-4 border-b border-[#2d2d2d]">
                     <div className="flex items-center justify-between">
                        <CardTitle className="text-lg font-semibold text-white">Subscription Details</CardTitle>
                        <Button variant="ghost" size="icon" onClick={() => {
                           setFormData({
                              user_email: selectedSubscription.user_email,
                              plan: selectedSubscription.plan,
                              duration_months: 1,
                              auto_renew: selectedSubscription.auto_renew,
                              status: selectedSubscription.status
                           });
                           setIsEditOpen(true);
                        }}>
                           <Edit className="h-4 w-4 text-muted-foreground" />
                        </Button>
                     </div>
                  </CardHeader>
                  <CardContent className="pt-6 space-y-6">
                     <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-[#2d2d2d] flex items-center justify-center">
                           {getPlanIcon(selectedSubscription.plan)}
                        </div>
                        <div>
                           <h3 className="text-xl font-bold text-white capitalize">{selectedSubscription.plan} Plan</h3>
                           <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <span>${selectedSubscription.amount || PLAN_PRICES[selectedSubscription.plan as keyof typeof PLAN_PRICES] || 0}/mo</span>
                              <span>•</span>
                              <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0 h-4 border-0", getStatusColor(selectedSubscription.status))}>
                                 {selectedSubscription.status}
                              </Badge>
                           </div>
                        </div>
                     </div>

                     <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                           <div>
                              <span className="text-muted-foreground block mb-1">User</span>
                              <span className="text-white">{selectedSubscription.user_email}</span>
                           </div>
                           <div>
                              <span className="text-muted-foreground block mb-1">Created</span>
                              <span className="text-white">{new Date(selectedSubscription.created_at).toLocaleDateString()}</span>
                           </div>
                           <div>
                              <span className="text-muted-foreground block mb-1">Starts</span>
                              <span className="text-white">{new Date(selectedSubscription.start_date).toLocaleDateString()}</span>
                           </div>
                           <div>
                              <span className="text-muted-foreground block mb-1">Ends</span>
                              <span className="text-white">{new Date(selectedSubscription.end_date).toLocaleDateString()}</span>
                           </div>
                        </div>
                        
                        <div className="pt-4 border-t border-[#2d2d2d]">
                           <span className="text-sm text-muted-foreground block mb-2">Features</span>
                           <ul className="text-sm text-white space-y-1">
                              {(selectedSubscription.features || PLAN_FEATURES[selectedSubscription.plan as keyof typeof PLAN_FEATURES] || []).map((f: string, i: number) => (
                                 <li key={i} className="flex items-center gap-2">
                                    <CheckCircle className="h-3 w-3 text-green-500" /> {f}
                                 </li>
                              ))}
                           </ul>
                        </div>
                     </div>
                  </CardContent>
               </Card>

               <Card className="bg-[#1f1f1f] border-[#2d2d2d]">
                  <CardContent className="p-4 space-y-2">
                     {selectedSubscription.status === 'active' && (
                        <>
                           <Button variant="outline" className="w-full justify-start bg-[#111111] border-[#2d2d2d] text-white hover:bg-[#2d2d2d]" onClick={() => handleRenew(1)}>
                              <Calendar className="mr-2 h-4 w-4" /> Extend 1 Month
                           </Button>
                           <Button variant="outline" className="w-full justify-start bg-[#111111] border-[#2d2d2d] text-white hover:bg-[#2d2d2d]" onClick={handleCancel}>
                              <XCircle className="mr-2 h-4 w-4" /> Cancel Subscription
                           </Button>
                        </>
                     )}
                     <Button variant="destructive" className="w-full justify-start bg-red-900/20 border border-red-900/50 text-red-500 hover:bg-red-900/40" onClick={handleDelete}>
                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                     </Button>
                  </CardContent>
               </Card>
            </>
         ) : (
            <div className="flex-1 flex items-center justify-center bg-[#1f1f1f] border border-[#2d2d2d] rounded-lg text-muted-foreground text-sm">
               Select a subscription to view details
            </div>
         )}
      </div>

      {/* Create Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="bg-[#1f1f1f] border-[#2d2d2d] text-white sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create Subscription</DialogTitle>
            <DialogDescription className="text-muted-foreground">Grant a new subscription to a user.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
             <div className="space-y-2">
                <Label>User Email</Label>
                <Combobox
                   options={userOptions}
                   value={formData.user_email}
                   onValueChange={(v) => setFormData(prev => ({ ...prev, user_email: v }))}
                   placeholder="Search user..."
                   className="bg-[#111111] border-[#2d2d2d] text-white w-full"
                />
             </div>
             <div className="space-y-2">
                <Label>Plan</Label>
                <Select value={formData.plan} onValueChange={(v: any) => setFormData(prev => ({ ...prev, plan: v }))}>
                   <SelectTrigger className="bg-[#111111] border-[#2d2d2d] text-white">
                      <SelectValue />
                   </SelectTrigger>
                   <SelectContent className="bg-[#1a1a1a] border-[#2d2d2d] text-white">
                      <SelectItem value="free">Free</SelectItem>
                      <SelectItem value="premium">Premium</SelectItem>
                      <SelectItem value="pro">Pro</SelectItem>
                      <SelectItem value="enterprise">Enterprise</SelectItem>
                   </SelectContent>
                </Select>
             </div>
             <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                   <Label>Duration (Months)</Label>
                   <Input 
                      type="number" 
                      min={1} 
                      value={formData.duration_months} 
                      onChange={(e) => setFormData(prev => ({ ...prev, duration_months: parseInt(e.target.value) }))}
                      className="bg-[#111111] border-[#2d2d2d] text-white"
                   />
                </div>
                <div className="space-y-2">
                   <Label>Status</Label>
                   <Select value={formData.status} onValueChange={(v: any) => setFormData(prev => ({ ...prev, status: v }))}>
                      <SelectTrigger className="bg-[#111111] border-[#2d2d2d] text-white">
                         <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1a1a1a] border-[#2d2d2d] text-white">
                         <SelectItem value="active">Active</SelectItem>
                         <SelectItem value="trial">Trial</SelectItem>
                      </SelectContent>
                   </Select>
                </div>
             </div>
          </div>
          <DialogFooter>
             <Button variant="ghost" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
             <Button onClick={handleCreate} className="bg-blue-600 hover:bg-blue-700 text-white">Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="bg-[#1f1f1f] border-[#2d2d2d] text-white sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Subscription</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
             <div className="space-y-2">
                <Label>User</Label>
                <Input value={formData.user_email} disabled className="bg-[#2d2d2d] border-[#2d2d2d] text-neutral-400" />
             </div>
             <div className="space-y-2">
                <Label>Plan</Label>
                <Select value={formData.plan} onValueChange={(v: any) => setFormData(prev => ({ ...prev, plan: v }))}>
                   <SelectTrigger className="bg-[#111111] border-[#2d2d2d] text-white">
                      <SelectValue />
                   </SelectTrigger>
                   <SelectContent className="bg-[#1a1a1a] border-[#2d2d2d] text-white">
                      <SelectItem value="free">Free</SelectItem>
                      <SelectItem value="premium">Premium</SelectItem>
                      <SelectItem value="pro">Pro</SelectItem>
                      <SelectItem value="enterprise">Enterprise</SelectItem>
                   </SelectContent>
                </Select>
             </div>
             <div className="space-y-2">
                <Label>Status</Label>
                <Select value={formData.status} onValueChange={(v: any) => setFormData(prev => ({ ...prev, status: v }))}>
                   <SelectTrigger className="bg-[#111111] border-[#2d2d2d] text-white">
                      <SelectValue />
                   </SelectTrigger>
                   <SelectContent className="bg-[#1a1a1a] border-[#2d2d2d] text-white">
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="trial">Trial</SelectItem>
                      <SelectItem value="expired">Expired</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                   </SelectContent>
                </Select>
             </div>
             <div className="flex items-center gap-2">
                <input 
                   type="checkbox" 
                   checked={formData.auto_renew} 
                   onChange={(e) => setFormData(prev => ({ ...prev, auto_renew: e.target.checked }))}
                   className="rounded bg-[#111111] border-[#2d2d2d]"
                />
                <Label>Auto Renew</Label>
             </div>
          </div>
          <DialogFooter>
             <Button variant="ghost" onClick={() => setIsEditOpen(false)}>Cancel</Button>
             <Button onClick={handleUpdate} className="bg-blue-600 hover:bg-blue-700 text-white">Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
};

export default SubscriptionsManagement;
