import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  Database,
  Download,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Info,
  XCircle
} from 'lucide-react';
import { useAdminApi } from '@/hooks/useAdminApi';
import { cn } from '@/lib/utils';
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

interface LogsManagementProps {
  className?: string;
}

export const LogsManagement: React.FC<LogsManagementProps> = ({ className }) => {
  const { getSystemLogs, loading } = useAdminApi();
  
  const [logs, setLogs] = useState<any[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    pages: 1
  });
  const [filters, setFilters] = useState({
    search: '',
    level: 'all' // all | INFO | WARNING | ERROR
  });

  useEffect(() => {
    loadLogs();
  }, [pagination.page, filters.level]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      loadLogs();
    }, 500);
    return () => clearTimeout(timer);
  }, [filters.search]);

  const loadLogs = async () => {
    try {
      const params: any = {
        page: pagination.page,
        limit: pagination.limit,
        search: filters.search,
      };
      
      if (filters.level !== 'all') {
        params.level = filters.level;
      }

      const data = await getSystemLogs(params);
      setLogs(data.logs);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Failed to load logs:', error);
    }
  };

  const handleRefresh = () => {
    loadLogs();
  };

  const getLogLevelColor = (level: string) => {
    switch (level) {
      case 'ERROR': return 'text-red-500 bg-red-500/10 border-red-500/20';
      case 'WARNING': return 'text-orange-500 bg-orange-500/10 border-orange-500/20';
      default: return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
    }
  };

  const getLogLevelIcon = (level: string) => {
    switch (level) {
      case 'ERROR': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'WARNING': return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      default: return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  return (
    <div className={cn("space-y-6", className)}>
      <div className="bg-[#1f1f1f] border border-[#2d2d2d] rounded-lg flex flex-col h-[calc(100vh-100px)]">
        
        {/* Header */}
        <div className="p-4 border-b border-[#2d2d2d] flex flex-col sm:flex-row gap-4 justify-between items-center bg-[#1a1a1a]">
          <div className="flex items-center gap-2">
             <Database className="h-5 w-5 text-[#d9d9d9]" />
             <div>
                <h2 className="text-lg font-semibold text-white">System Logs</h2>
                <div className="text-xs text-neutral-500">Access logs and system events</div>
             </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-500" />
              <Input 
                placeholder="Search path or message..." 
                className="pl-10 bg-[#111111] border-[#2d2d2d] text-white h-9"
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              />
            </div>

            <Select 
              value={filters.level} 
              onValueChange={(val) => setFilters(prev => ({ ...prev, level: val }))}
            >
              <SelectTrigger className="w-[120px] bg-[#111111] border-[#2d2d2d] text-white h-9">
                <SelectValue placeholder="Level" />
              </SelectTrigger>
              <SelectContent className="bg-[#1a1a1a] border-[#2d2d2d] text-white">
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="INFO">Info</SelectItem>
                <SelectItem value="WARNING">Warning</SelectItem>
                <SelectItem value="ERROR">Error</SelectItem>
              </SelectContent>
            </Select>

            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRefresh}
              className="h-9 bg-[#111111] border-[#2d2d2d] text-white hover:bg-[#2d2d2d]"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
            
            <Button 
              variant="outline" 
              size="sm" 
              className="h-9 bg-[#111111] border-[#2d2d2d] text-white hover:bg-[#2d2d2d]"
            >
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Logs List */}
        <div className="flex-1 overflow-auto p-0 bg-[#1f1f1f]">
          <div className="min-w-full inline-block align-middle">
            <div className="border-b border-[#2d2d2d]">
               {/* Table Header */}
               <div className="flex text-xs font-medium text-neutral-400 bg-[#262626] border-b border-[#2d2d2d] sticky top-0 z-10">
                  <div className="px-4 py-2 w-32">Level</div>
                  <div className="px-4 py-2 w-48">Time</div>
                  <div className="px-4 py-2 flex-1">Message</div>
                  <div className="px-4 py-2 w-40">User</div>
                  <div className="px-4 py-2 w-32 text-right">IP</div>
               </div>

               {/* Rows */}
               <div className="divide-y divide-[#2d2d2d]">
                 {loading && logs.length === 0 ? (
                    <div className="p-8 text-center text-neutral-500">Loading logs...</div>
                 ) : logs.length === 0 ? (
                    <div className="p-8 text-center text-neutral-500">No logs found.</div>
                 ) : (
                    logs.map((log) => (
                      <div key={log.id} className="flex items-center text-sm hover:bg-[#2d2d2d] transition-colors font-mono">
                        <div className="px-4 py-2 w-32 flex items-center">
                           <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0 flex items-center gap-1 font-normal", getLogLevelColor(log.level))}>
                              {getLogLevelIcon(log.level)}
                              {log.level}
                           </Badge>
                        </div>
                        <div className="px-4 py-2 w-48 text-neutral-400 text-xs whitespace-nowrap">
                           {new Date(log.timestamp).toLocaleString('ru-RU')}
                        </div>
                        <div className="px-4 py-2 flex-1 text-neutral-300 break-all">
                           {log.message}
                        </div>
                        <div className="px-4 py-2 w-40 text-neutral-500 text-xs truncate">
                           {log.user}
                        </div>
                        <div className="px-4 py-2 w-32 text-right text-neutral-500 text-xs">
                           {log.ip}
                        </div>
                      </div>
                    ))
                 )}
               </div>
            </div>
          </div>
        </div>

        {/* Pagination */}
        <div className="p-3 border-t border-[#2d2d2d] bg-[#1a1a1a] flex items-center justify-between">
          <div className="text-xs text-neutral-500">
            Page {pagination.page} of {pagination.pages} (Total: {pagination.total})
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
    </div>
  );
};

