"use client"

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { listThematicAreasBySector, thematicAreaSlug } from "@/lib/supabase-api";
import type { ThematicArea } from "@/lib/supabase-api";

export function Footer() {
    const [waterAreas, setWaterAreas] = useState<ThematicArea[]>([]);
    const [wasteAreas, setWasteAreas] = useState<ThematicArea[]>([]);

    useEffect(() => {
        listThematicAreasBySector()
            .then(({ water, waste }) => {
                setWaterAreas(water);
                setWasteAreas(waste);
            })
            .catch(() => {});
    }, []);

    return (
        <footer className="bg-[#0B1138] text-slate-300">
            {/* Main content */}
            <div className="max-w-6xl mx-auto px-6 py-14">
                {/* Top: title + description */}
                <div className="mb-10">
                    <h3 className="text-lg font-bold text-white leading-snug">
                        NDC Tracking Tool
                    </h3>
                    <p className="mt-1 text-sm text-slate-400 max-w-md">
                        Monitoring water and waste management progress across Kenya's 47 counties.
                    </p>
                </div>

                {/* Link columns */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-8 gap-y-8">
                    {/* About */}
                    <div>
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-4">
                            About
                        </h4>
                        <ul className="space-y-2.5">
                            <li>
                                <a
                                    href="/about-the-tool"
                                    className="text-sm text-slate-300 hover:text-white transition-colors"
                                >
                                    About the tool
                                </a>
                            </li>
                            <li>
                                <Link
                                    to="/"
                                    className="text-sm text-slate-300 hover:text-white transition-colors"
                                >
                                    Home
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/terms"
                                    className="text-sm text-slate-300 hover:text-white transition-colors"
                                >
                                    Terms
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Water Management */}
                    <div>
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-4">
                            Water Management
                        </h4>
                        <ul className="space-y-2.5">
                            {waterAreas.map((area) => (
                                <li key={area.id}>
                                    <Link
                                        to={`/thematic/${thematicAreaSlug(area)}`}
                                        className="text-sm text-slate-300 hover:text-white transition-colors"
                                    >
                                        {area.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Waste Management */}
                    <div>
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-4">
                            Waste Management
                        </h4>
                        <ul className="space-y-2.5">
                            {wasteAreas.map((area) => (
                                <li key={area.id}>
                                    <Link
                                        to={`/thematic/${thematicAreaSlug(area)}`}
                                        className="text-sm text-slate-300 hover:text-white transition-colors"
                                    >
                                        {area.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>

            {/* Divider + copyright */}
            <div className="border-t border-slate-700/50">
                <div className="max-w-6xl mx-auto px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-2">
                    <p className="text-xs text-slate-500">
                        &copy; {new Date().getFullYear()} NDC Tracking Tool. All rights reserved.
                    </p>
                    <p className="text-xs text-slate-500">
                        Republic of Kenya
                    </p>
                </div>
            </div>
        </footer>
    )
}
