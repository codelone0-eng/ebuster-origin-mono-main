import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { API_CONFIG } from '@/config/api';
import {
  Users,
  DollarSign,
  TrendingUp,
  Search,
  Edit,
  CheckCircle,
  XCircle,
  Award,
  Link as LinkIcon,
  RefreshCcw,
  ChevronRight,
  ChevronLeft,
  Copy,
  Clock
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ReferralCode {
  id: string;
  code: string;
  user: {
    email: string;
    full_name: string;
  };
  uses_count: number;
  max_uses: number | null;
  discount_type: string;
  discount_value: number;
  is_active: boolean;
  expires_at: string | null;
  created_at: string;
  stats: {
    total_referrals: number;
    total_earnings: number;
  }[];
}

interface ReferralUse {
  id: string;
  referrer: {
    email: string;
    full_name: string;
  };
  referred: {
    email: string;
    full_name: string;
  };
  subscription: {
    plan: string;
    status: string;
  } | null;
  reward_value: number;
  reward_status: string;
  created_at: string;
}

interface SystemStats {
  totalCodes: number;
  activeCodes: number;
  totalUses: number;
  topReferrers: Array<{
    user: {
      email: string;
      full_name: string;
    };
    total_referrals: number;
    total_earnings: number;
  }>;
}

export const ReferralManagement: React.FC = () => {
  const { toast } = useToast();
  const [codes, setCodes] = useState<ReferralCode[]>([]);
  const [uses, setUses] = useState<ReferralUse[]>([]);
  const [systemStats, setSystemStats] = useState<SystemStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCodeId, setSelectedCodeId] = useState<string | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'codes' | 'global_uses' | 'stats'>('codes');

  const [editForm, setEditForm] = useState({
    discount_value: 0,
    max_uses: null as number | null,
    is_active: true,
    expires_at: null as string | null
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      const [codesRes, usesRes, statsRes] = await Promise.all([
        fetch(`${API_CONFIG.BASE_URL}/api/referral/admin/codes`),
        fetch(`${API_CONFIG.BASE_URL}/api/referral/admin/uses`),
        fetch(`${API_CONFIG.BASE_URL}/api/referral/admin/stats`)
      ]);

      const codesData = await codesRes.json();
      const usesData = await usesRes.json();
      const statsData = await statsRes.json();

      if (codesData.success) setCodes(codesData.data.codes);
      if (usesData.success) setUses(usesData.data.uses);
      if (statsData.success) setSystemStats(statsData.data);
    } catch (error) {
      console.error('Ошибка загрузки данных:', error);
      toast({
        title: 'Error',
        description: 'Failed to load referral data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditCode = (code: ReferralCode) => {
    setSelectedCodeId(code.id);
    setEditForm({
      discount_value: code.discount_value,
      max_uses: code.max_uses,
      is_active: code.is_active,
      expires_at: code.expires_at
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateCode = async () => {
    if (!selectedCodeId) return;

    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/referral/admin/codes/${selectedCodeId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm)
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'Success',
          description: 'Referral code updated'
        });
        setIsEditDialogOpen(false);
        loadData();
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update code',
        variant: 'destructive'
      });
    }
  };

  const filteredCodes = codes.filter(code =>
    code.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    code.user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedCode = codes.find(c => c.id === selectedCodeId);
  const selectedCodeUses = uses.filter(u => u.referrer.email === selectedCode?.user.email); // Approx match, better by ID if available

  return (
    <div className="flex h-[calc(100vh-100px)] flex-col bg-[#1f1f1f] border border-[#2d2d2d] rounded-lg overflow-hidden">
      
      <div className="grid h-full grid-cols-[350px_1fr] divide-x divide-[#2d2d2d]">
        
        {/* Left Sidebar */}
        <aside className="flex h-full flex-col bg-[#1a1a1a]">
          <div className="p-4 border-b border-[#2d2d2d]">
             <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                   <LinkIcon className="h-4 w-4" /> Referrals
                </h2>
                <div className="flex gap-1">
                   <Button 
                      variant="ghost" size="icon" 
                      className={cn("h-6 w-6", viewMode === 'codes' && "bg-[#2d2d2d]")}
                      onClick={() => setViewMode('codes')}
                      title="Codes"
                   >
                      <LinkIcon className="h-3 w-3" />
                   </Button>
                   <Button 
                      variant="ghost" size="icon" 
                      className={cn("h-6 w-6", viewMode === 'global_uses' && "bg-[#2d2d2d]")}
                      onClick={() => { setViewMode('global_uses'); setSelectedCodeId(null); }}
                      title="Global History"
                   >
                      <Clock className="h-3 w-3" />
                   </Button>
                   <Button 
                      variant="ghost" size="icon" 
                      className={cn("h-6 w-6", viewMode === 'stats' && "bg-[#2d2d2d]")}
                      onClick={() => { setViewMode('stats'); setSelectedCodeId(null); }}
                      title="Global Stats"
                   >
                      <TrendingUp className="h-3 w-3" />
                   </Button>
                </div>
             </div>

             {viewMode === 'codes' && (
                <div className="relative">
                   <Search className="absolute left-2 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                   <Input 
                      placeholder="Search codes..." 
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8 h-8 bg-[#111111] border-[#2d2d2d] text-white text-xs"
                   />
                </div>
             )}
          </div>

          <ScrollArea className="flex-1">
             {viewMode === 'codes' ? (
                <div className="flex flex-col">
                   {filteredCodes.map(code => (
                      <button
                         key={code.id}
                         onClick={() => setSelectedCodeId(code.id)}
                         className={cn(
                            "flex flex-col items-start p-3 text-left border-b border-[#2d2d2d] hover:bg-[#2d2d2d]/50 transition-colors",
                            selectedCodeId === code.id && "bg-[#2d2d2d] border-l-2 border-l-blue-500 pl-[10px]"
                         )}
                      >
                         <div className="flex items-center justify-between w-full mb-1">
                            <span className="font-mono font-bold text-sm text-white">{code.code}</span>
                            <Badge variant="outline" className={cn("text-[10px] px-1 py-0 h-4 border-0", code.is_active ? "text-green-500 bg-green-500/10" : "text-muted-foreground bg-muted/10")}>
                               {code.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                         </div>
                         <div className="text-xs text-muted-foreground mb-1 w-full truncate">
                            {code.user.email}
                         </div>
                         <div className="flex items-center justify-between w-full text-[10px] text-muted-foreground">
                            <span>{code.uses_count} uses</span>
                            <span>{code.discount_value}% off</span>
                         </div>
                      </button>
                   ))}
                </div>
             ) : (
                <div className="p-4 text-center text-sm text-muted-foreground">
                   Select a view mode above
                </div>
             )}
          </ScrollArea>
        </aside>

        {/* Main Content */}
        <main className="flex h-full flex-col bg-[#1f1f1f] overflow-hidden">
           {/* Global Views */}
           {viewMode === 'stats' && (
              <div className="p-6 space-y-6 overflow-y-auto">
                 <h2 className="text-lg font-semibold text-white mb-4">Global Statistics</h2>
                 <div className="grid grid-cols-4 gap-4">
                    <Card className="bg-[#1a1a1a] border-[#2d2d2d]">
                       <CardContent className="p-4">
                          <div className="text-xs text-muted-foreground mb-1">Total Codes</div>
                          <div className="text-2xl font-bold text-white">{systemStats?.totalCodes}</div>
                       </CardContent>
                    </Card>
                    <Card className="bg-[#1a1a1a] border-[#2d2d2d]">
                       <CardContent className="p-4">
                          <div className="text-xs text-muted-foreground mb-1">Active Codes</div>
                          <div className="text-2xl font-bold text-white">{systemStats?.activeCodes}</div>
                       </CardContent>
                    </Card>
                    <Card className="bg-[#1a1a1a] border-[#2d2d2d]">
                       <CardContent className="p-4">
                          <div className="text-xs text-muted-foreground mb-1">Total Uses</div>
                          <div className="text-2xl font-bold text-white">{systemStats?.totalUses}</div>
                       </CardContent>
                    </Card>
                    <Card className="bg-[#1a1a1a] border-[#2d2d2d]">
                       <CardContent className="p-4">
                          <div className="text-xs text-muted-foreground mb-1">Conversion</div>
                          <div className="text-2xl font-bold text-white">
                             {systemStats?.totalCodes ? ((systemStats.totalUses / systemStats.totalCodes) * 100).toFixed(1) : 0}%
                          </div>
                       </CardContent>
                    </Card>
                 </div>

                 <Card className="bg-[#1a1a1a] border-[#2d2d2d]">
                    <CardHeader className="pb-2">
                       <CardTitle className="text-sm font-medium text-white">Top Referrers</CardTitle>
                    </CardHeader>
                    <CardContent>
                       <div className="space-y-2">
                          {systemStats?.topReferrers?.map((ref, i) => (
                             <div key={i} className="flex items-center justify-between p-2 hover:bg-[#2d2d2d] rounded">
                                <div className="flex items-center gap-3">
                                   <div className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-500 flex items-center justify-center text-xs font-bold">
                                      {i + 1}
                                   </div>
                                   <div>
                                      <div className="text-sm text-white">{ref.user.email}</div>
                                      <div className="text-xs text-muted-foreground">{ref.user.full_name}</div>
                                   </div>
                                </div>
                                <div className="text-right">
                                   <div className="text-sm text-white font-medium">{ref.total_referrals} referrals</div>
                                   <div className="text-xs text-green-500">${ref.total_earnings.toFixed(2)} earned</div>
                                </div>
                             </div>
                          ))}
                       </div>
                    </CardContent>
                 </Card>
              </div>
           )}

           {viewMode === 'global_uses' && (
              <div className="flex flex-col h-full">
                 <div className="p-4 border-b border-[#2d2d2d] bg-[#1a1a1a]">
                    <h2 className="text-lg font-semibold text-white">Global Usage History</h2>
                 </div>
                 <div className="flex-1 overflow-y-auto p-0">
                    <table className="w-full text-sm text-left">
                       <thead className="text-xs text-muted-foreground bg-[#262626] sticky top-0">
                          <tr>
                             <th className="px-4 py-2">Date</th>
                             <th className="px-4 py-2">Referred User</th>
                             <th className="px-4 py-2">Referrer</th>
                             <th className="px-4 py-2 text-right">Reward</th>
                          </tr>
                       </thead>
                       <tbody className="divide-y divide-[#2d2d2d]">
                          {uses.map(use => (
                             <tr key={use.id} className="hover:bg-[#2d2d2d]">
                                <td className="px-4 py-2 text-muted-foreground text-xs">
                                   {new Date(use.created_at).toLocaleDateString()}
                                </td>
                                <td className="px-4 py-2 text-white">
                                   {use.referred.email}
                                </td>
                                <td className="px-4 py-2 text-muted-foreground">
                                   {use.referrer.email}
                                </td>
                                <td className="px-4 py-2 text-right text-green-500">
                                   +${use.reward_value.toFixed(2)}
                                </td>
                             </tr>
                          ))}
                       </tbody>
                    </table>
                 </div>
              </div>
           )}

           {viewMode === 'codes' && selectedCode ? (
              <div className="flex flex-col h-full">
                 {/* Code Header */}
                 <div className="p-6 border-b border-[#2d2d2d] bg-[#1a1a1a] flex justify-between items-start">
                    <div>
                       <div className="flex items-center gap-3 mb-1">
                          <h1 className="text-2xl font-mono font-bold text-white">{selectedCode.code}</h1>
                          <Badge className={cn(selectedCode.is_active ? "bg-green-500/20 text-green-500" : "bg-red-500/20 text-red-500")}>
                             {selectedCode.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                       </div>
                       <div className="text-sm text-muted-foreground flex items-center gap-2">
                          <Users className="h-3 w-3" /> {selectedCode.user.email}
                       </div>
                    </div>
                    <Button variant="outline" onClick={() => handleEditCode(selectedCode)} className="bg-[#2d2d2d] border-[#404040] text-white">
                       <Edit className="h-4 w-4 mr-2" /> Edit Code
                    </Button>
                 </div>

                 {/* Code Stats */}
                 <div className="grid grid-cols-4 gap-4 p-6 border-b border-[#2d2d2d]">
                    <div>
                       <div className="text-xs text-muted-foreground mb-1">Uses</div>
                       <div className="text-xl font-bold text-white">{selectedCode.uses_count} <span className="text-xs text-muted-foreground font-normal">/ {selectedCode.max_uses || '∞'}</span></div>
                    </div>
                    <div>
                       <div className="text-xs text-muted-foreground mb-1">Discount</div>
                       <div className="text-xl font-bold text-white">{selectedCode.discount_value}%</div>
                    </div>
                    <div>
                       <div className="text-xs text-muted-foreground mb-1">Earnings</div>
                       <div className="text-xl font-bold text-green-500">${selectedCode.stats?.[0]?.total_earnings?.toFixed(2) || '0.00'}</div>
                    </div>
                    <div>
                       <div className="text-xs text-muted-foreground mb-1">Referrals</div>
                       <div className="text-xl font-bold text-white">{selectedCode.stats?.[0]?.total_referrals || 0}</div>
                    </div>
                 </div>

                 {/* Usage History for Code */}
                 <div className="flex-1 overflow-y-auto p-6">
                    <h3 className="text-sm font-semibold text-white mb-4">Usage History</h3>
                    {selectedCodeUses.length === 0 ? (
                       <div className="text-center text-muted-foreground text-sm py-8">No usage history yet.</div>
                    ) : (
                       <div className="space-y-2">
                          {selectedCodeUses.map(use => (
                             <div key={use.id} className="flex items-center justify-between p-3 bg-[#1a1a1a] border border-[#2d2d2d] rounded-lg">
                                <div className="flex items-center gap-3">
                                   <div className="w-8 h-8 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center">
                                      <Users className="h-4 w-4" />
                                   </div>
                                   <div>
                                      <div className="text-sm text-white font-medium">{use.referred.email}</div>
                                      <div className="text-xs text-muted-foreground">{new Date(use.created_at).toLocaleString()}</div>
                                   </div>
                                </div>
                                <div className="text-right">
                                   <div className="text-sm text-green-500 font-medium">+${use.reward_value.toFixed(2)}</div>
                                   <Badge variant="outline" className="text-[10px] h-4 border-0 bg-[#2d2d2d] text-muted-foreground">
                                      {use.reward_status}
                                   </Badge>
                                </div>
                             </div>
                          ))}
                       </div>
                    )}
                 </div>
              </div>
           ) : viewMode === 'codes' && !selectedCode ? (
              <div className="flex h-full items-center justify-center text-muted-foreground text-sm">
                 Select a code to view details
              </div>
           ) : null}
        </main>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
         <DialogContent className="bg-[#1f1f1f] border-[#2d2d2d] text-white">
            <DialogHeader>
               <DialogTitle>Edit Referral Code</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
               <div className="space-y-2">
                  <Label>Discount (%)</Label>
                  <Input 
                     type="number" 
                     min="0" max="100"
                     value={editForm.discount_value}
                     onChange={(e) => setEditForm({...editForm, discount_value: Number(e.target.value)})}
                     className="bg-[#111111] border-[#2d2d2d] text-white"
                  />
               </div>
               <div className="space-y-2">
                  <Label>Max Uses (leave empty for unlimited)</Label>
                  <Input 
                     type="number"
                     value={editForm.max_uses || ''}
                     onChange={(e) => setEditForm({...editForm, max_uses: e.target.value ? Number(e.target.value) : null})}
                     placeholder="Unlimited"
                     className="bg-[#111111] border-[#2d2d2d] text-white"
                  />
               </div>
               <div className="flex items-center space-x-2">
                  <input 
                     type="checkbox"
                     id="is_active"
                     checked={editForm.is_active}
                     onChange={(e) => setEditForm({...editForm, is_active: e.target.checked})}
                     className="rounded bg-[#111111] border-[#2d2d2d]"
                  />
                  <Label htmlFor="is_active">Active</Label>
               </div>
            </div>
            <DialogFooter>
               <Button variant="ghost" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
               <Button onClick={handleUpdateCode} className="bg-blue-600 hover:bg-blue-700 text-white">Save Changes</Button>
            </DialogFooter>
         </DialogContent>
      </Dialog>

    </div>
  );
};
