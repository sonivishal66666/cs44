import { createContext, useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '../config/supabase'

export const AuthContext = createContext(undefined)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const userRef = useRef(null)

  const setCurrentUser = useCallback((val) => {
    setUser(val)
    userRef.current = val
  }, [])

  // Global Fail-Safe loading watchdog: guarantees that the loading spinner
  // can never lock the interface for more than 3.5 seconds under any circumstance.
  useEffect(() => {
    if (loading) {
      const failSafeTimer = setTimeout(() => {
        console.warn('AnswerHub Auth Fail-Safe: Loading was stuck for 3.5s. Forcefully disabling loading screen to restore interactivity.');
        setLoading(false);
      }, 3500);
      return () => clearTimeout(failSafeTimer);
    }
  }, [loading]);

  /**
   * Fetch the user profile from the users table.
   */
  const fetchUserProfile = useCallback(async (userId, authUserFallback = null) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          // Profile not found in public.users table. Attempt self-healing profile insertion.
          const authUser = authUserFallback
          if (!authUser) {
            console.error('AnswerHub Auth: No fallback auth user provided for self-healing profile.')
            return null
          }

          console.warn('AnswerHub Auth: Profile not found for user ID:', userId, '. Attempting self-healing insert...')
          const newProfile = {
            id: authUser.id,
            name: authUser.user_metadata?.name || authUser.user_metadata?.full_name || authUser.email.split('@')[0],
            email: authUser.email,
            role: 'user',
            avatar: authUser.user_metadata?.avatar_url || null
          }

          const { data: insertedData, error: insertError } = await supabase
            .from('users')
            .insert(newProfile)
            .select()
            .single()

          if (insertError) {
            console.error('AnswerHub Auth: Failed to self-heal insert user profile:', insertError.message)
            return null
          }

          console.log('AnswerHub Auth: Self-healing profile insert successful!')
          return insertedData
        }
        console.error('Error fetching user profile:', error.message)
        return undefined // Return undefined for database/network errors
      }
      return data
    } catch (err) {
      console.error('Unexpected error fetching profile:', err)
      return undefined // Return undefined for database/network errors
    }
  }, [])

  // Listen for auth state changes
  useEffect(() => {
    let mounted = true
    let subscription = null
    console.log('AnswerHub Auth: Initializing auth subscriber...')

    const initializeAuth = async () => {
      try {
        console.log('AnswerHub Auth: Bootstrapping session...')
        const {
          data: { session: initialSession },
          error
        } = await supabase.auth.getSession()

        if (error) throw error

        if (mounted) {
          setSession(initialSession)
          if (initialSession?.user) {
            console.log('AnswerHub Auth: Active session found for user:', initialSession.user.email)
            const profile = await fetchUserProfile(initialSession.user.id, initialSession.user)
            if (mounted) {
              if (profile === null) {
                console.warn('AnswerHub Auth: Initial session profile not found/creatable. Signing out.')
                await supabase.auth.signOut()
                setCurrentUser(null)
                setSession(null)
              } else if (profile === undefined) {
                console.warn('AnswerHub Auth: Network query failed during bootstrap. Using fallback profile metadata.')
                setCurrentUser({
                  id: initialSession.user.id,
                  email: initialSession.user.email,
                  name: initialSession.user.user_metadata?.name || initialSession.user.user_metadata?.full_name || initialSession.user.email.split('@')[0],
                  avatar: initialSession.user.user_metadata?.avatar_url || null,
                  role: 'user'
                })
              } else {
                setCurrentUser(profile)
              }
            }
          } else {
            console.log('AnswerHub Auth: No active session found.')
            setCurrentUser(null)
          }
        }
      } catch (err) {
        console.error('AnswerHub Auth: Error bootstrapping auth session:', err)
        if (mounted) {
          setCurrentUser(null)
          setSession(null)
        }
      } finally {
        if (mounted) {
          setLoading(false)
          console.log('AnswerHub Auth: Bootstrap complete. Loading set to false.')
        }
      }

      if (!mounted) return

      // Now subscribe to auth changes
      console.log('AnswerHub Auth: Subscribing to auth state changes...')
      try {
        const {
          data: { subscription: activeSubscription }
        } = supabase.auth.onAuthStateChange(async (event, newSession) => {
          if (!mounted) return
          console.log(`AnswerHub Auth Event: ${event}`)
          
          if (event === 'INITIAL_SESSION') {
            console.log('AnswerHub Auth: Skipping redundant INITIAL_SESSION event.')
            return
          }

          setSession(newSession)

          try {
            if (event === 'SIGNED_IN' && newSession?.user) {
              const currentUser = userRef.current
              if (!currentUser || currentUser.id !== newSession.user.id) {
                setLoading(true)
                const profile = await fetchUserProfile(newSession.user.id, newSession.user)
                if (mounted) {
                  if (profile === null) {
                    await supabase.auth.signOut()
                    setCurrentUser(null)
                    setSession(null)
                  } else if (profile === undefined) {
                    setCurrentUser({
                      id: newSession.user.id,
                      email: newSession.user.email,
                      name: newSession.user.user_metadata?.name || newSession.user.user_metadata?.full_name || newSession.user.email.split('@')[0],
                      avatar: newSession.user.user_metadata?.avatar_url || null,
                      role: 'user'
                    })
                  } else {
                    setCurrentUser(profile)
                  }
                }
              } else {
                console.log('AnswerHub Auth: SIGNED_IN event received, but user profile is already loaded. Skipping fetch.')
              }
            } else if (event === 'SIGNED_OUT') {
              if (mounted) {
                setCurrentUser(null)
                setSession(null)
              }
            } else if ((event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') && newSession?.user) {
              const profile = await fetchUserProfile(newSession.user.id, newSession.user)
              if (mounted) {
                if (profile === null) {
                  await supabase.auth.signOut()
                  setCurrentUser(null)
                  setSession(null)
                } else if (profile === undefined) {
                  // Keep current user or fallback
                } else {
                  setCurrentUser(profile)
                }
              }
            }
          } catch (err) {
            console.error('AnswerHub Auth: Error handling auth state change:', err)
          } finally {
            if (mounted) {
              setLoading(false)
            }
          }
        })

        subscription = activeSubscription
      } catch (err) {
        console.error('AnswerHub Auth: Error setting up auth state change listener:', err)
      }
    }

    initializeAuth()

    return () => {
      mounted = false
      if (subscription) {
        subscription.unsubscribe()
      }
      console.log('AnswerHub Auth: Unsubscribed from auth events.')
    }
  }, [fetchUserProfile])

  /**
   * Sign up with email and password.
   * The database trigger (handle_new_user) will auto-create the user profile.
   */
  const signUp = async (email, password, name) => {
    setLoading(true)
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          },
        },
      })

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    } finally {
      setLoading(false)
    }
  }

  /**
   * Sign in with email and password.
   */
  const signIn = async (email, password) => {
    setLoading(true)
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    } finally {
      setLoading(false)
    }
  }

  /**
   * Sign out the current user.
   */
  const signOut = async () => {
    setLoading(true)
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      setCurrentUser(null)
      setSession(null)
      return { error: null }
    } catch (error) {
      return { error }
    } finally {
      setLoading(false)
    }
  }

  /**
   * Send a password reset email.
   */
  const resetPassword = async (email) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })
      if (error) throw error
      return { error: null }
    } catch (error) {
      return { error }
    }
  }

  /**
   * Update the current user's profile in the users table.
   */
  const updateProfile = async (updates) => {
    if (!user) return { error: { message: 'Not authenticated' } }

    try {
      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single()

      if (error) throw error

      setCurrentUser(data)
      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  const isAdmin = user?.role === 'admin'

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updateProfile,
    isAdmin,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
