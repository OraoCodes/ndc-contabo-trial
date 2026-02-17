// client/components/header.tsx
"use client"

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Link } from "react-router-dom"
import { Search, Menu, X, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { listCounties, listThematicAreas, thematicAreasToMenuItems } from "@/lib/supabase-api"

interface County {
  id: number
  name: string
}

type ThematicMenuItem = { name: string; path: string; sector?: string | null }

export function Header({ currentPage }: { currentPage?: string }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [counties, setCounties] = useState<County[]>([])
  const [thematicAreasItems, setThematicAreasItems] = useState<ThematicMenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingThematic, setLoadingThematic] = useState(true)

  useEffect(() => {
    listCounties()
      .then(data => {
        const sorted = [...data].sort((a: County, b: County) => a.name.localeCompare(b.name))
        setCounties(sorted)
      })
      .catch(() => setCounties([]))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    listThematicAreas()
      .then(data => setThematicAreasItems(thematicAreasToMenuItems(data)))
      .catch(() => setThematicAreasItems([]))
      .finally(() => setLoadingThematic(false))
  }, [])

  const countiesItems = counties.map(county => ({
    name: county.name,
    path: `/county/${county.name.toLowerCase().replace(/\s+/g, '-')}`
  }))

  // Nested structure: Water Management and Waste Management as non-clickable parents; thematic areas as children
  const waterItems = thematicAreasItems.filter((i) => (i.sector || '').toLowerCase() === 'water')
  const wasteItems = thematicAreasItems.filter((i) => (i.sector || '').toLowerCase() === 'waste')
  const thematicNestedSections: { parentLabel: string; items: ThematicMenuItem[] }[] = [
    { parentLabel: 'Water Management', items: waterItems },
    { parentLabel: 'Waste Management', items: wasteItems },
  ]

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
            {loadingThematic ? (
              <div className="flex items-center gap-2 text-gray-500">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-xs">Thematic areas...</span>
              </div>
            ) : (
              <Dropdown title="THEMATIC AREAS" nestedSections={thematicNestedSections} currentPage={currentPage} />
            )}
            
            {loading ? (
              <div className="flex items-center gap-2 text-gray-500">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Loading counties...</span>
              </div>
            ) : (
              <Dropdown title="COUNTIES" items={countiesItems} currentPage={currentPage} />
            )}

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
                {loadingThematic ? (
                  <div className="flex items-center gap-2 text-gray-500 py-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Thematic areas...</span>
                  </div>
                ) : (
                  <MobileDropdown title="Thematic Areas" nestedSections={thematicNestedSections} onClose={() => setMobileMenuOpen(false)} />
                )}
                
                {loading ? (
                  <div className="py-4 text-center text-gray-500">
                    <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2" />
                    Loading counties...
                  </div>
                ) : (
                  <MobileDropdown title="Counties" items={countiesItems} onClose={() => setMobileMenuOpen(false)} />
                )}

                <Link to="/about-the-tool" onClick={() => setMobileMenuOpen(false)} className="block">About the Tool</Link>
              </nav>
            </div>
          </div>
        </>
      )}
    </>
  )
}

type MenuItem = { name: string; path: string }
type MenuSection = { label?: string; items: MenuItem[] }
type NestedSection = { parentLabel: string; items: MenuItem[] }

