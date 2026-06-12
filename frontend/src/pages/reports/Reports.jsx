import { useState } from 'react'
import CollectionsReport from './CollectionsReport'
import PortfolioReport from './PortfolioReport'
import AgingReport from './AgingReport'
import OfficerReport from './OfficerReport'
import IncomeStatement from './IncomeStatement'
import BalanceSheet from './BalanceSheet'

const TABS = [
  { id: 'collections', label: 'Collections Sheet' },
  { id: 'portfolio',   label: 'Portfolio' },
  { id: 'aging',       label: 'Aging Analysis' },
  { id: 'officers',    label: 'Officer Performance' },
  { id: 'income',      label: 'Income Statement' },
  { id: 'balance',     label: 'Balance Sheet' },
]

export default function Reports() {
  const [tab, setTab] = useState('collections')

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Reports</h1>

      {/* Tab bar */}
      <div className="flex gap-1 border-b border-gray-200 mb-6">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
              tab === t.id
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'collections' && <CollectionsReport />}
      {tab === 'portfolio'   && <PortfolioReport />}
      {tab === 'aging'       && <AgingReport />}
      {tab === 'officers'    && <OfficerReport />}
      {tab === 'income'      && <IncomeStatement />}
      {tab === 'balance'     && <BalanceSheet />}
    </div>
  )
}
