import { useState, useRef, useEffect } from 'react';
import { askAssistant } from '../api/chat';
import styles from './AssistantPage.module.css';

export default function AssistantPage() {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        // Show welcome message on mount
        if (messages.length === 0) {
            setMessages([
                {
                    role: 'assistant',
                    content:
                        "Hello! I'm your Lost & Found assistant. I can help you search for lost or found items in our database. Ask me questions like:\n\n• Has anyone found a black wallet near Block C?\n• Show lost ID cards reported this week\n• Are there any unclaimed electronics?",
                    timestamp: new Date().toISOString(),
                },
            ]);
        }
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage = {
            role: 'user',
            content: input.trim(),
            timestamp: new Date().toISOString(),
        };

        setMessages((prev) => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);
        setError(null);

        try {
            const response = await askAssistant(userMessage.content);
            const assistantMessage = {
                role: 'assistant',
                content: response.data.answer,
                timestamp: new Date().toISOString(),
            };
            setMessages((prev) => [...prev, assistantMessage]);
        } catch (err) {
            console.error('Chat error:', err);
            setError(err.response?.data?.message || 'Failed to get response. Please try again.');
            // Add error message to chat
            setMessages((prev) => [
                ...prev,
                {
                    role: 'error',
                    content:
                        err.response?.data?.message ||
                        'Sorry, I encountered an error. Please try again later.',
                    timestamp: new Date().toISOString(),
                },
            ]);
        } finally {
            setIsLoading(false);
            inputRef.current?.focus();
        }
    };

    const handleClear = () => {
        setMessages([
            {
                role: 'assistant',
                content:
                    "Chat cleared! How can I assist you with Lost & Found items?",
                timestamp: new Date().toISOString(),
            },
        ]);
        setError(null);
        inputRef.current?.focus();
    };

    const suggestedPrompts = [
        'Show all unclaimed items',
        'Has anyone found a wallet?',
        'List lost electronics',
        'Found items in the library',
    ];

    const handleSuggestedPrompt = (prompt) => {
        setInput(prompt);
        inputRef.current?.focus();
    };

    return (
        <div className={styles.page}>
            <div className={styles.container}>
                <div className={styles.header}>
                    <h1 className={styles.title}>
                        <span className={styles.titleIcon}>🤖</span>
                        Lost & Found Assistant
                    </h1>
                    <p className={styles.subtitle}>
                        Ask questions about lost and found items in our database
                    </p>
                    {messages.length > 1 && (
                        <button onClick={handleClear} className={styles.clearBtn}>
                            Clear Chat
                        </button>
                    )}
                </div>

                <div className={styles.chatContainer}>
                    <div className={styles.messages}>
                        {messages.map((msg, idx) => (
                            <div
                                key={idx}
                                className={[
                                    styles.message,
                                    msg.role === 'user' ? styles.messageUser : '',
                                    msg.role === 'error' ? styles.messageError : '',
                                ].join(' ')}
                            >
                                <div className={styles.messageContent}>
                                    {msg.role === 'assistant' && (
                                        <div className={styles.messageAvatar}>🤖</div>
                                    )}
                                    <div className={styles.messageBubble}>
                                        <div className={styles.messageText}>{msg.content}</div>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {isLoading && (
                            <div className={styles.message}>
                                <div className={styles.messageContent}>
                                    <div className={styles.messageAvatar}>🤖</div>
                                    <div className={[styles.messageBubble, styles.loadingBubble].join(' ')}>
                                        <div className={styles.typingIndicator}>
                                            <span />
                                            <span />
                                            <span />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {messages.length === 1 && !isLoading && (
                            <div className={styles.suggestedPrompts}>
                                <p className={styles.suggestedTitle}>Try asking:</p>
                                {suggestedPrompts.map((prompt, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => handleSuggestedPrompt(prompt)}
                                        className={styles.promptBtn}
                                    >
                                        {prompt}
                                    </button>
                                ))}
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    <form onSubmit={handleSubmit} className={styles.inputForm}>
                        {error && <div className={styles.errorBanner}>{error}</div>}
                        <div className={styles.inputWrapper}>
                            <input
                                ref={inputRef}
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Ask about lost or found items..."
                                className={styles.input}
                                disabled={isLoading}
                                autoFocus
                            />
                            <button
                                type="submit"
                                disabled={!input.trim() || isLoading}
                                className={styles.sendBtn}
                                aria-label="Send message"
                            >
                                {isLoading ? '...' : '→'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