// Desktop Dropdown: accepts flat items (COUNTIES), sections, or nestedSections (THEMATIC AREAS: Water/Waste parents with thematic children)
function Dropdown({
  title,
  items,
  sections,
  nestedSections,
  currentPage,
}: {
  title: string
  items?: MenuItem[]
  sections?: MenuSection[]
  nestedSections?: NestedSection[]
  currentPage?: string
}) {
  const resolvedSections: MenuSection[] = sections ?? (items?.length ? [{ items }] : [])
  const allItemsFromSections = resolvedSections.flatMap(s => s.items)
  const allItemsFromNested = nestedSections?.flatMap(n => n.items) ?? []
  const allItems = nestedSections?.length ? allItemsFromNested : allItemsFromSections
  const isActive = allItems.some(i => currentPage?.includes(i.path.split('/')[1]))

  const [open, setOpen] = useState(false)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const menuId = `nav-menu-${title.toLowerCase().replace(/\s+/g, '-')}`
  const triggerId = `${menuId}-trigger`

  const handleOpen = useCallback(() => {
    if (closeTimer.current) { clearTimeout(closeTimer.current); closeTimer.current = null }
    setOpen(true)
  }, [])

  const handleClose = useCallback(() => {
    closeTimer.current = setTimeout(() => setOpen(false), 150)
  }, [])

  return (
    <div
      className="relative"
      onMouseEnter={handleOpen}
      onMouseLeave={handleClose}
    >
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        id={triggerId}
        className={`flex items-center gap-1 hover:text-blue-600 ${isActive ? "text-blue-600 font-bold" : "text-gray-700"}`}
        onClick={() => setOpen((prev) => !prev)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            setOpen((prev) => !prev)
          }
          if (e.key === 'Escape') setOpen(false)
        }}
      >
        {title}
        <svg className={`w-3 h-3 transition-transform ${open ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {/* Invisible bridge spans the gap between trigger and panel so the mouse doesn't leave the container */}
      {open && <div className="absolute left-0 right-0 top-full h-3" aria-hidden />}
      <div
        id={menuId}
        role="menu"
        aria-labelledby={triggerId}
        className={`absolute left-1/2 top-full -translate-x-1/2 pt-3 z-[9999] transition-all ${open ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none"}`}
      >
        <div className="w-56 bg-white rounded-lg shadow-xl border border-gray-100 py-2">
        {nestedSections && nestedSections.length > 0 ? (
          <ul className="list-none p-0 m-0">
            {nestedSections.map((group, groupIdx) => (
              <li key={groupIdx} role="group" aria-label={group.parentLabel} className={groupIdx > 0 ? "mt-2 pt-2 border-t border-gray-100" : ""}>
                <div className="px-5 py-2 text-xs font-semibold uppercase tracking-wider text-gray-500 cursor-default" role="presentation">
                  {group.parentLabel}
                </div>
                <ul className="list-none p-0 m-0" role="group">
                  {group.items.map((item, itemIdx) => (
                    <li key={item.path} role="none">
                      <Link
                        role="menuitem"
                        to={item.path}
                        className="block px-5 py-3 text-sm hover:bg-blue-50 hover:text-blue-600 focus:bg-blue-50 focus:text-blue-600 focus:outline-none"
                        tabIndex={open ? 0 : -1}
                      >
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        ) : (
          resolvedSections.map((section, idx) => (
            <div key={idx}>
              {idx > 0 && <div className="my-2 border-t border-gray-100" />}
              {section.label && (
                <div className="px-5 py-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
                  {section.label}
                </div>
              )}
              {section.items.map(item => (
                <Link key={item.path} to={item.path} className="block px-5 py-3 text-sm hover:bg-blue-50 hover:text-blue-600" role="menuitem">
                  {item.name}
                </Link>
              ))}
            </div>
          ))
        )}
        </div>
      </div>
    </div>
  )
}

// Mobile Dropdown: accepts flat items (Counties), sections, or nestedSections (Thematic Areas: Water/Waste parents with thematic children)
function MobileDropdown({
  title,
  items,
  sections,
  nestedSections,
  onClose,
}: {
  title: string
  items?: MenuItem[]
  sections?: MenuSection[]
  nestedSections?: NestedSection[]
  onClose: () => void
}) {
  const [open, setOpen] = useState(false)
  const [expandedParent, setExpandedParent] = useState<string | null>(null)
  const resolvedSections: MenuSection[] = sections ?? (items?.length ? [{ items }] : [])

  return (
    <div className="border-b border-gray-100 pb-4">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={`mobile-${title.toLowerCase().replace(/\s+/g, '-')}-panel`}
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between text-left py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
      >
        {title}
        <svg className={`w-5 h-5 transition-transform ${open ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div id={`mobile-${title.toLowerCase().replace(/\s+/g, '-')}-panel`} className="mt-3 ml-4 space-y-4" role="region" aria-label={title}>
          {nestedSections && nestedSections.length > 0 ? (
            <ul className="list-none p-0 m-0 space-y-3">
              {nestedSections.map((group) => (
                <li key={group.parentLabel} role="group" aria-label={group.parentLabel}>
                  <button
                    type="button"
                    aria-expanded={expandedParent === group.parentLabel}
                    onClick={() => setExpandedParent((p) => (p === group.parentLabel ? null : group.parentLabel))}
                    className="w-full flex items-center justify-between text-left py-2 text-xs font-semibold uppercase tracking-wider text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                  >
                    {group.parentLabel}
                    <svg className={`w-4 h-4 transition-transform ${expandedParent === group.parentLabel ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {expandedParent === group.parentLabel && (
                    <ul className="list-none p-0 mt-2 ml-2 space-y-2 border-l-2 border-gray-100 pl-3">
                      {group.items.map((item) => (
                        <li key={item.path}>
                          <Link to={item.path} onClick={onClose} className="block py-2 text-gray-700 hover:text-blue-600 focus:outline-none focus:text-blue-600" role="menuitem">
                            {item.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            resolvedSections.map((section, idx) => (
              <div key={idx}>
                {idx > 0 && <div className="border-t border-gray-100 pt-3 mt-3" />}
                {section.label && (
                  <div className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
                    {section.label}
                  </div>
                )}
                <div className="space-y-2">
                  {section.items.map(item => (
                    <Link key={item.path} to={item.path} onClick={onClose} className="block py-2 text-gray-700 hover:text-blue-600" role="menuitem">
                      {item.name}
                    </Link>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
