import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import WooCommerceRestApi from "@woocommerce/woocommerce-rest-api";

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'AIzaSyChcmuaXnaguS1aZh7HKgYF2-5Jx1wrQOY');

// Initialize WooCommerce
// Hardcoded fallbacks because .env.local has permission issues in this environment
const woo = new WooCommerceRestApi({
    url: process.env.WOO_SITE_URL || 'https://plantaviva.in',
    consumerKey: process.env.WOO_CONSUMER_KEY || 'ck_57be6b725f0a1028a17467f9d1c776a75bd33aa1',
    consumerSecret: process.env.WOO_CONSUMER_SECRET || 'cs_2b2cdec7d2ccf9db383c34e8e12afc040619b357',
    version: 'wc/v3',
    queryStringAuth: true
} as any);

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { message, shopId } = body;

        if (!message) {
            return NextResponse.json({ error: 'Message is required' }, { status: 400 });
        }

        console.log(`Received message: ${message}`);

        let reply = "";
        let type = 'text';
        let data: any = null;
        let suggestions = ['Track Order', 'New Arrivals', 'Contact Support'];

        const lowerMsg = message.toLowerCase();

        // 1. ORDER TRACKING (WooCommerce)
        if (lowerMsg.includes('track') && (lowerMsg.includes('order') || /\d/.test(lowerMsg))) {
            const orderIdMatch = lowerMsg.match(/\d+/);
            if (orderIdMatch) {
                const orderId = orderIdMatch[0];
                try {
                    const response = await woo.get(`orders/${orderId}`);
                    if (response.status === 200) {
                        const order = response.data;
                        type = 'order_status';
                        data = {
                            id: order.id,
                            status: order.status,
                            eta: 'Check email for updates',
                            items: order.line_items.map((i: any) => `${i.name} (x${i.quantity})`),
                            trackingUrl: '#'
                        };
                        reply = `Found order #${order.id}. it is currently ${order.status}.`;
                    } else {
                        reply = `I couldn't find order #${orderId}. Please check the number.`;
                    }
                } catch (e: any) {
                    console.error("WooOrder Error", e);
                    reply = `I couldn't find order #${orderId}. Please check the number.`;
                }
            } else {
                reply = "Please provide the Order ID (e.g., Track order 123).";
            }

            // 2. DISCOUNTS 
        } else if (lowerMsg.includes('discount') || lowerMsg.includes('promo') || lowerMsg.includes('coupon')) {
            type = 'discount';
            data = {
                code: 'WELCOME20',
                amount: '20% OFF',
                minOrder: 50
            };
            reply = "You're in luck! Here is a discount code for your next purchase.";

            // 3. PRODUCT SEARCH & AI CONTEXT
        } else {
            // Check if user is looking for products
            let productContext = "";
            let foundProducts: any[] = [];

            if (lowerMsg.includes('find') || lowerMsg.includes('buy') || lowerMsg.includes('search') || lowerMsg.includes('price') || lowerMsg.includes('cost') || lowerMsg.includes('product') || lowerMsg.includes('plant')) {
                try {
                    const { data: products } = await woo.get("products", {
                        search: message,
                        per_page: 5,
                        status: 'publish'
                    });

                    if (products && products.length > 0) {
                        foundProducts = products.map((p: any) => ({
                            id: p.id,
                            name: p.name,
                            price: p.price_html ? p.price_html.replace(/<[^>]*>?/gm, '') : `AED ${p.price}`,
                            image: p.images && p.images.length > 0 ? p.images[0].src : null,
                            link: p.permalink
                        }));

                        productContext = "Found these products in store:\n" + products.map((p: any) =>
                            `- ${p.name}: ${p.price} (Stock: ${p.stock_status})`
                        ).join("\n");

                        // Set the response type to product_list if we found items
                        type = 'product_list';
                        data = foundProducts;
                    } else {
                        productContext = "No specific products found for this search.";
                    }
                } catch (e) {
                    console.error("WooProduct Error", e);
                }
            }

            try {
                // Setup the model
                const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

                // Context Prompt
                const context = `
                You are a helpful ecommerce support assistant called "ShopBot" for Plantaviva.
                
                CONTEXT FROM STORE:
                ${productContext}

                User Message: ${message}
                
                If products are found:
                - Briefly introduce them (e.g., "Here are some great options I found for you:").
                - Do NOT list them in detail in the text, because I am showing them as UI cards.
                - Just give a helpful summary or ask if they want to know more about a specific one.

                If NO products found:
                - Apologize and ask for more details.
                - Suggest popular categories.
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
// Handle CORS Preflight request
export async function OPTIONS() {
    return NextResponse.json({}, {
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
    });
}
