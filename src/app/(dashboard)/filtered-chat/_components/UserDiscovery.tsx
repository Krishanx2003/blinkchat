"use client";

import { useState, useEffect } from 'react';

import { User } from '@supabase/supabase-js';
import { Search, Filter, MapPin, User as UserIcon, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

import { toast } from 'sonner';
import { OnlineUser } from '../page';
import { supabase } from '@/lib/client';
import { Badge } from '@/components/ui/badge';


interface UserDiscoveryProps {
  currentUser: User;
  onUserSelect: (user: OnlineUser) => void;
}

const UserDiscovery = ({ currentUser, onUserSelect }: UserDiscoveryProps) => {
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<OnlineUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  
  // Filter states
  const [genderFilter, setGenderFilter] = useState('');
  const [countryFilter, setCountryFilter] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadOnlineUsers();
    
    // Set user as looking for chat
    updateLookingForChat(true);

    return () => {
      updateLookingForChat(false);
    };
  }, []);

  useEffect(() => {
    applyFilters();
  }, [onlineUsers, genderFilter, countryFilter, cityFilter, searchQuery]);

  const updateLookingForChat = async (looking: boolean) => {
    try {
      await supabase
        .from('user_presence')
        .upsert({
          user_id: currentUser.id,
          is_online: true,
          looking_for_chat: looking,
          last_seen: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
    } catch (error) {
      console.error('Error updating looking for chat status:', error);
    }
  };

  const loadOnlineUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.rpc('get_available_users_for_matching');
      
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

    // Apply search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(user => 
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.country?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.city?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply specific filters
    if (genderFilter) {
      filtered = filtered.filter(user => user.gender === genderFilter);
    }
    
    if (countryFilter.trim()) {
      filtered = filtered.filter(user => 
        user.country?.toLowerCase().includes(countryFilter.toLowerCase())
      );
    }
    
    if (cityFilter.trim()) {
      filtered = filtered.filter(user => 
        user.city?.toLowerCase().includes(cityFilter.toLowerCase())
      );
    }

    setFilteredUsers(filtered);
  };

  const clearFilters = () => {
    setGenderFilter('');
    setCountryFilter('');
    setCityFilter('');
    setSearchQuery('');
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

  return (
    <div className="p-6 h-full flex flex-col">
      {/* Search and Filter Controls */}
      <div className="mb-6 space-y-4">
        <div className="flex gap-4 items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 w-4 h-4" />
            <Input
              placeholder="Search by name, username, or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white/20 border-white/30 text-white placeholder:text-white/60 focus:ring-white/50"
            />
          </div>
          <Button
            onClick={() => setShowFilters(!showFilters)}
            variant="outline"
            className="bg-white/20 border-white/30 text-white hover:bg-white/30"
          >
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>
          <Button
            onClick={loadOnlineUsers}
            className="bg-gradient-to-r from-pink-500 to-violet-500 hover:from-pink-600 hover:to-violet-600"
          >
            Refresh
          </Button>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardHeader>
              <CardTitle className="text-white">Filter Options</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-white">Gender</Label>
                  <select
                    value={genderFilter}
                    onChange={(e) => setGenderFilter(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-white/30 bg-white/20 px-3 py-2 text-white focus:ring-2 focus:ring-white/50 focus:outline-none"
                  >
                    <option value="" className="text-gray-900">Any</option>
                    <option value="male" className="text-gray-900">Male</option>
                    <option value="female" className="text-gray-900">Female</option>
                    <option value="other" className="text-gray-900">Other</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label className="text-white">Country</Label>
                  <Input
                    placeholder="Filter by country"
                    value={countryFilter}
                    onChange={(e) => setCountryFilter(e.target.value)}
                    className="bg-white/20 border-white/30 text-white placeholder:text-white/60 focus:ring-white/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-white">City</Label>
                  <Input
                    placeholder="Filter by city"
                    value={cityFilter}
                    onChange={(e) => setCityFilter(e.target.value)}
                    className="bg-white/20 border-white/30 text-white placeholder:text-white/60 focus:ring-white/50"
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <Button
                  onClick={clearFilters}
                  variant="outline"
                  className="bg-white/20 border-white/30 text-white hover:bg-white/30"
                >
                  Clear Filters
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* User List */}
      <div className="flex-1 overflow-auto">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-white/70">Loading online users...</div>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center text-white/70">
              <UserIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg mb-2">No users found</p>
              <p>Try adjusting your filters or check back later</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredUsers.map((user) => (
              <Card
                key={user.user_id}
                className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/20 transition-all cursor-pointer"
                onClick={() => onUserSelect(user)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-white text-lg">
                        {user.name}
                      </CardTitle>
                      <CardDescription className="text-white/70">
                        @{user.username}
                      </CardDescription>
                    </div>
                    <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                      Online
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-4 text-white/80 text-sm">
                    {user.age && (
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>{user.age}</span>
                      </div>
                    )}
                    {user.gender && (
                      <Badge variant="outline" className="border-white/30 text-white/80 capitalize">
                        {user.gender}
                      </Badge>
                    )}
                  </div>
                  
                  {(user.city || user.country) && (
                    <div className="flex items-center gap-1 text-white/70 text-sm">
                      <MapPin className="w-4 h-4" />
                      <span>
                        {[user.city, user.country].filter(Boolean).join(', ')}
                      </span>
                    </div>
                  )}
                  
                  <div className="text-white/60 text-xs">
                    Last seen: {getTimeAgo(user.last_seen)}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Status Info */}
      <div className="mt-4 text-center text-white/60 text-sm">
        <p>
          {filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''} available for chat
        </p>
      </div>
    </div>
  );
};

export default UserDiscovery;