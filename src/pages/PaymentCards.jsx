import React, { useState, useEffect } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import { useCustomAuth } from '../context/AuthContext'
import { Sidebar } from '../components/Sidebar'
import { FaCreditCard, FaTrash } from 'react-icons/fa'
import './Pages.css'
import './PaymentCards.css'
import { API_BASE_URL } from '../utils/apiBaseUrl'

const CURRENT_YEAR = new Date().getFullYear()
const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1)
const YEARS = Array.from({ length: 10 }, (_, i) => CURRENT_YEAR + i)

export const PaymentCards = () => {
    const { getAccessTokenSilently, isAuthenticated } = useAuth0()
    const { customAuth } = useCustomAuth()

    const [cards, setCards] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')

    const [cardNumber, setCardNumber] = useState('')
    const [expiryMonth, setExpiryMonth] = useState('')
    const [expiryYear, setExpiryYear] = useState('')
    const [zipCode, setZipCode] = useState('')
    const [isDefault, setIsDefault] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const [formError, setFormError] = useState('')
    const [billingSummary, setBillingSummary] = useState(null)
    const [billingLoading, setBillingLoading] = useState(true)
    const [billingError, setBillingError] = useState('')
    const [runningAutoCharge, setRunningAutoCharge] = useState(false)
    const [autoChargeResult, setAutoChargeResult] = useState('')

    const getToken = async () => {
        if (isAuthenticated) {
            return await getAccessTokenSilently({
                authorizationParams: { audience: import.meta.env.VITE_AUTH0_AUDIENCE },
            })
        }
        if (customAuth) return customAuth
        return null
    }

    const fetchCards = async () => {
        try {
            const token = await getToken()
            if (!token) { setLoading(false); return }
            const res = await fetch(`${API_BASE_URL}/payments/cards`, {
                headers: { Authorization: `Bearer ${token}` },
            })
            if (res.ok) setCards(await res.json())
        } catch {
            setError('Failed to load saved cards.')
        } finally {
            setLoading(false)
        }
    }

    const fetchBillingSummary = async () => {
        setBillingLoading(true)
        setBillingError('')
        try {
            const token = await getToken()
            if (!token) { setBillingLoading(false); return }
            const res = await fetch(`${API_BASE_URL}/payments/billing/summary`, {
                headers: { Authorization: `Bearer ${token}` },
            })
            if (!res.ok) {
                const data = await res.json().catch(() => ({}))
                throw new Error(data.detail || 'Failed to load billing summary.')
            }
            setBillingSummary(await res.json())
        } catch (err) {
            setBillingError(err.message || 'Failed to load billing summary.')
        } finally {
            setBillingLoading(false)
        }
    }

    useEffect(() => {
        fetchCards()
        fetchBillingSummary()
    }, [isAuthenticated, customAuth])

    const handleCardNumberChange = (e) => {
        const digits = e.target.value.replace(/\D/g, '').slice(0, 16)
        setCardNumber(digits.replace(/(.{4})/g, '$1 ').trim())
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setFormError('')
        setSuccess('')
        setSubmitting(true)
        try {
            const token = await getToken()
            if (!token) { setFormError('Not authenticated.'); setSubmitting(false); return }

            const res = await fetch(`${API_BASE_URL}/payments/cards`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    card_number: cardNumber.replace(/\s/g, ''),
                    expiry_month: parseInt(expiryMonth),
                    expiry_year: parseInt(expiryYear),
                    zip_code: zipCode || null,
                    is_default: isDefault,
                }),
            })

            if (res.ok) {
                setSuccess('Card saved successfully.')
                setCardNumber('')
                setExpiryMonth('')
                setExpiryYear('')
                setZipCode('')
                setIsDefault(false)
                await fetchCards()
                await fetchBillingSummary()
            } else {
                const data = await res.json()
                setFormError(data.detail || 'Failed to save card.')
            }
        } catch {
            setFormError('An error occurred. Please try again.')
        } finally {
            setSubmitting(false)
        }
    }

    const handleDelete = async (cardId) => {
        setError('')
        setSuccess('')
        try {
            const token = await getToken()
            if (!token) return
            const res = await fetch(`${API_BASE_URL}/payments/cards/${cardId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
            })
            if (res.ok) {
                setCards(prev => prev.filter(c => c.card_id !== cardId))
                setSuccess('Card removed.')
                await fetchBillingSummary()
            }
        } catch {
            setError('Failed to remove card.')
        }
    }

    const handleRunAutoCharge = async () => {
        setRunningAutoCharge(true)
        setAutoChargeResult('')
        setBillingError('')
        try {
            const token = await getToken()
            if (!token) {
                setBillingError('Not authenticated.')
                return
            }
            const res = await fetch(`${API_BASE_URL}/payments/billing/auto-charge`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
            })
            const data = await res.json().catch(() => ({}))
            if (!res.ok) {
                setBillingError(data.detail || 'Auto-charge failed.')
                return
            }
            setAutoChargeResult(
                `Auto-charge complete. Charged: ${data.charged}, Failed: ${data.failed}, Skipped: ${data.skipped}.`
            )
            await fetchBillingSummary()
        } catch {
            setBillingError('Auto-charge failed.')
        } finally {
            setRunningAutoCharge(false)
        }
    }

    return (
        <div className="dashboard-container">
            <Sidebar />
            <div style={{ width: '100%' }}>
                <div className="page-heading">
                    <div className="h2">
                        <span className="text-black">PAYMENT </span>
                        <span className="text-purple">METHODS</span>
                    </div>
                </div>

                <div className="dashboard-homepage-container">
                    <div className="section-2 payment-section-2">

                        {/* ── Saved Cards ── */}
                        <div className="payment-panel">
                            <div className="dashboard-heading">SAVED CARDS</div>

                            {loading && <p className="stat-descriptor">Loading...</p>}
                            {error && <p className="feedback-msg error">{error}</p>}
                            {!loading && cards.length === 0 && !error && (
                                <p className="stat-descriptor">No cards saved yet.</p>
                            )}
                            {success && <p className="feedback-msg success">{success}</p>}

                            <div className="cards-list">
                                {cards.map(card => (
                                    <div key={card.card_id} className="saved-card-item">
                                        <div className={`card-brand-badge card-brand-${card.card_type_name.toLowerCase()}`}>
                                            <FaCreditCard />
                                            <span>{card.card_type_name.toUpperCase()}</span>
                                        </div>
                                        <div className="card-details">
                                            <div className="card-number-display">
                                                ●●●● ●●●● ●●●● {card.last_four}
                                            </div>
                                            <div className="card-meta">
                                                <span className="stat-heading">
                                                    EXP {String(card.expiry_month).padStart(2, '0')} / {card.expiry_year}
                                                </span>
                                                {card.is_default && (
                                                    <span className="default-badge">DEFAULT</span>
                                                )}
                                            </div>
                                        </div>
                                        <button
                                            className="delete-card-btn"
                                            onClick={() => handleDelete(card.card_id)}
                                            title="Remove card"
                                        >
                                            <FaTrash />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* ── Billing + Auto-charge ── */}
                        <div className="payment-panel">
                            <div className="dashboard-heading">BILLING & AUTO-CHARGE</div>

                            <div className="billing-actions">
                                <button
                                    type="button"
                                    className="panel-btn-purple card-submit-btn"
                                    onClick={handleRunAutoCharge}
                                    disabled={runningAutoCharge}
                                >
                                    {runningAutoCharge ? 'RUNNING...' : 'RUN AUTO-CHARGE NOW'}
                                </button>
                            </div>

                            {autoChargeResult && <p className="feedback-msg success">{autoChargeResult}</p>}
                            {billingError && <p className="feedback-msg error">{billingError}</p>}

                            <div className="billing-block">
                                <div className="stat-heading">UPCOMING / ACTIVE BILLING</div>
                                {billingLoading ? (
                                    <p className="stat-descriptor">Loading billing details...</p>
                                ) : !billingSummary || billingSummary.counterparties.length === 0 ? (
                                    <p className="stat-descriptor">No active client-coach contracts found.</p>
                                ) : (
                                    <div className="billing-list">
                                        {billingSummary.counterparties.map((item) => (
                                            <div
                                                key={`${item.counterparty_role}-${item.counterparty_id}`}
                                                className="billing-item"
                                            >
                                                <div className="billing-item-main">
                                                    <div className="card-number-display">
                                                        {item.counterparty_role === 'coach' ? 'Coach:' : 'Client:'} {item.counterparty_name}
                                                    </div>
                                                    <div className="stat-descriptor">
                                                        Next charge: {item.next_charge_date} ({item.days_until_due} day{Math.abs(item.days_until_due) === 1 ? '' : 's'})
                                                    </div>
                                                </div>
                                                <div className="billing-item-side">
                                                    <div className="stat-heading">${Number(item.amount).toFixed(2)}</div>
                                                    <div className={`billing-status ${item.paid_this_month ? 'paid' : 'due'}`}>
                                                        {item.paid_this_month ? 'PAID THIS MONTH' : 'DUE THIS MONTH'}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="billing-block">
                                <div className="stat-heading">RECENT PAYMENTS</div>
                                {billingLoading ? (
                                    <p className="stat-descriptor">Loading payment history...</p>
                                ) : !billingSummary || billingSummary.recent_payments.length === 0 ? (
                                    <p className="stat-descriptor">No payments yet.</p>
                                ) : (
                                    <div className="billing-list">
                                        {billingSummary.recent_payments.map((payment) => (
                                            <div key={payment.payment_id} className="billing-item">
                                                <div className="billing-item-main">
                                                    <div className="card-number-display">{payment.counterparty_name}</div>
                                                    <div className="stat-descriptor">
                                                        {new Date(payment.payment_date).toLocaleString()} • {payment.status}
                                                    </div>
                                                </div>
                                                <div className="billing-item-side">
                                                    <div className="stat-heading">${Number(payment.amount).toFixed(2)}</div>
                                                    <div className="stat-descriptor">
                                                        Fee ${Number(payment.platform_fee).toFixed(2)} • Payout ${Number(payment.coach_payout_amount).toFixed(2)}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* ── Add New Card ── */}
                        <div className="payment-panel">
                            <div className="dashboard-heading">ADD NEW CARD</div>

                            {formError && <p className="feedback-msg error">{formError}</p>}

                            <form className="card-form" onSubmit={handleSubmit}>
                                <div className="card-form-group">
                                    <label className="stat-heading">CARD NUMBER</label>
                                    <input
                                        className="card-input"
                                        type="text"
                                        placeholder="1234 5678 9012 3456"
                                        value={cardNumber}
                                        onChange={handleCardNumberChange}
                                        maxLength={19}
                                        required
                                    />
                                </div>

                                <div className="card-form-row">
                                    <div className="card-form-group">
                                        <label className="stat-heading">MONTH</label>
                                        <select
                                            className="card-input"
                                            value={expiryMonth}
                                            onChange={e => setExpiryMonth(e.target.value)}
                                            required
                                        >
                                            <option value="">MM</option>
                                            {MONTHS.map(m => (
                                                <option key={m} value={m}>
                                                    {String(m).padStart(2, '0')}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="card-form-group">
                                        <label className="stat-heading">YEAR</label>
                                        <select
                                            className="card-input"
                                            value={expiryYear}
                                            onChange={e => setExpiryYear(e.target.value)}
                                            required
                                        >
                                            <option value="">YYYY</option>
                                            {YEARS.map(y => (
                                                <option key={y} value={y}>{y}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="card-form-group">
                                    <label className="stat-heading">ZIP CODE (OPTIONAL)</label>
                                    <input
                                        className="card-input"
                                        type="text"
                                        placeholder="12345"
                                        value={zipCode}
                                        onChange={e => setZipCode(e.target.value)}
                                        maxLength={10}
                                    />
                                </div>

                                <label className="card-form-checkbox">
                                    <input
                                        type="checkbox"
                                        checked={isDefault}
                                        onChange={e => setIsDefault(e.target.checked)}
                                    />
                                    <span className="stat-descriptor">Set as default payment method</span>
                                </label>

                                <div className="btn-container">
                                    <button
                                        type="submit"
                                        className="panel-btn-purple card-submit-btn"
                                        disabled={submitting}
                                    >
                                        {submitting ? 'SAVING...' : 'SAVE CARD'}
                                    </button>
                                </div>
                            </form>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    )
}
