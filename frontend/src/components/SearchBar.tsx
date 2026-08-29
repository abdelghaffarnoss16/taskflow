import { useState } from 'react'

export default function SearchBar({
  onSearch,
  placeholder = 'Search tasks...',
}: {
  onSearch: (query: string) => void
  placeholder?: string
}) {
  const [value, setValue] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setValue(newValue)
    onSearch(newValue)
  }

  return (
    <input
      type="text"
      className="search-bar"
      placeholder={placeholder}
      value={value}
      onChange={handleChange}
    />
  )
}
