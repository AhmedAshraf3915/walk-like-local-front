import cardImg from '@/assets/images/Visa.svg'

export default function CreditCardVisual({ size = 'md', name = 'Jeffrey Richardson', last4 = '6789' }) {
  const dims = size === 'lg' ? 'w-full max-w-[560px] h-[355px]' : 'w-[284px] h-[180px]'
  const textScale = size === 'lg' ? 'text-xl px-10 py-8' : 'text-xs pl-2 ml-2 py-2 '

  return (
    <div className={`relative rounded-2xl shrink-0 overflow-hidden ${dims}`}>
      <img src={cardImg} alt="Credit card" className="absolute inset-0 w-full h-full object-cover" />
      <div className={`relative h-full flex flex-col justify-between text-white ${textScale}`}>
        <span />
        <p className="tracking-widest font-mono drop-shadow lg:mt-30 lg:px-10">**** **** **** {last4}</p>
        <span className="drop-shadow">{name}</span>
      </div>
    </div>
  )
}