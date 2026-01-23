'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Subscription } from '@/types/database.types'

interface SubscriptionState {
  subscription: Subscription
  isPro: boolean
  isLoading: boolean
  error: string | null
}

export function useSubscription(): SubscriptionState {
  const [state, setState] = useState<SubscriptionState>({
    subscription: 'free',
    isPro: false,
    isLoading: true,
    error: null,
  })

  useEffect(() => {
    async function fetchSubscription() {
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
          setState({
            subscription: 'free',
            isPro: false,
            isLoading: false,
            error: null,
          })
          return
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: profile, error } = await (supabase as any)
          .from('profiles')
          .select('subscription')
          .eq('id', user.id)
          .single()

        if (error) {
          console.error('Error fetching subscription:', error)
          setState({
            subscription: 'free',
            isPro: false,
            isLoading: false,
            error: error.message,
          })
          return
        }

        const subscription = (profile?.subscription || 'free') as Subscription
        setState({
          subscription,
          isPro: subscription === 'pro',
          isLoading: false,
          error: null,
        })
      } catch (err) {
        console.error('Error fetching subscription:', err)
        setState({
          subscription: 'free',
          isPro: false,
          isLoading: false,
          error: err instanceof Error ? err.message : 'Unknown error',
        })
      }
    }

    fetchSubscription()
  }, [])

  return state
}
