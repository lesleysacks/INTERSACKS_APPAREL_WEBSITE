/* How the customer wants to pay. Money never changes hands on the website:
   the owner sends EFT details or a payment link on WhatsApp for the amount due now. */
export const PAYMENT_OPTIONS = [
  { id: 'deposit', label: 'Pay 50% deposit', short: '50% deposit' },
  { id: 'full', label: 'Pay in full', short: 'Pay in full' }
]

export const PAYMENT_TERMS = 'Your deposit locks your order and starts printing. Custom prints can\'t be refunded once printing starts. The balance is due before dispatch or collection.'

/* Deposit is half the total rounded up to the whole rand; the balance is the rest. */
export function paymentSplit(total, option) {
  const choice = PAYMENT_OPTIONS.find((entry) => entry.id === option)
  if (!choice) return null
  const dueNow = option === 'deposit' ? Math.ceil(total / 2) : total
  return { option, label: choice.short, dueNow, balance: total - dueNow }
}
