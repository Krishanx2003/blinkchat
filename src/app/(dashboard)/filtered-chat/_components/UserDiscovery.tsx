"use client";

import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { Search, Filter, User as UserIcon, MapPin, Clock, Users, X, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { supabase } from '@/lib/client';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';

// Updated OnlineUser interface to match the main page interface
interface OnlineUser {
  user_id: string;
  name: string;
  username: string;
  gender: string;
  age: number;
  country: string;
  city: string;
  is_online: boolean;
  looking_for_chat: boolean;
  last_seen: string;
  updated_at?: string;
}

interface UserDiscoveryProps {
  currentUser: User;
  onUserSelect: (user: OnlineUser) => Promise<void>;
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
  const [selectedUser, setSelectedUser] = useState<OnlineUser | null>(null);

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
        const typedData: OnlineUser[] = (data || []).map((user: any) => ({
          user_id: user.user_id,
          name: user.name || 'Unknown',
          username: user.username || 'unknown',
          gender: user.gender || 'not specified',
          age: user.age || 0,
          country: user.country || 'Unknown',
          city: user.city || 'Unknown',
          is_online: Boolean(user.is_online),
          looking_for_chat: Boolean(user.looking_for_chat),
          last_seen: user.last_seen || new Date().toISOString(),
          updated_at: user.updated_at
        }));
        setOnlineUsers(typedData);
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
        user.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.city.toLowerCase().includes(searchQuery.toLowerCase())
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

  const hasActiveFilters = genderFilter || countryFilter || cityFilter || showOnlyLookingForChat;

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

  const getAvatarColor = (name: string) => {
    const colors = [
      'from-violet-500 to-purple-600',
      'from-blue-500 to-cyan-500',
      'from-emerald-500 to-teal-600',
      'from-amber-500 to-orange-500',
      'from-rose-500 to-pink-600',
      'from-indigo-500 to-blue-600',
      'from-teal-500 to-emerald-600',
      'from-purple-500 to-violet-600'
    ];
    const index = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
    return colors[index];
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Header with Search & Filters */}
      <div className="sticky top-0 z-10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-700/50">
        {/* Search Bar */}
        <div className="p-4 pb-3">
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-slate-400 group-focus-within:text-violet-500 transition-colors" />
            </div>
            <input
              type="text"
              placeholder="Search by name, location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-10 pr-12 py-3 text-sm bg-slate-100/70 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-2xl placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 dark:focus:border-violet-400 transition-all duration-200 text-slate-900 dark:text-slate-100"
            />
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`absolute inset-y-0 right-0 pr-3 flex items-center transition-all duration-200 ${
                showFilters || hasActiveFilters
                  ? 'text-violet-600 dark:text-violet-400' 
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
              }`}
            >
              <div className="relative">
                <Filter className="h-4 w-4" />
                {hasActiveFilters && (
                  <div className="absolute -top-1 -right-1 h-2 w-2 bg-violet-500 rounded-full animate-pulse" />
                )}
              </div>
            </button>
          </div>
        </div>

        {/* Filter Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
              className="overflow-hidden border-t border-slate-200/50 dark:border-slate-700/50"
            >
              <div className="p-4 bg-slate-50/50 dark:bg-slate-800/30">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-medium text-slate-700 dark:text-slate-300">Gender</Label>
                    <div className="relative">
                      <select
                        value={genderFilter}
                        onChange={(e) => setGenderFilter(e.target.value)}
                        className="w-full appearance-none bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all"
                      >
                        <option value="">Any gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-xs font-medium text-slate-700 dark:text-slate-300">Country</Label>
                    <input
                      type="text"
                      placeholder="Any country"
                      value={countryFilter}
                      onChange={(e) => setCountryFilter(e.target.value)}
                      className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex items-center space-x-3 cursor-pointer group">
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={showOnlyLookingForChat}
                        onChange={(e) => setShowOnlyLookingForChat(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-gradient-to-r peer-checked:from-violet-500 peer-checked:to-purple-600 after:shadow-sm"></div>
                    </div>
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-slate-100 transition-colors">
                      Looking to chat only
                    </span>
                  </label>
                  
                  {hasActiveFilters && (
                    <Button
                      onClick={clearFilters}
                      variant="ghost"
                      size="sm"
                      className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 h-8 px-3"
                    >
                      <X className="h-3 w-3 mr-1" />
                      Clear
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Online Status Bar */}
        <div className="px-4 py-3 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 border-t border-slate-200/50 dark:border-slate-700/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                <Users className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
                {filteredUsers.length} {filteredUsers.length === 1 ? 'person' : 'people'} online
              </span>
            </div>
            {searchQuery && (
              <Badge variant="secondary" className="bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 text-xs">
                "{searchQuery}"
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* User List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 space-y-4">
            <div className="relative">
              <div className="w-12 h-12 border-4 border-violet-200 dark:border-violet-800 border-t-violet-600 dark:border-t-violet-400 rounded-full animate-spin"></div>
              <div className="absolute inset-0 w-12 h-12 border-4 border-transparent border-t-violet-400 dark:border-t-violet-300 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Discovering people</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Finding amazing conversations...</p>
            </div>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 p-6 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 rounded-2xl flex items-center justify-center mb-4">
              <UserIcon className="w-8 h-8 text-slate-400 dark:text-slate-500" />
            </div>
            <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200 mb-2">No one here yet</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs">
              {searchQuery || hasActiveFilters 
                ? "Try adjusting your search or filters to find more people"
                : "Be the first to start conversations when others come online"
              }
            </p>
          </div>
        ) : (
          <div className="p-3 space-y-2">
            <AnimatePresence mode="popLayout">
              {filteredUsers.map((user, index) => (
                <motion.div
                  key={user.user_id}
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.95 }}
                  transition={{ 
                    duration: 0.3, 
                    delay: index * 0.05,
                    ease: [0.25, 0.1, 0.25, 1]
                  }}
                  layout
                >
                  <button
                    onClick={() => {
                      setSelectedUser(user);
                      onUserSelect(user);
                    }}
                    className={`w-full p-4 rounded-2xl transition-all duration-300 group relative overflow-hidden ${
                      selectedUser?.user_id === user.user_id
                        ? 'bg-gradient-to-r from-violet-500 via-purple-500 to-indigo-500 text-white shadow-2xl shadow-violet-500/25 scale-[1.02]'
                        : 'bg-white/80 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 hover:border-violet-200 dark:hover:border-violet-700 hover:shadow-lg hover:shadow-slate-200/50 dark:hover:shadow-slate-900/50 hover:scale-[1.01]'
                    }`}
                  >
                    {/* Background decoration for selected user */}
                    {selectedUser?.user_id === user.user_id && (
                      <div className="absolute inset-0 bg-gradient-to-r from-white/10 via-transparent to-white/10 opacity-50"></div>
                    )}
                    
                    <div className="flex items-center gap-4 relative z-10">
                      {/* Avatar */}
                      <div className="relative flex-shrink-0">
                        <div 
                          className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-lg transition-all duration-300 ${
                            selectedUser?.user_id === user.user_id 
                              ? 'bg-white/20 shadow-xl' 
                              : `bg-gradient-to-br ${getAvatarColor(user.name)} group-hover:shadow-xl group-hover:scale-110`
                          }`}
                        >
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        
                        {/* Online status indicator */}
                        {user.is_online && (
                          <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 ${
                            selectedUser?.user_id === user.user_id 
                              ? 'border-white bg-green-400' 
                              : 'border-white dark:border-slate-800 bg-green-500'
                          } animate-pulse`}>
                          </div>
                        )}
                      </div>
                      
                      {/* User Info */}
                      <div className="flex-1 text-left min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className={`font-semibold text-base truncate ${
                            selectedUser?.user_id === user.user_id 
                              ? 'text-white' 
                              : 'text-slate-900 dark:text-slate-100'
                          }`}>
                            {user.name}
                          </h3>
                          {user.age > 0 && (
                            <span className={`text-xs px-2 py-1 rounded-lg font-medium ${
                              selectedUser?.user_id === user.user_id
                                ? 'bg-white/20 text-white'
                                : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                            }`}>
                              {user.age}
                            </span>
                          )}
                        </div>
                        
                        {/* Location */}
                        <div className="flex items-center gap-1 mb-2">
                          <MapPin className={`h-3 w-3 ${
                            selectedUser?.user_id === user.user_id 
                              ? 'text-white/70' 
                              : 'text-slate-500 dark:text-slate-400'
                          }`} />
                          <span className={`text-xs truncate ${
                            selectedUser?.user_id === user.user_id 
                              ? 'text-white/80' 
                              : 'text-slate-600 dark:text-slate-400'
                          }`}>
                            {getCountryFlag(user.country)} {user.city}, {user.country}
                          </span>
                        </div>
                        
                        {/* Status badges */}
                        <div className="flex items-center gap-2">
                          {user.looking_for_chat && (
                            <span className={`inline-flex items-center text-xs font-medium px-2 py-1 rounded-full ${
                              selectedUser?.user_id === user.user_id 
                                ? 'bg-white/20 text-white' 
                                : 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                            }`}>
                              <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 animate-pulse"></span>
                              Ready to chat
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {/* Last seen */}
                      <div className="flex-shrink-0 text-right">
                        <div className="flex items-center gap-1 mb-1">
                          <Clock className={`h-3 w-3 ${
                            selectedUser?.user_id === user.user_id 
                              ? 'text-white/60' 
                              : 'text-slate-400'
                          }`} />
                          <span className={`text-xs ${
                            selectedUser?.user_id === user.user_id 
                              ? 'text-white/80' 
                              : 'text-slate-500 dark:text-slate-400'
                          }`}>
                            {getTimeAgo(user.last_seen)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDiscovery;