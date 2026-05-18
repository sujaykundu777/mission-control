'use server'

import {generateText} from 'ai';
import {Client, Contact,  Domain} from '../types'
import { createMistral } from '@ai-sdk/mistral';
// import { createGroq } from '@ai-sdk/groq';
 
// todo need to create a config
// const groq = createGroq({
//   // custom settings
//   apiKey: GROK_KEY_GOES_HERE
// });

const mistral = createMistral({
    apiKey: process.env.MISTRAL_API_KEY
})

export async function generateContactSummary(contact: Contact, contactDomains: Domain[]): Promise<string> {
    try {

        if (!contact) {
            throw new Error('Contact not found');
        }

        // build context about contact

        const contactContext = `
            Contact Name: ${contact.name}
            Email: ${contact.email}
            Phone: ${contact.phone || 'N/A'}
            Company: ${contact.company || 'N/A'}
            Job Title: ${contact.jobTitle || 'N/A'}
            Industry: ${contact.industry || 'N/A'}
            Website: ${contact.website || 'N/A'}
            Status: ${contact.status}
            Gender: ${contact.gender}
            Relationship Type: ${contact.relationshipType}
            Number of Associated Domains: ${contactDomains.length}
           
            ${contactDomains.length > 0 ? `Domains: ${contactDomains.map((d) => d.name).join(', ')}` : ''}
        
            ${contact.notes ? `Notes: ${contact.notes}` : ''}
            ${contact.billingAddress ? `Billing Address: ${contact.billingAddress}` : ''}
            ${contact.billingEmail ? `Billing Email: ${contact.billingEmail}` : ''}

        `

        const systemPrompt = ' You are a helpful business assistant. Generate a concise, professional summary of a contact based on the information provided. Focus on key details, business relationship insights and notable information. Keep the summary 5-6 sentences maximum. Dont give summary title'

        const result = await generateText({
            model: mistral('mistral-tiny-latest'),
            system: systemPrompt,
            prompt: `Please generate a professional summary for the following contact:\n\n${contactContext}`,
            temperature: 0.7,
            maxOutputTokens: 500
        });

        return result.text

    } catch (error) {
        console.error('Error generating contact summary', error);
        throw new Error(`Failed to generate contact summary: ${(error as Error).message}`)
    }
}

