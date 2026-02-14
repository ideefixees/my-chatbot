import { NextResponse } from 'next/server';

const MOCK_PRODUCTS = [
    { id: '1', name: 'Classic T-Shirt', price: 29.99, image: 'https://placehold.co/100' },
    { id: '2', name: 'Denim Jeans', price: 49.99, image: 'https://placehold.co/100' },
    { id: '3', name: 'Running Shoes', price: 89.99, image: 'https://placehold.co/100' },
];

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q');

    let products = MOCK_PRODUCTS;

    if (query) {
        const lowerQuery = query.toLowerCase();
        products = products.filter(p => p.name.toLowerCase().includes(lowerQuery));
    }

    return NextResponse.json({ products }, {
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        }
    });
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
