import { createContext } from 'react'
import { Currency } from '../currency'

export interface CurrencyContextType {
    currency: Currency
    setCurrency: (currency: Currency) => void
}

export const CurrencyContext = createContext<CurrencyContextType>({
    currency: 'INR',
    setCurrency: () => {}
})