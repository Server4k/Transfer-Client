import React, { useEffect, useState } from 'react';
import jwt from 'jsonwebtoken';
import { useNavigate } from 'react-router-dom';
import './styles/Dashboard.css';

const Dashboard = () => {
    const navigate = useNavigate();
    const [quotes, setQuotes] = useState([]);
    const [newQuote, setNewQuote] = useState('');
    const [editQuote, setEditQuote] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [userInfo, setUserInfo] = useState({ username: '', email: '' });
    const [selectedQuote, setSelectedQuote] = useState(null);

    const fetchQuotes = async () => {
        try {
            const response = await fetch('https://transfer-server.vercel.app/api/quotes', {
                headers: {
                    'X-access-token': localStorage.getItem('token'),
                },
            });

            const data = await response.json();
            if (data.status === 'ok') {
                // Transform the quotes data to ensure consistent structure
                const transformedQuotes = data.quotes.map(quote => {
                    // Handle both possible data structures
                    if (typeof quote === 'string') {
                        return {
                            id: Math.random().toString(36).substr(2, 9),
                            text: quote
                        };
                    }
                    // If quote is an object with _id and text properties
                    if (quote._id && quote.text) {
                        return {
                            id: quote._id.toString(),
                            text: quote.text
                        };
                    }
                    // If quote is an object with text property
                    return {
                        id: quote._id?.toString() || Math.random().toString(36).substr(2, 9),
                        text: quote.text || quote
                    };
                });
                setQuotes(transformedQuotes);
            } else {
                alert(data.error);
            }
        } catch (error) {
            console.error('Error fetching quotes:', error);
            alert('Error fetching quotes');
        }
    };

    // Rest of the component remains the same...
    // (Keep all other functions and the return statement as they were)

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            const user = jwt.decode(token);
            if (!user) {
                localStorage.removeItem('token');
                navigate('/login');
            } else {
                setUserInfo({ username: user.Name, email: user.email });
                fetchQuotes();
            }
        } else {
            navigate('/login');
        }
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    const handleAddQuote = async (e) => {
        e.preventDefault();
        if (!newQuote.trim()) return;

        try {
            const response = await fetch('https://transfer-server.vercel.app/api/quote', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-access-token': localStorage.getItem('token'),
                },
                body: JSON.stringify({ quote: newQuote }),
            });

            const data = await response.json();
            if (data.status === 'ok') {
                const newQuoteObj = {
                    id: data.quoteId || Math.random().toString(36).substr(2, 9),
                    text: newQuote
                };
                setQuotes([...quotes, newQuoteObj]);
                setNewQuote('');
            } else {
                alert(data.error);
            }
        } catch (error) {
            alert('Error adding quote');
        }
    };

    const handleDeleteQuote = async (quoteObj, e) => {
        e.stopPropagation(); // Prevent triggering the quote click
        try {
            const response = await fetch(`https://transfer-server.vercel.app/api/quote/${encodeURIComponent(quoteObj.id)}`, {
                method: 'DELETE',
                headers: {
                    'X-access-token': localStorage.getItem('token'),
                },
            });

            const data = await response.json();
            if (data.status === 'ok') {
                setQuotes(quotes.filter(q => q.id !== quoteObj.id));
            } else {
                alert(data.error);
            }
        } catch (error) {
            alert('Error deleting quote');
        }
    };

    const handleEditClick = (quote, e) => {
        e.stopPropagation(); // Prevent triggering the quote click
        setEditQuote(quote.text);
        setEditingId(quote.id);
    };

    const handleEditQuote = async (e) => {
        e.preventDefault();
        if (!editQuote.trim()) return;

        try {
            const response = await fetch(`https://transfer-server.vercel.app/api/quote/${encodeURIComponent(editingId)}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-access-token': localStorage.getItem('token'),
                },
                body: JSON.stringify({ quote: editQuote }),
            });

            const data = await response.json();
            if (data.status === 'ok') {
                setQuotes(quotes.map(q => 
                    q.id === editingId ? { ...q, text: editQuote } : q
                ));
                setEditQuote('');
                setEditingId(null);
            } else {
                alert(data.error);
            }
        } catch (error) {
            alert('Error updating quote');
        }
    };

    const closeModal = () => {
        setSelectedQuote(null);
    };

    return (
        <div className="container">
            <div className="user-details">
                <h3>Welcome, {userInfo.username || 'User'}</h3>
                <h4>Email: {userInfo.email || 'Email not available'}</h4>
            </div>

            <div className="quotes-container">
                <h3>Your Quotes:</h3>
                <table className="quotes-list">
                    <thead>
                        <tr>
                            <th>Quote</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {quotes.map((quote) => (
                            <tr key={quote.id}>
                                <td 
                                    className="quote-text"
                                    onClick={() => setSelectedQuote(quote.text)}
                                    style={{ cursor: 'pointer' }}
                                >
                                    {quote.text.length > 100 
                                        ? `${quote.text.slice(0, 100)}...`
                                        : quote.text
                                    }
                                </td>
                                <td>
                                    <div className="action-buttons">
                                        <button onClick={(e) => handleDeleteQuote(quote, e)}>Delete</button>
                                        <button onClick={(e) => handleEditClick(quote, e)}>Edit</button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {editingId === null ? (
                    <form onSubmit={handleAddQuote} className="quote-form-container">
                        <textarea
                            placeholder='New Quote'
                            value={newQuote}
                            onChange={e => setNewQuote(e.target.value)}
                        />
                        <input type='submit' value='Add Quote' />
                    </form>
                ) : (
                    <form onSubmit={handleEditQuote} className="quote-form-container">
                        <textarea
                            placeholder='Edit Quote'
                            value={editQuote}
                            onChange={e => setEditQuote(e.target.value)}
                        />
                        <input type='submit' value='Update Quote' />
                        <button type="button" onClick={() => {
                            setEditingId(null);
                            setEditQuote('');
                        }}>Cancel</button>
                    </form>
                )}
            </div>

            <button type='button' className="logout-btn" onClick={handleLogout}>Logout</button>
            
            {selectedQuote && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <button className="close-modal-btn" onClick={closeModal}>Close</button>
                        <h2>Full Quote</h2>
                        <p>{selectedQuote}</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
