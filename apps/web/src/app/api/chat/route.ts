import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini
// Note: In production, use process.env.GEMINI_API_KEY
// Fallback to the hardcoded/env key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'AIzaSyChcmuaXnaguS1aZh7HKgYF2-5Jx1wrQOY');

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { message, shopId } = body; // shopId allows multi-tenant context (optional)

        if (!message) {
            return NextResponse.json({ error: 'Message is required' }, { status: 400 });
        }

        console.log(`Received message from shop ${shopId}: ${message}`);

        let reply = "";
        let type = 'text';
        let data: any = null;
        let suggestions = ['Track Order', 'New Arrivals', 'Contact Support'];

        const lowerMsg = message.toLowerCase();

        // 1. Check for Strict Function Calls / Tools first (High Priority)
        // Order Tracking Logic
        if (lowerMsg.includes('track') && (lowerMsg.includes('order') || /\d/.test(lowerMsg))) {
            await new Promise(resolve => setTimeout(resolve, 800)); // Simulate DB
            type = 'order_status';
            data = {
                id: 'ORDER-12345',
                status: 'In Transit',
                eta: 'Expected by Friday, Feb 7th',
                items: ['Classic T-Shirt (L)', 'Denim Jeans (32)'],
                trackingUrl: '#'
            };
            reply = "I found your order! It's currently in transit.";

            // Discount Logic
        } else if (lowerMsg.includes('discount') || lowerMsg.includes('promo') || lowerMsg.includes('coupon')) {
            type = 'discount';
            data = {
                code: 'WELCOME20',
                amount: '20% OFF',
                minOrder: 50
            };
            reply = "You're in luck! Here is a discount code for your next purchase.";

            // 2. Fallback to Gemini for Natural Language
        } else {
            try {
                // Setup the model
                const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

                // Context Prompt
                const context = `
                You are a helpful ecommerce support assistant called "ShopBot".
                Your goal is to help customers find products, answer shipping questions, and be friendly.
                Do not make up fake order statuses. If asked about an order without an ID, ask for the ID.
                Current Store Context: Generic Ecommerce Store.
                User Message: ${message}
                `;

                const result = await model.generateContent(context);
                const response = await result.response;
                reply = response.text();
            } catch (aiError) {
                console.error("Gemini API Error:", aiError);
                reply = "I'm having trouble thinking right now. Could you rephrase that? (AI Error)";
            }
        }

        return NextResponse.json({
            reply,
            type,
            data,
            suggestions
        }, {
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            }
        });

    } catch (error) {
        console.error('Error processing chat:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            {
                status: 500,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
                }
            }
        );
    }
}

export async function OPTIONS() {
    return NextResponse.json({}, {
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        }
    });
}
