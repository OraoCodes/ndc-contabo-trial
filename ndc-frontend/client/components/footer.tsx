"use client"

export function Footer() {
    return (
        <footer className="bg-[#0B1138] text-slate-100 pt-12">
            <div className="max-w-7xl mx-auto px-4 md:px-6">
                <div>
                    <h3 className="font-semibold mb-6 text-white">NDC tracking tool for water and waste management in Kenya</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
                    {/* Brand */}

                    <div >
                        <h4 className="font-semibold mb-6 text-white uppercase text-sm">ABOUT</h4>
                        <ul className="space-y-3 text-sm">
                            <li>
                                <a href="/about-the-tool" className="hover:text-white transition-colors">
                                    About the tool
                                </a>
                            </li>
                           {/* <li>
                                <a href="#" className="hover:text-white transition-colors">
                                    Partners
                                </a>
                            </li>
                            <li>
                                <a href="#" className="hover:text-white transition-colors">
                                    FAQs
                                </a>
                            </li> */}
                        </ul>
                    </div>
                    {/* Thematic Areas */}
                    <div>
                        <h4 className="font-semibold mb-6 text-white uppercase text-sm">Thematic Areas</h4>
                        <ul className="space-y-3 text-sm">
                            <li>
                                <a href="/governance" className="hover:text-white transition-colors">
                                    Governance
                                </a>
                            </li>
                            <li>
                                <a href="/mrv" className="hover:text-white transition-colors">
                                    MRV
                                </a>
                            </li>
                            <li>
                                <a href="/mitigation" className="hover:text-white transition-colors">
                                    Mitigation
                                </a>
                            </li>
                            <li>
                                <a href="/adaptation" className="hover:text-white transition-colors">
                                    Adaptation
                                </a>
                            </li>
                            <li>
                                <a href="/finance-technology-transfer" className="hover:text-white transition-colors">
                                    Finance & Technology Transfer
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h4 className="font-semibold mb-6 text-white uppercase text-sm">Contact Us</h4>
                        <ul className="space-y-3 text-sm">
                            <li>
                                <a href="mailto:info@email.com" className="hover:text-white transition-colors">
                                    info@email.com
                                </a>
                            </li>
                            <li>
                                <a href="tel:+254254256255" className="hover:text-white transition-colors">
                                    +254 254 256 255
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom */}

            </div>
            <div className="bg-[#0A0D20] w-full  h-12 mx-auto px-4 md:px-6">
                <p className="text-sm text-slate-400">Copyright © 2025. All Rights Reserved.</p>

            </div>
        </footer>
    )
}
