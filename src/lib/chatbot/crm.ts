import type { CrmLeadPayload, VisitorProfile, ChatMessage } from './types'
import { config } from './config'
import { setCrmLeadId } from './profiler'
import { signPayload } from './webhook-signing'

interface CrmResponse {
  success: boolean
  leadId?: string
  error?: string
}

export async function syncLeadToCrm(
  profile: VisitorProfile,
  conversationId?: string,
  conversationSummary?: string
): Promise<CrmResponse> {
  if (!profile.email) {
    return { success: false, error: 'Email is required to sync to CRM' }
  }

  if (!config.crm.apiKey || !config.crm.url) {
    console.warn('CRM integration not configured')
    return { success: false, error: 'CRM not configured' }
  }

  const payload: CrmLeadPayload = {
    action: profile.crmLeadId ? 'update_lead' : 'create_lead',
    data: {
      firstName: profile.firstName,
      lastName: profile.lastName,
      email: profile.email,
      companyName: profile.company,
      phone: profile.phone,
      source: 'chat_widget',
      notes: conversationSummary || 'Lead captured via chat widget',
      metadata: {
        visitorId: profile.visitorId,
        conversationId,
        interests: profile.interests,
      },
    },
  }

  try {
    const body = JSON.stringify(payload)
    const signature = signPayload(body)

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-API-Key': config.crm.apiKey,
    }
    if (signature) {
      headers['X-Webhook-Signature'] = signature
    }

    const response = await fetch(config.crm.url, {
      method: 'POST',
      headers,
      body,
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('CRM sync failed:', error)
      return { success: false, error: `CRM API error: ${response.status}` }
    }

    const data = (await response.json()) as { leadId?: string }

    // Store the CRM lead ID on the visitor profile
    if (data.leadId && !profile.crmLeadId) {
      await setCrmLeadId(profile.visitorId, data.leadId)
    }

    return { success: true, leadId: data.leadId }
  } catch (error) {
    console.error('CRM sync error:', error)
    return { success: false, error: 'Failed to connect to CRM' }
  }
}

export function generateConversationSummary(messages: ChatMessage[]): string {
  const userMessages = messages.filter((m) => m.role === 'user')

  if (userMessages.length === 0) {
    return 'No conversation content'
  }

  // Simple summary: first few user messages
  const summaryMessages = userMessages.slice(0, 5)
  const summary = summaryMessages.map((m) => `- ${m.content.substring(0, 200)}`).join('\n')

  return `Conversation topics:\n${summary}`
}

export async function shouldSyncToCrm(profile: VisitorProfile): Promise<boolean> {
  // Sync when we have at least email
  if (!profile.email) {
    return false
  }

  // Don't re-sync too frequently if already synced
  if (profile.crmLeadId && profile.updatedAt) {
    const lastUpdate = new Date(profile.updatedAt)
    const hoursSinceUpdate = (Date.now() - lastUpdate.getTime()) / (1000 * 60 * 60)
    if (hoursSinceUpdate < 1) {
      return false
    }
  }

  return true
}
