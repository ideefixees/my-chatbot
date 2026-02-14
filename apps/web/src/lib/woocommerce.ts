import WooCommerceRestApi from "@woocommerce/woocommerce-rest-api";

// Initialize the WooCommerce API client
export const wooParams = {
    url: process.env.WOO_SITE_URL || 'https://plantaviva.in',
    consumerKey: process.env.WOO_CONSUMER_KEY || '',
    consumerSecret: process.env.WOO_CONSUMER_SECRET || '',
    version: 'wc/v3',
    queryStringAuth: true // Important for some hosting providers
};

// Check if credentials exist before exporting
export const woo = new WooCommerceRestApi(wooParams as any);

// Helper to check connection
export async function checkWooConnection() {
    try {
        const response = await woo.get("system_status");
        return response.status === 200;
    } catch (error) {
        console.error("WooCommerce Connection Error:", error);
        return false;
    }
}
