// src/context/AuthContext.tsx
import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import type { User as SupabaseUser, Session } from '@supabase/supabase-js';

// User type matching our User interface
export interface User {
  id: string;
  fullName: string;
  email: string;
  role: string;
  organisation?: string;
  phoneNumber?: string;
  position?: string;
}

const AuthContext = createContext<{
  isAuthenticated: boolean;
  user: User | null;
  session: Session | null;
  login: (email: string, password: string) => Promise<void>;
  register: (formData: any) => Promise<{ requiresEmailConfirmation: boolean; email?: string }>;
  logout: () => Promise<void>;
  loading: boolean;
} | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state and listen for changes
  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        loadUserProfile(session.user.id);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        if (session?.user) {
          await loadUserProfile(session.user.id);
        } else {
          setUser(null);
          setIsAuthenticated(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // Load user profile from user_profiles table
  const loadUserProfile = async (userId: string) => {
    try {
      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        // PGRST116 = no rows found (profile doesn't exist)
        if (error.code === 'PGRST116') {
          console.log('User profile not found, creating from auth metadata...');
          // If profile doesn't exist, try to create one from auth user metadata
          const { data: { user: authUser } } = await supabase.auth.getUser();
          if (authUser) {
            // Use upsert to handle race conditions
            const { error: createError } = await supabase
              .from('user_profiles')
              .upsert({
                id: authUser.id,
                full_name: authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'User',
                email: authUser.email || '',
                organisation: authUser.user_metadata?.organisation || null,
                phone_number: authUser.user_metadata?.phone_number || null,
                position: authUser.user_metadata?.position || null,
                role: 'user',
              }, {
                onConflict: 'id'
              });

            if (createError) {
              // If it's a duplicate key error, profile was created by another request
              if (createError.code === '23505' || createError.code === 'PGRST301') {
                console.log('Profile was created by another request, reloading...');
                // Retry loading the profile
                await loadUserProfile(userId);
                return;
              }
              console.error('Failed to create profile from metadata:', createError);
              // Fallback: use auth user data directly
              setUser({
                id: authUser.id,
                fullName: authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'User',
                email: authUser.email || '',
                role: 'user',
              });
            } else {
              // Profile created, reload it
              await loadUserProfile(userId);
              return;
            }
          }
        } else {
          console.error('Error loading user profile:', error);
          // For other errors, use auth user as fallback
          const { data: { user: authUser } } = await supabase.auth.getUser();
          if (authUser) {
            setUser({
              id: authUser.id,
              fullName: authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'User',
              email: authUser.email || '',
              role: 'user',
            });
          }
        }
        setIsAuthenticated(true);
        return;
      }

      if (profile) {
        setUser({
          id: profile.id,
          fullName: profile.full_name,
          email: profile.email,
          role: profile.role || 'user',
          organisation: profile.organisation || undefined,
          phoneNumber: profile.phone_number || undefined,
          position: profile.position || undefined,
        });
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
      // Fallback to auth user
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (authUser) {
        setUser({
          id: authUser.id,
          fullName: authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'User',
          email: authUser.email || '',
          role: 'user',
        });
        setIsAuthenticated(true);
      }
    }
  };

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.toLowerCase().trim(),
        password,
      });

      if (error) throw error;

      if (data.user && data.session) {
        // Load user profile with retry logic (same as registration)
        let profileLoaded = false;
        let retries = 0;
        const maxRetries = 5;
        
        while (!profileLoaded && retries < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 200 * (retries + 1)));
          
          try {
            const { data: profile, error: profileError } = await supabase
              .from('user_profiles')
              .select('*')
              .eq('id', data.user.id)
              .single();
            
            if (!profileError && profile) {
              // Profile exists, load it
              await loadUserProfile(data.user.id);
              profileLoaded = true;
              break;
            } else if (profileError?.code === 'PGRST116') {
              // Profile doesn't exist, retry
              retries++;
              console.log(`Profile not found during login, retrying... (${retries}/${maxRetries})`);
            } else {
              // Other error, break and use fallback
              console.error('Error checking profile during login:', profileError);
              break;
            }
          } catch (err) {
            console.error('Error loading profile during login:', err);
            break;
          }
        }
        
        // If profile still not loaded, use auth metadata as fallback
        if (!profileLoaded) {
          console.warn('Profile not loaded after retries during login, using auth metadata');
          const { data: { user: authUser } } = await supabase.auth.getUser();
          if (authUser) {
            setUser({
              id: authUser.id,
              fullName: authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'User',
              email: authUser.email || '',
              role: 'user',
              organisation: authUser.user_metadata?.organisation || undefined,
              phoneNumber: authUser.user_metadata?.phone_number || undefined,
              position: authUser.user_metadata?.position || undefined,
            });
            setIsAuthenticated(true);
          }
        }
      }
    } catch (error: any) {
      console.error('Login error:', error);
      throw new Error(error.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const register = async (formData: any) => {
    setLoading(true);
    try {
      const { fullName, email, password, organisation, phoneNumber, position } = formData;

      // Sign up with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email.toLowerCase().trim(),
        password,
        options: {
          data: {
            full_name: fullName,
            organisation,
            phone_number: phoneNumber,
            position,
          },
          emailRedirectTo: `${window.location.origin}/dashboard` // Redirect after email confirmation
        }
      });

      if (authError) throw authError;

      if (!authData.user) {
        throw new Error('Registration failed - no user created');
      }

      // Check if email confirmation is required
      // If session is null, user needs to confirm email first
      if (!authData.session) {
        // Email confirmation required - return special flag
        return { requiresEmailConfirmation: true, email: email.toLowerCase().trim() };
      }

      // Profile is now automatically created by database trigger
      // Wait for the trigger to execute, then load the profile
      // Retry loading profile with exponential backoff in case trigger hasn't finished
      if (authData.user && authData.session) {
        let profileLoaded = false;
        let retries = 0;
        const maxRetries = 5;
        
        while (!profileLoaded && retries < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 300 * (retries + 1)));
          
          try {
            const { data: profile, error } = await supabase
              .from('user_profiles')
              .select('*')
              .eq('id', authData.user.id)
              .single();
            
            if (!error && profile) {
              // Profile exists, load it and wait for it to complete
              await loadUserProfile(authData.user.id);
              profileLoaded = true;
              break;
            } else if (error?.code === 'PGRST116') {
              // Profile doesn't exist yet, retry
              retries++;
              console.log(`Profile not found, retrying... (${retries}/${maxRetries})`);
            } else {
              // Other error, break and use fallback
              console.error('Error checking profile:', error);
              break;
            }
          } catch (err) {
            console.error('Error loading profile:', err);
            break;
          }
        }
        
        // If profile still not loaded after retries, use auth metadata as fallback
        if (!profileLoaded) {
          console.warn('Profile not loaded after retries, using auth metadata');
          const { data: { user: authUser } } = await supabase.auth.getUser();
          if (authUser) {
            setUser({
              id: authUser.id,
              fullName: authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'User',
              email: authUser.email || '',
              role: 'user',
              organisation: authUser.user_metadata?.organisation || undefined,
              phoneNumber: authUser.user_metadata?.phone_number || undefined,
              position: authUser.user_metadata?.position || undefined,
            });
            setIsAuthenticated(true);
          }
        }
      }

      return { requiresEmailConfirmation: false };
    } catch (error: any) {
      console.error('Registration error:', error);
      throw new Error(error.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        session,
        login,
        register,
        logout,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};