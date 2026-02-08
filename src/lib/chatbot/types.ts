// Message types
export interface ChatMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: number
  metadata?: {
    profileData?: Partial<VisitorProfile>
    intent?: string
    sources?: string[]
  }
}

// Visitor tracking
export interface VisitorProfile {
  visitorId: string // Cookie-based UUID
  email?: string
  firstName?: string
  lastName?: string
  company?: string
  phone?: string
  interests: string[]
  pageHistory: string[]
  crmLeadId?: string // Once synced to CRM
  createdAt?: Date
  updatedAt?: Date
}

// Conversation
export interface Conversation {
  id: string
  visitorId: string
  messages: ChatMessage[]
  createdAt: Date
  updatedAt: Date
  metadata?: Record<string, unknown>
}

// API contracts
export interface ChatRequest {
  visitorId: string
  message: string
  conversationId?: string
  currentPage?: string
}

export interface ChatResponse {
  conversationId: string
  message: ChatMessage
  profileUpdates?: Partial<VisitorProfile>
}

// Visitor API
export interface VisitorCreateRequest {
  visitorId: string
  currentPage?: string
}

export interface VisitorUpdateRequest {
  email?: string
  firstName?: string
  lastName?: string
  company?: string
  phone?: string
  interests?: string[]
  pageHistory?: string[]
}

// Scheduling
export interface ScheduleRequest {
  visitorId: string
  conversationId: string
  email: string
  name: string
  preferredDate?: string
  notes?: string
}

export interface ScheduleResponse {
  success: boolean
  bookingId?: string
  bookingUrl?: string
  error?: string
}

// CRM Integration
export interface CrmLeadPayload {
  action: 'create_lead' | 'update_lead'
  data: {
    firstName?: string
    lastName?: string
    email: string
    companyName?: string
    phone?: string
    source: 'chat_widget'
    notes?: string
    metadata?: {
      visitorId: string
      conversationId?: string
      interests?: string[]
    }
  }
}

// Knowledge Base
export interface KnowledgeChunk {
  id: string
  source: 'faq' | 'website' | 'services' | 'process' | 'pricing'
  title?: string
  content: string
  metadata?: Record<string, unknown>
}

// Widget Configuration
export interface WidgetConfig {
  apiUrl: string
  position?: 'bottom-right' | 'bottom-left'
  primaryColor?: string
  greeting?: string
  placeholder?: string
}
