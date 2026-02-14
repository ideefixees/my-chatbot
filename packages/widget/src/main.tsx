import React from 'react';
import { createRoot } from 'react-dom/client';
import { ChatWidget } from './components/ChatWidget'; // Import the component

// Define the configuration window object
declare global {
    interface Window {
        ChatbotConfig?: {
            apiUrl?: string;
            shopId?: string;
        };
    }
}

const WIDGET_ID = 'ecommerce-chatbot-widget-root';

function init() {
    if (document.getElementById(WIDGET_ID)) {
        return; // Already initialized
    }

    const rootEl = document.createElement('div');
    rootEl.id = WIDGET_ID;
    document.body.appendChild(rootEl);

    const config = window.ChatbotConfig || {};

    const root = createRoot(rootEl);
    root.render(
        <ChatWidget config={config} />
    );

    console.log('Chatbot Widget Initialized', config);
}

// Auto-init if script is loaded
if (typeof window !== 'undefined') {
    init();
}

export { init };
