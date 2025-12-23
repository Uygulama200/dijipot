import { supabase } from './supabase'
import type { SubscriptionPlan, UserSubscription } from './supabase'

// ============================================
// PLAN MANAGEMENT
// ============================================

/**
 * Tüm planları getir
 */
export async function getAllPlans(): Promise<SubscriptionPlan[]> {
  const { data, error } = await supabase
    .from('subscription_plans')
    .select('*')
    .order('display_order', { ascending: true })

  if (error) {
    console.error('Error fetching plans:', error)
    return []
  }

  return data || []
}

/**
 * Belirli bir planı getir
 */
export async function getPlanBySlug(slug: string): Promise<SubscriptionPlan | null> {
  const { data, error } = await supabase
    .from('subscription_plans')
    .select('*')
    .eq('slug', slug)
    .single()

  if (error) {
    console.error('Error fetching plan:', error)
    return null
  }

  return data
}

// ============================================
// USER SUBSCRIPTION
// ============================================

/**
 * Kullanıcının aktif aboneliğini getir
 */
export async function getUserSubscription(userId: string): Promise<UserSubscription | null> {
  const { data, error } = await supabase
    .from('user_subscriptions')
    .select(`
      *,
      plan:subscription_plans(*)
    `)
    .eq('user_id', userId)
    .eq('status', 'active')
    .single()

  if (error) {
    console.error('Error fetching user subscription:', error)
    return null
  }

  return data
}

/**
 * Kullanıcının mevcut planını getir
 */
export async function getCurrentPlan(userId: string): Promise<SubscriptionPlan | null> {
  const subscription = await getUserSubscription(userId)
  return subscription?.plan || null
}

/**
 * Kullanıcının kalan kredisini getir
 */
export async function getRemainingCredits(userId: string): Promise<number> {
  const subscription = await getUserSubscription(userId)
  return subscription?.photo_credits_remaining || 0
}

// ============================================
// LIMIT CHECKS
// ============================================

/**
 * Yeni etkinlik oluşturabilir mi?
 */
export async function canCreateEvent(userId: string): Promise<{
  allowed: boolean
  reason?: string
  currentCount?: number
  maxEvents?: number
}> {
  const subscription = await getUserSubscription(userId)
  
  if (!subscription) {
    return { allowed: false, reason: 'Abonelik bulunamadı' }
  }

  const plan = subscription.plan as SubscriptionPlan
  
  // Sınırsız etkinlik varsa direkt izin ver
  if (!plan.max_events) {
    return { allowed: true }
  }

  // Mevcut etkinlik sayısını kontrol et
  const { count, error } = await supabase
    .from('events')
    .select('*', { count: 'exact', head: true })
    .eq('photographer_id', userId)

  if (error) {
    console.error('Error counting events:', error)
    return { allowed: false, reason: 'Kontrol hatası' }
  }

  const currentCount = count || 0

  if (currentCount >= plan.max_events) {
    return {
      allowed: false,
      reason: `Plan limitiniz doldu (${plan.max_events} etkinlik)`,
      currentCount,
      maxEvents: plan.max_events
    }
  }

  return { allowed: true, currentCount, maxEvents: plan.max_events }
}

/**
 * Fotoğraf yükleyebilir mi?
 */
export async function canUploadPhotos(userId: string, photoCount: number): Promise<{
  allowed: boolean
  reason?: string
  remainingCredits?: number
  requiredCredits?: number
}> {
  const subscription = await getUserSubscription(userId)
  
  if (!subscription) {
    return { allowed: false, reason: 'Abonelik bulunamadı' }
  }

  const remaining = subscription.photo_credits_remaining

  if (remaining < photoCount) {
    return {
      allowed: false,
      reason: `Yeterli kredi yok. Gereken: ${photoCount}, Mevcut: ${remaining}`,
      remainingCredits: remaining,
      requiredCredits: photoCount
    }
  }

  return { allowed: true, remainingCredits: remaining, requiredCredits: photoCount }
}

// ============================================
// CREDIT USAGE
// ============================================

/**
 * Fotoğraf kredisi kullan
 */
export async function usePhotoCredits(
  userId: string,
  eventId: string,
  photoCount: number
): Promise<{ success: boolean; error?: string }> {
  try {
    // RPC function ile kredi kullan
    const { data, error } = await supabase
      .rpc('use_photo_credits', {
        p_user_id: userId,
        p_event_id: eventId,
        p_credits: photoCount
      })

    if (error) {
      console.error('Error using credits:', error)
      return { success: false, error: error.message }
    }

    if (!data) {
      return { success: false, error: 'Yetersiz kredi' }
    }

    return { success: true }
  } catch (error) {
    console.error('Error using credits:', error)
    return { success: false, error: 'Kredi kullanım hatası' }
  }
}

// ============================================
// PLAN UPGRADE
// ============================================

/**
 * Plan satın al (mock - ödeme entegrasyonu sonra eklenecek)
 */
export async function purchasePlan(
  userId: string,
  planSlug: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const plan = await getPlanBySlug(planSlug)
    
    if (!plan) {
      return { success: false, error: 'Plan bulunamadı' }
    }

    // Mevcut subscription'ı güncelle veya yeni oluştur
    const { data: existing } = await supabase
      .from('user_subscriptions')
      .select('id')
      .eq('user_id', userId)
      .single()

    if (existing) {
      // Güncelle
      const { error: updateError } = await supabase
        .from('user_subscriptions')
        .update({
          plan_id: plan.id,
          photo_credits_remaining: plan.photo_credits,
          photo_credits_total: plan.photo_credits,
          purchased_at: new Date().toISOString(),
          status: 'active'
        })
        .eq('user_id', userId)

      if (updateError) {
        return { success: false, error: updateError.message }
      }
    } else {
      // Yeni oluştur
      const { error: insertError } = await supabase
        .from('user_subscriptions')
        .insert({
          user_id: userId,
          plan_id: plan.id,
          photo_credits_remaining: plan.photo_credits,
          photo_credits_total: plan.photo_credits,
          status: 'active'
        })

      if (insertError) {
        return { success: false, error: insertError.message }
      }
    }

    // Transaction kaydet (mock)
    await supabase
      .from('payment_transactions')
      .insert({
        user_id: userId,
        plan_id: plan.id,
        amount: plan.price_usd,
        currency: 'USD',
        status: 'completed',
        metadata: { note: 'Mock payment - test mode' }
      })

    return { success: true }
  } catch (error) {
    console.error('Error purchasing plan:', error)
    return { success: false, error: 'Satın alma hatası' }
  }
}
