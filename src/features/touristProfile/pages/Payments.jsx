import { useState } from 'react'
import Navbar from "@/components/home/Navbar.jsx";
import AccountTabs from '../components/AccountTabs'
import WalletCredits from '../components/WalletCredits'
import PaymentMethods from '../components/PaymentMethods'

export default function Payments() {
  const [tab, setTab] = useState('wallet') // wallet | methods

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className="max-w-[1728px] mx-auto px-8 lg:px-24 py-16 flex flex-col gap-16">
        <AccountTabs />

        <div className="flex justify-center w-full">
          <div className="bg-white border border-[var(--lighttext)] rounded-2xl shadow-[0px_8px_24px_0px_rgba(53,53,114,0.15)] p-4 inline-flex flex-wrap gap-2">
            <button
              onClick={() => setTab('wallet')}
              className={`rounded-2xl px-8 py-5 text-xl font-medium whitespace-nowrap ${
                tab === 'wallet' ? 'bg-[var(--maincolor)] text-white' : 'bg-white text-[var(--maincolor)]'
              }`}
            >
              Wallet & Credits
            </button>
            <button
              onClick={() => setTab('methods')}
              className={`rounded-2xl px-8 py-5 text-xl font-medium whitespace-nowrap ${
                tab === 'methods' ? 'bg-[var(--maincolor)] text-white' : 'bg-white text-[var(--maincolor)]'
              }`}
            >
              Payments Methods
            </button>
          </div>
        </div>

        {tab === 'wallet' ? <WalletCredits /> : <PaymentMethods />}
      </main>
    </div>
  )
}
