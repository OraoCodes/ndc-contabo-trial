// src/components/Footer.jsx
import React from 'react';

export default function Footer() {
    return (
        <footer className="bg-gray-900 text-white py-16">
            <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-12">
                <div>
                    <h3 className="text-xl font-bold mb-6">NDC tracking tool for water and waste management in Kenya</h3>
                    <div className="space-y-2 text-gray-400">
                        <p className="font-medium">ABOUT</p>
                        <p>About the tool</p>
                        <p>Partners</p>
                        <p>FAQs</p>
                    </div>
                </div>
                <div>
                    <h3 className="text-xl font-bold mb-6">THEMATIC AREAS</h3>
                    <div className="space-y-2 text-gray-400">
                        <p>Governance</p>
                        <p>MRV</p>
                        <p>Mitigation</p>
                        <p>Adaptation</p>
                        <p>Finance & Technology Transfer</p>
                    </div>
                </div>
            </div>
            <div className="text-center mt-12 text-sm text-gray-500">
                Copyright © 2025. All Rights Reserved.
            </div>
        </footer>
    );
}