"use client";

import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { Search, Filter, User as UserIcon } from 'lucide-react';
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

  const getCountryFlag = (country: string) => {
    // Simple country to flag mapping - you can expand this
    const flagMap: { [key: string]: string } = {
      'United States': '🇺🇸',
      'Canada': '🇨🇦',
      'United Kingdom': '🇬🇧',
      'Germany': '🇩🇪',
      'France': '🇫🇷',
      'India': '🇮🇳',
      'China': '🇨🇳',
      'Japan': '🇯🇵',
      'Brazil': '🇧🇷',
      'Australia': '🇦🇺'
    };
    return flagMap[country] || '🌍';
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Search */}
      <div className="p-4 border-b border-gray-100">
        <div className="relative mb-4">
          <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search or start new chat"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:bg-white transition-all duration-200"
          />
        </div>

        {/* Filter Controls */}
        <div className="flex gap-2 items-center mb-4">
          <Button
            onClick={() => setShowFilters(!showFilters)}
            variant="outline"
            size="sm"
            className="text-gray-600 border-gray-200 hover:bg-gray-50 bg-white"
          >
            <Filter className="w-4 h-4 mr-2" />
            {showFilters ? 'Hide Filters' : 'Filters'}
          </Button>
          <Button
            onClick={loadOnlineUsers}
            variant="outline"
            size="sm"
            className="text-gray-600 border-gray-200 hover:bg-gray-50 bg-white"
          >
            Refresh
          </Button>
          <div className="ml-auto text-xs text-gray-500 font-medium">
            {filteredUsers.length} online
          </div>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <Card className="bg-gray-50 border-gray-200 mb-4">
            <CardHeader className="pb-3">
              <CardTitle className="text-gray-900 text-sm font-semibold">Filter Options</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-gray-700 text-xs font-medium">Gender</Label>
                  <select
                    value={genderFilter}
                    onChange={(e) => setGenderFilter(e.target.value)}
                    className="flex h-9 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-gray-900 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all duration-200"
                  >
                    <option value="">Any</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-700 text-xs font-medium">Country</Label>
                  <Input
                    placeholder="Filter by country"
                    value={countryFilter}
                    onChange={(e) => setCountryFilter(e.target.value)}
                    className="bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 text-sm focus:ring-blue-500 h-9 transition-all duration-200"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-700 text-xs font-medium">City</Label>
                  <Input
                    placeholder="Filter by city"
                    value={cityFilter}
                    onChange={(e) => setCityFilter(e.target.value)}
                    className="bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 text-sm focus:ring-blue-500 h-9 transition-all duration-200"
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="lookingForChat"
                  checked={showOnlyLookingForChat}
                  onChange={(e) => setShowOnlyLookingForChat(e.target.checked)}
                  className="rounded border-gray-300 bg-white text-blue-500 focus:ring-blue-500"
                />
                <Label htmlFor="lookingForChat" className="text-gray-700 text-sm">
                  Show only users actively looking for chat
                </Label>
              </div>
              
              <div className="flex justify-end">
                <Button
                  onClick={clearFilters}
                  variant="outline"
                  size="sm"
                  className="bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
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
            <div className="text-gray-500">Loading online users...</div>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center text-gray-500">
              <UserIcon className="w-12 h-12 mx-auto mb-4 opacity-40" />
              <p className="text-lg mb-2 font-medium">No users found</p>
              <p className="text-sm">Try adjusting your filters or check back later</p>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredUsers.map((user) => (
              <div
                key={user.user_id}
                onClick={() => onUserSelect(user)}
                className="flex items-center gap-3 p-4 hover:bg-gray-50 active:bg-gray-100 cursor-pointer transition-all duration-200"
              >
                <div className="relative">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold text-gray-900 truncate text-base">{user.name}</h3>
                      <span className="text-lg">{getCountryFlag(user.country)}</span>
                    </div>
                    <span className="text-xs text-gray-400 whitespace-nowrap ml-2 font-medium">
                      {getTimeAgo(user.last_seen)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-500 truncate">
                      {user.city || user.country ? (
                        [user.city, user.country].filter(Boolean).join(', ')
                      ) : (
                        '@' + user.username
                      )}
                    </p>

                  </div>
                 
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDiscovery;