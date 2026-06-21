import { useState, useEffect } from 'react'
import { Pencil, Trash2, Plus, Lock, Loader2 } from 'lucide-react'
import CreditCardVisual from './CreditCardVisual'
import { getPaymentMethods, addPaymentMethod, updatePaymentMethod, deletePaymentMethod } from '../../bookingTour/services/paymentMethods.js'

function SavedCardRow({ card, onEdit, onDelete }) {
  return (
    <div className="border border-[var(--lighttext)] rounded-2xl shadow-[0px_8px_24px_0px_rgba(1,1,56,0.08)] px-8 md:px-16 py-6 w-full">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div className="flex flex-wrap items-center gap-8">
          <CreditCardVisual last4={card.last4} name={card.name} size='xs' />
          <div className="flex flex-col gap-3">
            <p className="font-bold text-2xl md:text-3xl text-[var(--maincolor)] tracking-widest">
              **** **** **** {card.last4}
            </p>
            <p className="text-xl md:text-2xl text-[var(--mediumfont)] font-medium">Expires {card.expires}</p>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <button onClick={() => onEdit(card)}>
            <Pencil className="size-9 text-[var(--maincolor)]" />
          </button>
          <button onClick={() => onDelete(card.id)}>
            <Trash2 className="size-9 text-red-600" />
          </button>
        </div>
      </div>
    </div>
  )
}

function EncryptedNote() {
  return (
    <div className="flex items-center gap-2 justify-center">
      <Lock className="size-5" />
      <p className="text-sm font-light text-black">Your payment details are encrypted end-to-end.</p>
    </div>
  )
}

