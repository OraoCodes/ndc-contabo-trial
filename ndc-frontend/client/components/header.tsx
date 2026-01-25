// client/components/header.tsx
"use client"

import React, { useState, useEffect } from 'react'
import { Link } from "react-router-dom"
import { Search, Menu, X, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { listCounties } from "@/lib/supabase-api"

// Static thematic areas (these don't change)
const thematicAreasItems = [
  { name: 'Governance', path: '/governance' },
  { name: 'MRV', path: '/mrv' },
  { name: 'Mitigation', path: '/mitigation' },
  { name: 'Adaptation', path: '/adaptation' },
  { name: 'Finance & Technology Transfer', path: '/finance-technology-transfer' },
]

interface County {
  id: number
  name: string
}

export function Header({ currentPage }: { currentPage?: string }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [counties, setCounties] = useState<County[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    listCounties()
      .then(data => {
        const sorted = data.sort((a: County, b: County) => a.name.localeCompare(b.name))
        setCounties(sorted)
      })
      .catch(err => {
        console.error("Failed to load counties:", err)
        setCounties([])
      })
      .finally(() => setLoading(false))
  }, [])

  const countiesItems = counties.map(county => ({
    name: county.name,
    path: `/county/${county.name.toLowerCase().replace(/\s+/g, '-')}`
  }))

  return (
    <>
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between gap-6">
          <Link to="/" className="flex items-center gap-3 flex-shrink-0">
            <img src="/ndc_logo.png" className="h-10 w-auto" alt="Logo" />
            <div>
              <h1 className="text-sm font-bold leading-tight text-gray-900">
                NDC tracking tool for
              </h1>
              <p className="text-xs text-gray-500">water and waste management in Kenya</p>
            </div>
          </Link>

          <div className="flex-1 max-w-md hidden lg:block">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input placeholder="Search counties, indicators..." className="pl-10 bg-gray-50 border-0 focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>

          <nav className="hidden lg:flex items-center gap-6 text-sm font-medium">
            <Link to="/" className={`hover:text-blue-600 ${currentPage === "home" ? "text-blue-600 font-bold" : "text-gray-700"}`}>HOME</Link>
            <Dropdown title="THEMATIC AREAS" items={thematicAreasItems} currentPage={currentPage} />
            
            {loading ? (
              <div className="flex items-center gap-2 text-gray-500">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Loading counties...</span>
              </div>
            ) : (
              <Dropdown title="COUNTIES" items={countiesItems} currentPage={currentPage} />
            )}

            <Link to="/water-management" className={`hover:text-blue-600 ${currentPage === "water" ? "text-blue-600 font-bold" : "text-gray-700"}`}>WATER MANAGEMENT</Link>
            <Link to="/waste-management" className={`hover:text-blue-600 ${currentPage === "waste" ? "text-blue-600 font-bold" : "text-gray-700"}`}>WASTE MANAGEMENT</Link>
            <Link to="/about-the-tool" className={`hover:text-blue-600 ${currentPage === "about" ? "text-blue-600 font-bold" : "text-gray-700"}`}>ABOUT THE TOOL</Link>
          </nav>

          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="lg:hidden p-2 rounded-lg hover:bg-gray-100">
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </header>

      {mobileMenuOpen && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setMobileMenuOpen(false)} />
          <div className="fixed inset-x-0 top-16 z-50 bg-white border-b shadow-xl">
            <div className="px-6 py-6 space-y-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input placeholder="Search..." className="pl-10" />
              </div>
              <nav className="space-y-4 text-lg font-medium">
                <Link to="/" onClick={() => setMobileMenuOpen(false)} className="block">Home</Link>
                <MobileDropdown title="Thematic Areas" items={thematicAreasItems} onClose={() => setMobileMenuOpen(false)} />
                
                {loading ? (
                  <div className="py-4 text-center text-gray-500">
                    <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2" />
                    Loading counties...
                  </div>
                ) : (
                  <MobileDropdown title="Counties" items={countiesItems} onClose={() => setMobileMenuOpen(false)} />
                )}

                <Link to="/water-management" onClick={() => setMobileMenuOpen(false)} className="block">Water Management</Link>
                <Link to="/waste-management" onClick={() => setMobileMenuOpen(false)} className="block">Waste Management</Link>
                <Link to="/about-the-tool" onClick={() => setMobileMenuOpen(false)} className="block">About the Tool</Link>
              </nav>
            </div>
          </div>
        </>
      )}
    </>
  )
}

// Desktop Dropdown
function Dropdown({ title, items, currentPage }: { title: string; items: { name: string; path: string }[]; currentPage?: string }) {
  const isActive = items.some(i => currentPage?.includes(i.path.split('/')[1]))
  return (
    <div className="relative group">
      <button className={`flex items-center gap-1 hover:text-blue-600 ${isActive ? "text-blue-600 font-bold" : "text-gray-700"}`}>
        {title}
        <svg className="w-3 h-3 transition-transform group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <div className="absolute left-1/2 top-full -translate-x-1/2 mt-3 w-56 bg-white rounded-lg shadow-xl border border-gray-100 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-[9999]">
        {items.map(item => (
          <Link key={item.path} to={item.path} className="block px-5 py-3 text-sm hover:bg-blue-50 hover:text-blue-600">
            {item.name}
          </Link>
        ))}
      </div>
    </div>
  )
}

// Mobile Dropdown
function MobileDropdown({ title, items, onClose }: { title: string; items: { name: string; path: string }[]; onClose: () => void }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b border-gray-100 pb-4">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between text-left">
        {title}
        <svg className={`w-5 h-5 transition-transform ${open ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="mt-3 ml-4 space-y-2">
          {items.map(item => (
            <Link key={item.path} to={item.path} onClick={onClose} className="block py-2 text-gray-700 hover:text-blue-600">
              {item.name}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
