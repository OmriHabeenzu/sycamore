import { useState } from 'react'
import CompanySettings from './CompanySettings'
import UsersSettings from './UsersSettings'

const TABS = [
  { id: 'company', label: 'Company Profile' },
  { id: 'users',   label: 'Users & Staff' },
]

export default function Settings() {
  const [tab, setTab] = useState('company')

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Settings</h1>

      <div className="flex gap-1 border-b border-gray-200 mb-6">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
              tab === t.id
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'company' && <CompanySettings />}
      {tab === 'users'   && <UsersSettings />}
    </div>
  )
}
