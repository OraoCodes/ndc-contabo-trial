"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { HeroBanner } from "@/components/hero-banner"

export default function AboutToolPage() {
  return (
    <main>
      <Header currentPage="about-the-tool" />

      <HeroBanner
        title="About the Index"
        description="The Water & Waste Management NDC Index is a web-based monitoring and evaluation platform designed to track how effectively counties in Kenya are implementing their Nationally Determined Contributions (NDCs) in the water and waste management sectors. These sectors are critical for climate resilience, public health, and low-carbon development — yet often overlooked in broader NDC tracking."
      />

      {/* Main Content: Methodology Table */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Generation of the NDC Implementation Index
            </h2>
            <p className="text-lg text-gray-600 max-w-4xl mx-auto">
              The Index measures performance across five thematic pillars using practical, verifiable indicators.
              Each pillar contributes to the overall score with specific weights reflecting its importance.
            </p>
          </div>

          {/* Responsive Table Container */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm md:text-base">
                <thead>
                  <tr className="bg-white text-black">
                    <th className="px-6 py-5 text-left  uppercase tracking-wider">Key Component</th>
                    <th className="px-6 py-5 text-left border uppercase tracking-wider">Scoring Indicators</th>
                    <th className="px-6 py-5 text-center border uppercase tracking-wider w-32">Format</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">

                  {/* Governance */}
                  <tr className="bg-emerald-50 border">
                    <td rowSpan={6} className="px-6 py-8 border align-top font-bold text-blue-900 w-80">
                      Governance<br />
                      <span className="text-sm font-normal text-blue-700">(Weight: 30%)</span>
                      <p className="mt-2 text-sm font-normal text-gray-700">
                        Assesses legal frameworks, institutional capacity, coordination mechanisms, and policy alignment with climate goals.
                      </p>
                    </td>
                    <td className="px-6 py-4">Existence of relevant sector policy aligned with NDCs, county action plan or sectoral climate strategy, institution involved in climate governance</td>
                    <td className="px-6 py-4 text-center border font-medium text-gray-800">Yes/No</td>
                  </tr>
                  {[
                    "% of staff trained in climate-related planning",
                    "Inclusion of climate targets in county performance contracts",
                    "Inclusion of climate goals into County Integrated Development Plan (CIDP)",
                    "Stakeholder participation mechanism established (public forums, workshops)",
                    "Coordination mechanism established (committees, MoUs)"
                  ].map((indicator, i) => (
                    <tr key={i} className="hover:bg-gray-50 border *:transition-colors">
                      <td className="px-6 py-4">{indicator}</td>
                      <td className="px-6 py-4 text-center border font-medium text-gray-800">
                        {indicator.includes("%") ? "%" : "Yes/No"}
                      </td>
                    </tr>
                  ))}

                  {/* MRV */}
                  <tr className="bg-emerald-50 border">
                    <td rowSpan={6} className="px-6 py-8 align-top font-bold text-emerald-900 w-80">
                      MRV (Monitoring, Reporting & Verification)<br />
                      <span className="text-sm font-normal text-emerald-700">(Weight: 20%)</span>
                      <p className="mt-2 text-sm font-normal text-gray-700">
                        Measures data availability, quality, tracking systems, and reporting mechanisms to ensure transparency.
                      </p>
                    </td>
                    <td className="px-6 py-4 border">Existence of MRV system for NDC tracking</td>
                    <td className="px-6 py-4 text-center font-medium text-gray-800">Yes/No</td>
                  </tr>
                  {[
                    { text: "Frequency of data updates", format: "Annually/Monthly" },
                    { text: "% of indicators with available data", format: "%" },
                    { text: "Sector emission inventories available", format: "Yes/No" },
                    { text: "County submits climate reports to national MRV system", format: "Yes/No" },
                    { text: "Verification mechanism in place", format: "Yes/No" }
                  ].map((item, i) => (
                    <tr key={i} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 border py-4">{item.text}</td>
                      <td className="px-6 py-4 border text-center font-medium text-gray-800">{item.format}</td>
                    </tr>
                  ))}

                  {/* Mitigation */}
                  <tr className="bg-amber-50 border">
                    <td rowSpan={7} className="px-6 py-8 align-top font-bold text-amber-900 w-80">
                      Mitigation<br />
                      <span className="text-sm font-normal text-amber-700">(Weight: 20%)</span>
                      <p className="mt-2 text-sm font-normal text-gray-700">
                        Actions that reduce greenhouse gas emissions: renewable energy, efficiency, circular economy, methane capture.
                      </p>
                    </td>
                    <td className="px-6 border py-4">GHG emission reduction target exists</td>
                    <td className="px-6 py-4 text-center border font-medium text-gray-800">Yes/No</td>
                  </tr>
                  {[
                    "Annual GHG reduction achieved (%)",
                    "Renewable energy share in sector",
                    "Waste diverted from landfill",
                    "% of climate projects focused on mitigation",
                    "Use of methane capture systems (e.g., biogas, flaring)",
                    "Circular economy initiatives adopted"
                  ].map((indicator, i) => (
                    <tr key={i} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 border py-4">{indicator}</td>
                      <td className="px-6 py-4 border text-center font-medium text-gray-800">
                        {indicator.includes("%") ? "%" : "Yes/No"}
                      </td>
                    </tr>
                  ))}

                  {/* Adaptation & Resilience */}
                  <tr className="bg-purple-50">
                    <td rowSpan={6} className="px-6 py-8 align-top border-t font-bold text-purple-900 w-80">
                      Adaptation & Resilience<br />
                      <span className="text-sm font-normal text-purple-700">(Weight: 15%)</span>
                      <p className="mt-2 text-sm font-normal text-gray-700">
                        Preparedness for climate impacts: water stress, floods, droughts, and support for vulnerable communities.
                      </p>
                    </td>
                    <td className="px-6 border py-4">Climate risk assessment conducted</td>
                    <td className="px-6 border py-4 text-center font-medium text-gray-800">Yes/No</td>
                  </tr>
                  {[
                    "Climate risk assessment conducted",
                    "% population with climate-resilient infrastructure access",
                    "Number of early warning systems operational",
                    "Ecosystem restoration area covered",
                    "% of vulnerable communities supported",
                    
                  ].map((indicator, i) => (
                    <tr key={i} className="hover:bg-gray-50 border-t transition-colors">
                      <td className="px-6 border-l py-4">{indicator}</td>
                      <td className="px-6 py-4 text-center border-l font-medium text-gray-800">
                        {indicator.includes("Number") ? "Count" :
                         indicator.includes("area") ? "Hectares" :
                         indicator.includes("%") ? "%" : "Yes/No"}
                      </td>
                    </tr>
                  ))}

                  {/* Finance & Resource Mobilization */}
                  <tr className="bg-rose-50">
                    <td rowSpan={8} className="px-6 py-8 align-top border-t font-bold text-rose-900 w-80">
                      Finance & Resource Mobilization<br />
                      <span className="text-sm font-normal text-rose-700">(Weight: 15%)</span>
                      <p className="mt-2 text-sm font-normal text-gray-700">
                        Tracks funding availability, climate budget allocation, access to finance, PPPs, and cost recovery.
                      </p>
                    </td>
                    <td className="px-6 border py-4">Climate budget line exists</td>
                    <td className="px-6 border py-4 text-center font-medium text-gray-800">Yes/No</td>
                  </tr>
                  {[
                   
                    { text: "Disaster risk reduction budget allocation", format: "KES" },
                    { text: "% of county budget allocated to climate actions", format: "%" },
                    { text: "Amount of climate finance mobilized (donors, PPPs)", format: "KES" },
                    { text: "Access to international climate finance (GCF, AF, etc.)", format: "Yes/No" },
                    { text: "Private sector participation in climate action", format: "Yes/No" },
                    { text: "Budget absorption rate (allocated vs. spent)", format: "%" },
                    { text: "Financial reporting system aligned with NDC tracking", format: "Yes/No" }
                  ].map((item, i) => (
                    <tr key={i} className="hover:bg-gray-50 border-t transition-colors">
                      <td className="px-6 border-l py-4">{item.text}</td>
                      <td className="px-6 py-4 text-center border-l font-medium text-gray-800">{item.format}</td>
                    </tr>
                  ))}

                </tbody>
              </table>
            </div>
          </div>

          {/* Legend / Weight Summary */}
          <div className="mt-12 bg-blue-900 text-black rounded-2xl p-8 text-center">
            <h3 className="text-2xl font-bold mb-6">Overall Index Calculation</h3>
            <p className="text-lg leading-relaxed max-w-4xl mx-auto">
              <strong>Index Score = (Governance × 30%) + (MRV × 20%) + (Mitigation × 20%) + (Adaptation × 15%) + (Finance × 15%)</strong>
            </p>
            <div className="mt-8 grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
              <div><strong>&lt;40</strong> → Poor <span className="inline-block w-4 h-4 bg-red-500 rounded ml-2"></span></div>
              <div><strong>40–54</strong> → Average <span className="inline-block w-4 h-4 bg-yellow-500 rounded ml-2"></span></div>
              <div><strong>55–69</strong> → Good <span className="inline-block w-4 h-4 bg-cyan-500 rounded ml-2"></span></div>
              <div><strong>70–79</strong> → Satisfactory <span className="inline-block w-4 h-4 bg-blue-600 rounded ml-2"></span></div>
              <div><strong>80+</strong> → Excellent <span className="inline-block w-4 h-4 bg-green-600 rounded ml-2"></span></div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}