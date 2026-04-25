import { Client } from '@/lib/types'

export const TEST_CLIENT: Client = {
    id: 'test-client-1',
    name: 'Ethnic Trousseau',
    email: 'info@ethnictrousseau.com',
    phone: '+91 8368751211',
    company: 'Ethnic Trousseau',
    industry: 'Designer Boutique',
    website: 'https://ethnictrousseau.com',
    billingAddress: '#87/1 K.S.R.P Road, Meenakshi Layout, Parappana, Agrahara (Naganthapura), Bangalore',
    billingEmail: 'info@ethnictrousseau.com',
    billingPhone: '+91 8368751211',
    status: 'active',
    customFields: [
        {
            key: 'timezone',
            value: 'GMT +5.30',
        },
        {
            key: 'currency',
            value: 'Rupees'
        }
    ],
    notes: 'A Fashion Designer Boutique in Bangalore',
    createdAt: 'March 16, 2026',
    updatedAt: 'March 16, 2026'
}
