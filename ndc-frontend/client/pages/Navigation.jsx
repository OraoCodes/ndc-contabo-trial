// src/components/Navigation.jsx
import React, { useState } from 'react';
import { Droplet, Menu, X, Search, ChevronDown } from 'lucide-react';

export default function Navigation() {
    const [mobileOpen, setMobileOpen] = useState(false);

    return (
        <nav className="bg-white shadow-lg sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-6">
                <div className="flex justify-between items-center h-20">
                    <div className="flex items-center">
                        <Droplet className="w-10 h-10 text-blue-600 mr-3" />
                        <div>
                            <h1 className="text-lg font-bold text-gray-800">NDC tracking tool for</h1>
                            <p className="text-sm text-gray-600">water and waste management in Kenya</p>
                        </div>
                    </div>

                    <div className="hidden md:flex items-center space-x-8">
                        <a href="#" className="font-medium hover:text-blue-600">HOME</a>
                        <div className="relative group">
                            <button className="font-medium hover:text-blue-600 flex items-center">
                                COUNTIES <ChevronDown className="ml-1 w-4 h-4" />
                            </button>
                        </div>
                        <a href="#" className="font-medium hover:text-blue-600">WATER MANAGEMENT</a>
                        <a href="#" className="font-medium hover:text-blue-600">WASTE MANAGEMENT</a>
                        <a href="#" className="font-medium hover:text-blue-600">ABOUT THE TOOL</a>
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search..."
                                className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:border-blue-600"
                            />
                            <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
                        </div>
                    </div>

                    <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden">
                        {mobileOpen ? <X className="w-8 h-8" /> : <Menu className="w-8 h-8" />}
                    </button>
                </div>

                {mobileOpen && (
                    <div className="md:hidden pb-6 space-y-3">
                        <a href="#" className="block text-lg">HOME</a>
                        <a href="#" className="block text-lg">COUNTIES</a>
                        <a href="#" className="block text-lg">WATER MANAGEMENT</a>
                        <a href="#" className="block text-lg">WASTE MANAGEMENT</a>
                        <a href="#" className="block text-lg">ABOUT THE TOOL</a>
                    </div>
                )}
            </div>
        </nav>
    );
}