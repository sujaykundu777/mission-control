'use server'

import {generateText} from 'ai';
import {Client, Domain} from '../types'
import { createMistral } from '@ai-sdk/mistral';
// import { createGroq } from '@ai-sdk/groq';
 
// todo need to create a config
// const groq = createGroq({
//   // custom settings
//   apiKey: GROK_KEY_GOES_HERE
// });

const mistral = createMistral({
    apiKey: 'jTKXXqp4NbUnRd2kWIuJzMoiHcUN2Vdj'
})

export async function generateClientSummary(client: Client, clientDomains: Domain[]): Promise<string> {
    try {

        console.log('client >>>', client);

        if (!client) {
            throw new Error('Client not found');
        }

        // build context about client

        const clientContext = `
            Client Name: ${client.name}
            Email: ${client.email}
            Phone: ${client.phone || 'N/A'}
            Company: ${client.company || 'N/A'}
            Industry: ${client.industry || 'N/A'}
            Website: ${client.website || 'N/A'}
            Status: ${client.status}
            Number of Associated Domains: ${clientDomains.length}
           
            ${clientDomains.length > 0 ? `Domains: ${clientDomains.map((d) => d.name).join(', ')}` : ''}
        
            ${client.notes ? `Notes: ${client.notes}` : ''}
            ${client.billingAddress ? `Billing Address: ${client.billingAddress}` : ''}
            ${client.billingEmail ? `Billing Email: ${client.billingEmail}` : ''}

        `

        const systemPrompt = ' You are a helpful business assistant. Generate a concise, professional summary of a client based on the information provided. Focus on key details, business relationship insights and notable information. Keep the summary 5-6 sentences maximum. Dont give summary title'

        const result = await generateText({
            model: mistral('mistral-tiny-latest'),
            system: systemPrompt,
            prompt: `Please generate a professional summary for the following client:\n\n${clientContext}`,
            temperature: 0.7,
            maxOutputTokens: 500
        })

        return result.text

    } catch (error) {
        console.error('Error generating client summary', error);
        throw new Error(`Failed to generate client summary: ${(error as Error).message}`)
    }
}

