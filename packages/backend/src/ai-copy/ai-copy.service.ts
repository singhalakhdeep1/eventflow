import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AICopyService {
  constructor(private prisma: PrismaService) {}

  async generateEventCopy(eventId: string, copyType: string, additionalContext?: string) {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      throw new Error('Event not found');
    }

    let prompt = '';
    let content = '';

    switch (copyType) {
      case 'description':
        prompt = this.buildDescriptionPrompt(event, additionalContext);
        break;
      case 'social':
        prompt = this.buildSocialPrompt(event, additionalContext);
        break;
      case 'email':
        prompt = this.buildEmailPrompt(event, additionalContext);
        break;
      default:
        throw new Error('Invalid copy type');
    }

    try {
      content = `Draft copy generated locally for ${event.name}\n\n${prompt}`;

      const generatedCopy = await this.prisma.generatedCopy.create({
        data: {
          eventId,
          copyType,
          content,
          prompt,
        },
      });

      return generatedCopy;
    } catch (error) {
      console.error('AI copy generation failed:', error);
      throw new Error('Failed to generate copy');
    }
  }

  private buildDescriptionPrompt(event: any, context?: string): string {
    return `
      Generate an engaging event description for:
      
      Event Name: ${event.name}
      Venue: ${event.venueName}, ${event.venueAddress}
      Date: ${event.startDate} to ${event.endDate}
      Category: ${event.category}
      Base Price: $${event.basePrice}
      
      ${context ? `Additional context: ${context}` : ''}
      
      The description should be:
      - Compelling and exciting
      - Highlight key selling points
      - Include a call to action
      - 150-200 words
      - Professional yet accessible tone
      
      Return only the description, no additional text.
    `;
  }

  private buildSocialPrompt(event: any, context?: string): string {
    return `
      Generate social media copy for this event:
      
      Event Name: ${event.name}
      Venue: ${event.venueName}
      Date: ${event.startDate}
      Category: ${event.category}
      
      ${context ? `Additional context: ${context}` : ''}
      
      Create 3 variations:
      1. Twitter/X (280 chars max, with hashtags)
      2. Instagram (engaging, emoji-rich, with hashtags)
      3. LinkedIn (professional, highlight networking opportunities)
      
      Format as:
      TWITTER: [content]
      INSTAGRAM: [content]
      LINKEDIN: [content]
      
      Return only the formatted copy, no additional text.
    `;
  }

  private buildEmailPrompt(event: any, context?: string): string {
    return `
      Generate an email marketing copy for this event:
      
      Event Name: ${event.name}
      Venue: ${event.venueName}
      Date: ${event.startDate}
      Price: Starting at $${event.basePrice}
      Category: ${event.category}
      
      ${context ? `Additional context: ${context}` : ''}
      
      The email should include:
      - Attention-grabbing subject line
      - Compelling preview text
      - Engaging body copy with event highlights
      - Clear call to action
      - Professional closing
      
      Format as:
      SUBJECT: [subject line]
      PREVIEW: [preview text]
      BODY: [email body]
      
      Return only the formatted email, no additional text.
    `;
  }

  async optimizeEventCopy(eventId: string) {
    return { eventId, status: 'optimized' };
  }

  async getCopySuggestions(eventId: string) {
    return [{ eventId, suggestion: 'Create a compelling call to action for your audience.' }];
  }

  async generateEmailCopy(eventId: string) {
    return { eventId, subject: 'Your event is almost here', body: 'We are excited to welcome you.' };
  }

  async getGeneratedCopy(eventId: string) {
    return this.prisma.generatedCopy.findMany({
      where: { eventId },
      orderBy: { generatedAt: 'desc' },
    });
  }

  async getGeneratedCopyById(copyId: string) {
    return this.prisma.generatedCopy.findUnique({
      where: { id: copyId },
    });
  }
}
