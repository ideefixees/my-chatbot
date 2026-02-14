import React, { useState, useRef, useEffect } from 'react';

interface ComponentProps {
    config: {
        apiUrl?: string;
        shopId?: string;
    };
}

interface Message {
    role: 'user' | 'assistant';
    content: string;
    type?: 'text' | 'order_status' | 'discount' | 'product_list';
    data?: any;
}

const OrderCard = ({ data }: { data: any }) => (
    <div style={{ padding: '10px', backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e5e7eb', marginTop: '8px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', borderBottom: '1px solid #f3f4f6', paddingBottom: '4px' }}>
            <span style={{ fontWeight: 'bold', fontSize: '14px', color: '#111827' }}>Order #{data.id}</span>
            <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#059669', backgroundColor: '#d1fae5', padding: '2px 6px', borderRadius: '4px' }}>{data.status}</span>
        </div>
        <div style={{ fontSize: '13px', color: '#4b5563', marginBottom: '8px' }}>
            <div>🚚 {data.eta}</div>
        </div>
        <div style={{ fontSize: '12px', color: '#6b7280' }}>
            {data.items.join(', ')}
        </div>
    </div>
);

const DiscountCard = ({ data }: { data: any }) => (
    <div style={{ padding: '12px', backgroundColor: '#fff7ed', borderRadius: '8px', border: '1px solid #fdba74', marginTop: '8px', textAlign: 'center' }}>
        <div style={{ fontSize: '14px', color: '#9a3412', marginBottom: '4px' }}>🎉 Special Offer!</div>
        <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#c2410c', margin: '4px 0' }}>{data.amount}</div>
        <div style={{ fontSize: '12px', color: '#9a3412', marginBottom: '8px' }}>Min order ${data.minOrder}</div>
        <div style={{
            backgroundColor: 'white', border: '2px dashed #fdba74', padding: '8px',
            fontWeight: 'bold', fontFamily: 'monospace', fontSize: '16px', color: '#c2410c',
            cursor: 'pointer'
        }} onClick={() => { navigator.clipboard.writeText(data.code); alert('Code copied!') }}>
            {data.code}
        </div>
    </div>
);

// Product Card Component
const ProductCard = ({ data }: { data: any }) => (
    <div style={{
        minWidth: '150px',
        maxWidth: '150px',
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        padding: '10px',
        backgroundColor: 'white',
        marginRight: '10px',
        flexShrink: 0,
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
    }}>
        <div style={{ height: '100px', marginBottom: '8px', borderRadius: '4px', overflow: 'hidden', backgroundColor: '#f3f4f6' }}>
            <img
                src={data.image || 'https://placehold.co/150x150?text=No+Image'}
                alt={data.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
        </div>
        <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#111827', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: '4px' }}>
            {data.name}
        </div>
        <div style={{ fontSize: '12px', color: '#059669', fontWeight: 'bold', marginBottom: '8px' }}>
            {data.price}
        </div>
        <a
            href={data.link}
            target="_blank"
            rel="noopener noreferrer"
            style={{
                display: 'block',
                textAlign: 'center',
                fontSize: '12px',
                backgroundColor: '#4f46e5',
                color: 'white',
                textDecoration: 'none',
                padding: '6px',
                borderRadius: '6px',
                fontWeight: '500'
            }}
        >
            View Product
        </a>
    </div>
);

export const ChatWidget: React.FC<ComponentProps> = ({ config }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        { role: 'assistant', content: 'Hello! How can I help you today?', type: 'text' }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputValue.trim() || isLoading) return;

        const userMsg = inputValue.trim();
        setInputValue('');
        setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
        setIsLoading(true);

        try {
            const baseUrl = config.apiUrl || 'http://localhost:3000/api/chat';
            const res = await fetch(baseUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: userMsg,
                    shopId: config.shopId,
                }),
            });

            if (!res.ok) throw new Error('Failed to fetch');

            const data = await res.json();
            // Handle structured response
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: data.reply,
                type: data.type || 'text',
                data: data.data
            }]);
        } catch (error) {
            console.error('Chat error:', error);
            setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I'm having trouble connecting right now." }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 9999, fontFamily: 'sans-serif' }}>
            {isOpen && (
                <div style={{
                    marginBottom: '10px',
                    width: '350px',
                    height: '500px',
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden'
                }}>
                    {/* Header */}
                    <div style={{ padding: '16px', backgroundColor: '#4f46e5', color: 'white', display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ fontWeight: 'bold' }}>Chat Support</span>
                        <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>✕</button>
                    </div>

                    {/* Messages */}
                    <div style={{ flex: 1, padding: '16px', overflowY: 'auto', backgroundColor: '#f9fafb' }}>
                        {messages.map((msg, idx) => (
                            <div key={idx} style={{
                                marginBottom: '10px',
                                textAlign: msg.role === 'user' ? 'right' : 'left'
                            }}>
                                <div style={{
                                    display: 'inline-block',
                                    padding: '8px 12px',
                                    borderRadius: '12px',
                                    backgroundColor: msg.role === 'user' ? '#4f46e5' : '#e5e7eb',
                                    color: msg.role === 'user' ? 'white' : 'black',
                                    maxWidth: '85%'
                                }}>
                                    <div style={{ marginBottom: (msg.type === 'product_list' || msg.type === 'order_status') ? '8px' : '0' }}>
                                        {msg.content}
                                    </div>

                                    {msg.type === 'order_status' && <OrderCard data={msg.data} />}
                                    {msg.type === 'discount' && <DiscountCard data={msg.data} />}

                                    {msg.type === 'product_list' && (
                                        <div style={{ display: 'flex', overflowX: 'auto', paddingBottom: '4px', maxWidth: '100%' }}>
                                            {Array.isArray(msg.data) && msg.data.map((product: any) => (
                                                <ProductCard key={product.id} data={product} />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                        {isLoading && <div style={{ textAlign: 'left', color: '#6b7280', fontSize: '0.875rem' }}>Typing...</div>}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <form onSubmit={handleSubmit} style={{ padding: '12px', borderTop: '1px solid #e5e7eb', display: 'flex' }}>
                        <input
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            placeholder="Type a message..."
                            style={{
                                flex: 1,
                                padding: '8px 12px',
                                border: '1px solid #d1d5db',
                                borderRadius: '20px',
                                outline: 'none',
                                marginRight: '8px'
                            }}
                        />
                        <button
                            type="submit"
                            style={{
                                backgroundColor: '#4f46e5',
                                color: 'white',
                                border: 'none',
                                borderRadius: '50%',
                                width: '36px',
                                height: '36px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                            disabled={isLoading}
                        >
                            ➤
                        </button>
                    </form>
                </div>
            )}

            <button
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    backgroundColor: '#4f46e5',
                    color: '#fff',
                    border: 'none',
                    cursor: 'pointer',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '24px'
                }}
            >
                {isOpen ? '✕' : '💬'}
            </button>
        </div>
    );
};
