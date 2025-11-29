import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { logger } from '@/lib/logger'

// Log application initialization
logger.info('main', 'Application initializing...')

const startTime = performance.now()

try {
    const rootElement = document.getElementById('root')

    if (!rootElement) {
        logger.error('main', 'Root element not found in DOM')
        throw new Error('Root element not found')
    }

    logger.debug('main', 'Root element found, creating React root')

    ReactDOM.createRoot(rootElement).render(
        <React.StrictMode>
            <App />
        </React.StrictMode>,
    )

    const initTime = performance.now() - startTime
    logger.performance('main', 'Application initialization', initTime)
    logger.info('main', 'Application successfully mounted')
} catch (error) {
    logger.error('main', 'Failed to initialize application', error)
    throw error
}