function AddCardForm({ onSave, onCancel, saving }) {
  const [name, setName] = useState('')
  const [number, setNumber] = useState('')
  const [expiry, setExpiry] = useState('')
  const [cvv, setCvv] = useState('')
  const valid = name && number && expiry && cvv

  const fieldClass =
    'bg-white/20 border-[0.8px] border-[var(--maincolor)] rounded-2xl px-8 py-5 w-full text-[#5656a0] placeholder:text-[#5656a0] outline-none'

  return (
    <div className="flex flex-col items-center gap-16 w-full max-w-[998px] mx-auto">
      <CreditCardVisual size="lg" name={name || 'Jeffrey Richardson'} last4={number ? number.slice(-4) : '6789'} />

      <div className="flex flex-col gap-6 w-full">
        <div className="flex flex-col gap-4">
          <label className="text-lg text-[var(--maintaxt)]">Name on card</label>
          <input
            className={fieldClass}
            placeholder="Sarah Abdo"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-4">
          <label className="text-lg text-[var(--maintaxt)]">Card number</label>
          <input
            className={fieldClass}
            placeholder="123 456 789 321"
            value={number}
            onChange={(e) => setNumber(e.target.value)}
          />
        </div>
        <div className="flex gap-6">
          <div className="flex flex-col gap-4 flex-1">
            <label className="text-lg text-[var(--maintaxt)]">Expiry date</label>
            <input
              className={fieldClass}
              placeholder="MM/YY"
              value={expiry}
              onChange={(e) => setExpiry(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-4 w-[180px]">
            <label className="text-lg text-[var(--maintaxt)]">CVV</label>
            <input
              className={fieldClass}
              placeholder="999"
              value={cvv}
              onChange={(e) => setCvv(e.target.value)}
            />
          </div>
        </div>
      </div>

      <button
        disabled={!valid || saving}
        onClick={() => onSave({ name, last4: number.slice(-4) || '0000', expires: expiry })}
        className={`h-14 px-10 rounded-2xl shadow-[0px_4px_4px_0px_rgba(1,1,56,0.2)] font-medium text-xl w-full max-w-[560px] ${
          valid && !saving
            ? 'bg-gradient-to-r from-[#010170] to-[#5656a0] text-white'
            : 'bg-gradient-to-r from-[#878796] to-[#b7b7c4] text-[#ccc] cursor-not-allowed'
        }`}
      >
        {saving ? 'Saving…' : 'Save Card'}
      </button>
      <button onClick={onCancel} className="text-[var(--maincolor)] underline text-lg">
        Cancel
      </button>

      <EncryptedNote />
    </div>
  )
}

function EmptyAddCardPrompt({ onAddClick }) {
  return (
    <div className="flex flex-col gap-12 items-center text-center w-full max-w-[1439px] mx-auto">
      <div className="flex flex-col gap-6">
        <h2 className="font-semibold text-3xl md:text-4xl text-[var(--maintaxt)] tracking-[2.2px]">
          Add Payment Method
        </h2>
        <p className="text-2xl md:text-3xl text-[var(--mediumfont)]">
          Securely save a card so booking a trip is one tap away.
        </p>
      </div>
      <div className="flex flex-col gap-8 items-center w-full max-w-[560px]">
        <CreditCardVisual size="lg" />
        <button
          onClick={onAddClick}
          className="h-14 px-10 rounded-2xl border border-[#010170] shadow-[0px_4px_4px_0px_rgba(1,1,56,0.2)] text-[var(--maintaxt)] font-medium text-base flex items-center gap-2 w-full justify-center"
        >
          Add card <Plus className="size-5" />
        </button>
      </div>
      <EncryptedNote />
    </div>
  )
}

const extractData = (res) => res?.data?.data ?? res?.data ?? res

function normalizeCard(c) {
  return {
    id: c._id || c.id,
    last4: c.last4 || c.lastFourDigits || (c.cardNumber ? c.cardNumber.slice(-4) : '0000'),
    expires: c.expiryDate || c.expires || c.expiry || '',
    name: c.cardholderName || c.name || c.cardholder || '',
    brand: c.brand || c.cardBrand || '',
  }
}

export default function PaymentMethods() {
  const [cards, setCards] = useState([])
  const [mode, setMode] = useState('list')
  const [editingCard, setEditingCard] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const loadCards = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await getPaymentMethods()
      const list = extractData(res)
      setCards(Array.isArray(list) ? list.map(normalizeCard) : [])
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Failed to load payment methods')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCards()
  }, [])

  const handleDelete = async (id) => {
    setError(null)
    try {
      await deletePaymentMethod(id)
      setCards((prev) => prev.filter((c) => c.id !== id))
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Failed to delete card')
    }
  }

  const handleEdit = (card) => {
    setEditingCard(card)
    setMode('edit')
  }

  const handleSave = async (data) => {
    setSaving(true)
    setError(null)
    try {
      const payload = {
        cardholderName: data.name,
        last4: data.last4,
        expiryDate: data.expires,
        brand: data.brand || 'Visa',
      }
      if (mode === 'edit' && editingCard) {
        const res = await updatePaymentMethod(editingCard.id, payload)
        const updated = normalizeCard(extractData(res))
        setCards((prev) => prev.map((c) => (c.id === editingCard.id ? updated : c)))
      } else {
        const res = await addPaymentMethod(payload)
        const added = normalizeCard(extractData(res))
        setCards((prev) => [...prev, added])
      }
      setMode('list')
      setEditingCard(null)
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Failed to save card')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="size-8 animate-spin text-[var(--maincolor)]" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 items-center w-full">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 rounded-2xl px-6 py-4 w-full text-center text-lg">
          {error}
        </div>
      )}

      {mode === 'add' || mode === 'edit' ? (
        <AddCardForm
          onSave={handleSave}
          onCancel={() => {
            setMode('list')
            setEditingCard(null)
          }}
          saving={saving}
        />
      ) : cards.length === 0 ? (
        <EmptyAddCardPrompt onAddClick={() => setMode('add')} />
      ) : (
        <>
          {cards.map((card) => (
            <SavedCardRow key={card.id} card={card} onEdit={handleEdit} onDelete={handleDelete} />
          ))}
          <div className="w-full max-w-[560px]">
            <button
              onClick={() => setMode('add')}
              className="h-14 px-10 rounded-2xl border border-[#010170] shadow-[0px_4px_4px_0px_rgba(1,1,56,0.2)] text-[var(--maintaxt)] font-medium text-base flex items-center gap-2 w-full justify-center"
            >
              Add card <Plus className="size-5" />
            </button>
          </div>
          <EncryptedNote />
        </>
      )}
    </div>
  )
}
