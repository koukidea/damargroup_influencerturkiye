import { Search, X } from 'lucide-react'

// Panel listelerinin üstündeki arama kutusu; yazarken süzer, temizle düğmesi var.
export default function SearchBox({ value, onChange, placeholder = 'Ara…', label = 'Ara', className = '' }) {
  return (
    <label className={`relative block ${className}`}>
      <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={label}
        className="input pl-10 pr-10 py-2.5"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100"
          aria-label="Aramayı temizle"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </label>
  )
}
