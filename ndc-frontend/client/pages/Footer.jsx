// src/components/Footer.jsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { listThematicAreasBySector, thematicAreaSlug } from '../lib/supabase-api';

export default function Footer() {
    const [waterAreas, setWaterAreas] = useState([]);
    const [wasteAreas, setWasteAreas] = useState([]);

    useEffect(() => {
        listThematicAreasBySector()
            .then(({ water, waste }) => {
                setWaterAreas(water);
                setWasteAreas(waste);
            })
            .catch(() => {});
    }, []);

    const uniqueNames = new Map();
    [...waterAreas, ...wasteAreas].forEach((a) => {
        if (!uniqueNames.has(a.name)) uniqueNames.set(a.name, a);
    });
    const allAreas = Array.from(uniqueNames.values());

    return (
        <footer className="bg-gray-900 text-white py-16">
            <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-3 gap-12">
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
                    <h3 className="text-xl font-bold mb-6">WATER MANAGEMENT</h3>
                    <div className="space-y-2 text-gray-400">
                        {waterAreas.length === 0 && <p className="text-gray-500 text-sm italic">Loading…</p>}
                        {waterAreas.map((area) => (
                            <Link
                                key={area.id}
                                to={`/thematic/${thematicAreaSlug(area)}`}
                                className="block hover:text-white transition-colors"
                            >
                                {area.name}
                            </Link>
                        ))}
                    </div>
                </div>
                <div>
                    <h3 className="text-xl font-bold mb-6">WASTE MANAGEMENT</h3>
                    <div className="space-y-2 text-gray-400">
                        {wasteAreas.length === 0 && <p className="text-gray-500 text-sm italic">Loading…</p>}
                        {wasteAreas.map((area) => (
                            <Link
                                key={area.id}
                                to={`/thematic/${thematicAreaSlug(area)}`}
                                className="block hover:text-white transition-colors"
                            >
                                {area.name}
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
            <div className="text-center mt-12 text-sm text-gray-500">
                Copyright © 2025. All Rights Reserved.
            </div>
        </footer>
    );
}