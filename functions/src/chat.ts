import * as functions from 'firebase-functions';
import { callGroqChatAPI } from './utils/groq';
import { checkRateLimit } from './utils/rateLimit';

interface ChatRequest {
  messages?: Array<{ role: 'user' | 'assistant' | 'model'; content?: string; text?: string }>;
  message?: string;
  history?: Array<{ role: 'user' | 'model' | 'assistant'; text?: string; content?: string }>;
}

interface ChatResponse {
  success: boolean;
  message: string;
  role: 'assistant';
}

/**
 * Chat với AI - Chuyên về content creator với khả năng suggest tools
 * Supports both authenticated and public (unauthenticated) chat
 */
export const chat = functions.https.onCall(
  async (data: ChatRequest, context: functions.https.CallableContext): Promise<ChatResponse> => {
    // Support both authenticated and public chat
    const userId = context.auth?.uid;
    
    // Rate limiting (only for authenticated users)
    if (userId) {
      await checkRateLimit(userId);
    }

    // Support both formats: { messages: [...] } and { message: string, history: [...] }
    let messages = data.messages;
    const { message, history } = data;

    // If using old format (message + history), convert to messages array
    if (!messages && message) {
      messages = [];
      
      // Add history messages if provided
      if (history && Array.isArray(history)) {
        history.forEach(h => {
          // Convert old format { role: 'user'|'model', text: string } to { role: 'user'|'assistant', content: string }
          if (h.role && (h.text || h.content)) {
            const role = h.role === 'model' ? 'assistant' : h.role;
            messages!.push({ role, content: h.text || h.content });
          }
        });
      }
      
      // Add current message
      messages.push({ role: 'user', content: message });
    }

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Messages array or message string is required'
      );
    }

    // Validate and normalize messages format
    const validMessages = messages
      .filter(msg => {
        // Support both { role, content } and { role, text } formats
        if (msg.role && (msg.role === 'user' || msg.role === 'assistant' || msg.role === 'model')) {
          return msg.content || msg.text;
        }
        return false;
      })
      .map(msg => {
        // Normalize to { role, content } format
        const role = msg.role === 'model' ? 'assistant' : msg.role;
        const content = msg.content || msg.text || '';
        return { role, content };
      });

    if (validMessages.length === 0) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Valid messages are required'
      );
    }

    console.log(`💬 Chat: Processing ${validMessages.length} messages${userId ? ` (user: ${userId})` : ' (public)'}...`);

    try {
      // System prompt for CreatorAI Concierge - Updated with all 12 tools
      const systemPrompt = `You are CreatorAI Concierge, an expert content creation assistant specialized in helping users leverage the CreatorAI platform's 12 powerful tools. Your role is to:

1. UNDERSTAND USER NEEDS: Analyze what the user wants to create and suggest the BEST tool(s) for their task.

2. TOOL RECOMMENDATIONS: You have access to these 12 specialized tools:
   - **The Editorial (t1)**: For SEO-optimized blog posts and long-form articles (800+ words). Use when user needs articles, thought leadership, or in-depth content.
   - **Visual Studio (t2)**: For generating high-quality images using AI. Use when user needs images for ads, banners, social media, or any visual content.
   - **Social Architect (t3)**: For Instagram/LinkedIn captions with viral hooks and 30+ hashtags. Use when user needs social media captions.
   - **Video Scripter (t4)**: For time-coded video scripts (Reels/TikTok/YouTube Shorts under 60s). Use when user needs video scripts with scene directions.
   - **Content Polisher (t5)**: For editing, refining, or repurposing existing content. Use when user has content that needs improvement, grammar fix, or tone change.
   - **Strategy Engine (t6)**: For 30-day content calendars and content strategy. Use when user needs planning, calendars, or strategic content frameworks.
   - **Headline Hero (t7)**: For creating multiple headline variations (SEO + Viral hooks). Use when user needs catchy headlines or titles.
   - **Niche Explorer (t8)**: For niche research, content ideas, and trend analysis. Use when user needs content ideas or market research.
   - **Thumbnail Artist (t9)**: For creating eye-catching YouTube/social thumbnails with high CTR. Use when user needs thumbnail images.
   - **Content Multiplier (t10)**: For repurposing one piece of content into multiple formats (blog→tweets, emails, scripts, LinkedIn posts). Use when user needs to adapt content across platforms.
   - **Content Auditor (t11)**: For analyzing and scoring existing content (SEO, engagement, tone). Use when user needs content analysis or improvement suggestions.
   - **Outreach Oracle (t12)**: For cold emails, LinkedIn messages, and outreach campaigns. Use when user needs sales/outreach content.

3. PROMPT SUGGESTIONS: When suggesting a tool, provide a specific, actionable prompt example the user can use with that tool.

4. CONTENT STRATEGY: Help users plan their content strategy, understand which tools work best together, and optimize their content creation workflow.

5. ANSWER QUESTIONS: Answer any questions about the website, pricing, features, or how to use the tools.

IMPORTANT RULES:
- ALWAYS suggest specific tools when relevant (mention tool name and ID like "The Editorial (t1)")
- Provide actionable, practical advice
- When user asks "what tool should I use?", analyze their need and recommend the best tool(s)
- If user wants to create something, suggest the tool AND provide a prompt example
- Respond ONLY in the same language as the user. If the user writes in Vietnamese, respond entirely in Vietnamese (do not switch to English). If the user writes in English, respond entirely in English. Never mix languages in one response.
- Stay focused on content creation topics
- Be conversational, helpful, and encouraging

FORMAT FOR TOOL SUGGESTIONS:
When suggesting a tool, use this format:
"Based on your need, I recommend using **[Tool Name]** (tool ID: tX). Here's a prompt you can use:
[Specific prompt example]

This tool will help you [specific benefit]."

Remember: You are the bridge between user needs and CreatorAI's powerful tools. Help users discover and use the right tools effectively.`;

      // Prepare messages with system prompt
      const chatMessages = [
        {
          role: 'system' as const,
          content: systemPrompt
        },
        ...validMessages
      ];

      // Call Groq API for chat
      const response = await callGroqChatAPI(chatMessages, {
        model: 'llama-3.3-70b-versatile',
        temperature: 0.7,
        max_tokens: 2000
      });

      console.log(`✅ Chat: Response generated (${response.length} characters)`);

      return {
        success: true,
        message: response,
        role: 'assistant' as const
      };

    } catch (error: any) {
      console.error('❌ Chat Error:', error);
      
      // Handle specific errors
      if (error.message?.includes('API key') || error.message?.includes('401')) {
        throw new functions.https.HttpsError(
          'internal',
          'Invalid Groq API key. Please check configuration.'
        );
      } else if (error.message?.includes('rate limit') || error.message?.includes('429')) {
        throw new functions.https.HttpsError(
          'resource-exhausted',
          'Rate limit exceeded. Please try again in a moment.'
        );
      } else {
        throw new functions.https.HttpsError(
          'internal',
          `Failed to get chat response: ${error.message || 'Unknown error'}`
        );
      }
    }
  }
);

