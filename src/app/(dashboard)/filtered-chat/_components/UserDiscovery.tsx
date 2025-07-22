"use client";

import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { Search, Filter, MapPin, User as UserIcon, Calendar, MessageCircle, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { OnlineUser } from '../page';
import { supabase } from '@/lib/client';
import { Badge } from '@/components/ui/badge';

interface UserDiscoveryProps {
  currentUser: User;
  onUserSelect: (user: OnlineUser) => void;
  isMobileView: boolean;
}

const UserDiscovery = ({ currentUser, onUserSelect, isMobileView }: UserDiscoveryProps) => {
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<OnlineUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [genderFilter, setGenderFilter] = useState('');
  const [countryFilter, setCountryFilter] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showOnlyLookingForChat, setShowOnlyLookingForChat] = useState(false);

  useEffect(() => {
    loadOnlineUsers();
    
    // Set user as online and looking for chat
    updateUserPresence(true, true);

    // Set up realtime subscription for presence changes
    const presenceChannel = supabase
      .channel('user_presence_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_presence'
        },
        () => {
          loadOnlineUsers();
        }
      )
      .subscribe();

    return () => {
      updateUserPresence(false, false);
      supabase.removeChannel(presenceChannel);
    };
  }, []);

  useEffect(() => {
    loadOnlineUsers();
  }, [genderFilter, countryFilter, cityFilter, showOnlyLookingForChat]);

  useEffect(() => {
    applyFilters();
  }, [onlineUsers, searchQuery]);

  const updateUserPresence = async (isOnline: boolean, lookingForChat: boolean) => {
    try {
      await supabase
        .from('user_presence')
        .upsert({
          user_id: currentUser.id,
          is_online: isOnline,
          looking_for_chat: lookingForChat,
          last_seen: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
    } catch (error) {
      console.error('Error updating presence:', error);
    }
  };

  const loadOnlineUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.rpc('get_all_online_users_for_chat', {
        filter_gender: genderFilter || null,
        filter_country: countryFilter || null,
        filter_city: cityFilter || null,
        only_looking_for_chat: showOnlyLookingForChat
      });
      
      if (error) {
        console.error('Error loading users:', error);
        toast.error('Failed to load online users');
      } else {
        setOnlineUsers(data || []);
      }
    } catch (error) {
      console.error('Error loading users:', error);
      toast.error('Failed to load online users');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...onlineUsers];

    if (searchQuery.trim()) {
      filtered = filtered.filter(user => 
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.country?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.city?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredUsers(filtered);
  };

  const clearFilters = () => {
    setGenderFilter('');
    setCountryFilter('');
    setCityFilter('');
    setSearchQuery('');
    setShowOnlyLookingForChat(false);
  };

  const getTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  // Generate avatar URL
  const getAvatarUrl = (userId: string, name: string) => {
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F'];
    const color = colors[parseInt(userId.slice(-1), 16) % colors.length];
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=${color.slice(1)}&color=fff&size=48`;
  };

  return (
    <div className="flex flex-col h-full">
      {/* Search */}
      <div className="p-4">
        <div className="relative mb-4">
          <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search or start new chat"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 sm:py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:border-primary transition-colors"
          />
        </div>

        {/* Filter Controls */}
        <div className="flex gap-2 items-center mb-4">
          <Button
            onClick={() => setShowFilters(!showFilters)}
            variant="outline"
            size="sm"
            className="text-muted-foreground border-border hover:bg-muted"
          >
            <Filter className="w-4 h-4 mr-2" />
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </Button>
          <Button
            onClick={loadOnlineUsers}
            variant="outline"
            size="sm"
            className="text-muted-foreground border-border hover:bg-muted"
          >
            Refresh
          </Button>
          <div className="ml-auto text-xs text-muted-foreground">
            {filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''} online
          </div>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <Card className="bg-background border-border mb-4">
            <CardHeader>
              <CardTitle className="text-foreground text-sm">Filter Options</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-foreground text-xs">Gender</Label>
                  <select
                    value={genderFilter}
                    onChange={(e) => setGenderFilter(e.target.value)}
                    className="flex h-9 w-full rounded-md border border-border bg-background px-3 py-2 text-foreground text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                  >
                    <option value="">Any</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label className="text-foreground text-xs">Country</Label>
                  <Input
                    placeholder="Filter by country"
                    value={countryFilter}
                    onChange={(e) => setCountryFilter(e.target.value)}
                    className="bg-background border-border text-foreground placeholder:text-muted-foreground text-sm focus:ring-primary h-9"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-foreground text-xs">City</Label>
                  <Input
                    placeholder="Filter by city"
                    value={cityFilter}
                    onChange={(e) => setCityFilter(e.target.value)}
                    className="bg-background border-border text-foreground placeholder:text-muted-foreground text-sm focus:ring-primary h-9"
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="lookingForChat"
                  checked={showOnlyLookingForChat}
                  onChange={(e) => setShowOnlyLookingForChat(e.target.checked)}
                  className="rounded border-border bg-background text-primary focus:ring-primary"
                />
                <Label htmlFor="lookingForChat" className="text-foreground text-sm">
                  Show only users actively looking for chat
                </Label>
              </div>
              
              <div className="flex justify-end">
                <Button
                  onClick={clearFilters}
                  variant="outline"
                  size="sm"
                  className="bg-background border-border text-muted-foreground hover:bg-muted"
                >
                  Clear Filters
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* User List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-muted-foreground">Loading online users...</div>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center text-muted-foreground">
              <UserIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg mb-2">No users found</p>
              <p className="text-sm">Try adjusting your filters or check back later</p>
            </div>
          </div>
        ) : (
          <div className="space-y-1">
            {filteredUsers.map((user) => (
              <div
                key={user.user_id}
                onClick={() => onUserSelect(user)}
                className="flex items-center gap-3 p-4 hover:bg-muted active:bg-secondary cursor-pointer transition-colors border-b border-border"
              >
                <div className="relative">
                
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-primary rounded-full border-2 border-background"></div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-foreground truncate text-base">{user.name}</h3>
                    <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">{getTimeAgo(user.last_seen)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    {user.city || user.country ? (
                      <span className="truncate">
                        {[user.city, user.country].filter(Boolean).join(', ')}
                      </span>
                    ) : (
                      <span>Location not specified</span>
                    )}
                    {(user as any).looking_for_chat && (
                      <Badge className="bg-primary/20 text-primary border-primary/30 text-xs">
                        Looking for chat
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Status Info */}
      <div className="p-4 text-center text-muted-foreground text-sm border-t border-border">
        <p>
          {filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''} online
          {showOnlyLookingForChat && ' and looking for chat'}
        </p>
      </div>
    </div>
  );
};

export default UserDiscovery;