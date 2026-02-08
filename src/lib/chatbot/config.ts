export const config = {
  nodeEnv: process.env.NODE_ENV || 'development',

  database: {
    url: process.env.DATABASE_URL || 'postgresql://localhost:5432/vael_support_bot',
  },

  openai: {
    apiKey: process.env.OPENAI_API_KEY || '',
  },

  crm: {
    apiKey: process.env.VAEL_CRM_API_KEY || '',
    url: process.env.VAEL_CRM_URL || 'https://vaelcreative.com/api/webhooks/chatbot',
  },

  cal: {
    apiKey: process.env.CAL_API_KEY || '',
    eventTypeId: process.env.CAL_EVENT_TYPE_ID || '',
    baseUrl: 'https://api.cal.com/v1',
  },
} as const
