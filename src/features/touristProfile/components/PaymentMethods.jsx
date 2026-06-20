import { useState } from 'react'
import { Pencil, Trash2, Plus, Lock } from 'lucide-react'
import CreditCardVisual from './CreditCardVisual'

const initialCards = [{ id: 1, last4: '5429', expires: '10/30', name: 'Jeffrey Richardson' }]

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

function AddCardForm({ onSave, onCancel }) {
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
        disabled={!valid}
        onClick={() => onSave({ name, last4: number.slice(-4) || '0000', expires: expiry })}
        className={`h-14 px-10 rounded-2xl shadow-[0px_4px_4px_0px_rgba(1,1,56,0.2)] font-medium text-xl w-full max-w-[560px] ${
          valid
            ? 'bg-gradient-to-r from-[#010170] to-[#5656a0] text-white'
            : 'bg-gradient-to-r from-[#878796] to-[#b7b7c4] text-[#ccc] cursor-not-allowed'
        }`}
      >
        Save Card
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

export default function PaymentMethods() {
  const [cards, setCards] = useState(initialCards)
  const [mode, setMode] = useState('list') // list | add | edit
  const [editingCard, setEditingCard] = useState(null)

  const handleDelete = (id) => setCards((prev) => prev.filter((c) => c.id !== id))

  const handleEdit = (card) => {
    setEditingCard(card)
    setMode('edit')
  }

  const handleSave = (data) => {
    if (mode === 'edit' && editingCard) {
      setCards((prev) => prev.map((c) => (c.id === editingCard.id ? { ...c, ...data } : c)))
    } else {
      setCards((prev) => [...prev, { id: Date.now(), ...data }])
    }
    setMode('list')
    setEditingCard(null)
  }

  if (mode === 'add' || mode === 'edit') {
    return (
      <AddCardForm
        onSave={handleSave}
        onCancel={() => {
          setMode('list')
          setEditingCard(null)
        }}
      />
    )
  }

  if (cards.length === 0) {
    return <EmptyAddCardPrompt onAddClick={() => setMode('add')} />
  }

  return (
    <div className="flex flex-col gap-12 items-center w-full">
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
    </div>
  )
}
