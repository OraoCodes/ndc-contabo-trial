"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { HeroBanner } from "@/components/hero-banner"
import { Link } from "react-router-dom"

export default function TermsPage() {
  return (
    <main>
      <Header currentPage="terms" />

      <HeroBanner
        title="Terms and Conditions"
        description="Terms and Conditions for the NDC County Data Portal. Please read carefully before using the Portal."
      />

      <section className="py-16 md:py-24 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 md:px-6">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 md:p-12 text-gray-700 space-y-8">
            <p className="text-sm text-gray-500">
              Last updated: December 2025
            </p>

            <p>
              Welcome to the NDC County Data Portal (“the Portal”). By registering for an account, logging in, uploading data, or using any part of this system, you (“the User”) agree to be bound by the following Terms and Conditions. Please read them carefully before proceeding.
            </p>

            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">1. Definitions</h2>
              <ul className="list-disc pl-6 space-y-1">
                <li><strong>“Portal”</strong> refers to the NDC County Data Platform, its interfaces, databases, tools, and services.</li>
                <li><strong>“User”</strong> refers to any individual or institution creating an account, submitting data, or accessing the Portal.</li>
                <li><strong>“Administrators / Developers”</strong> refers to the system owners, designers, technical teams, and authorized personnel responsible for managing the Portal.</li>
                <li><strong>“Data”</strong> includes any information users upload, submit, generate, or store within the Portal.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">2. Acceptance of Terms</h2>
              <p className="mb-2">By accessing or using the Portal, you confirm that you:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Have read and understood these Terms.</li>
                <li>Agree to comply with all applicable laws and institutional policies.</li>
                <li>Are authorized by your county, institution, or employer to submit data to this Portal.</li>
              </ul>
              <p className="mt-2">If you do not agree to these Terms, you must not use the Portal.</p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">3. Purpose of the Portal</h2>
              <p className="mb-2">The Portal is designed exclusively for:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Collecting, validating, and reporting climate-related county data</li>
                <li>Supporting national NDC tracking, reporting, and transparency mechanisms</li>
                <li>Facilitating structured Monitoring, Reporting, and Verification (MRV)</li>
              </ul>
              <p className="mt-2">It may not be used for any purpose outside its intended mandate.</p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">4. User Responsibilities</h2>
              <p className="mb-2">Users agree to:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Provide accurate, complete, and verifiable data.</li>
                <li>Use the Portal only for official county or institutional work.</li>
                <li>Maintain the confidentiality of their login credentials.</li>
                <li>Report any unauthorized access or suspected breach immediately.</li>
                <li>Ensure that uploaded data does not violate any copyright, confidentiality agreements, or legal restrictions.</li>
                <li>Comply with data protection and privacy requirements when handling personal or sensitive data.</li>
              </ul>
              <p className="mt-2">Users are fully responsible for any activity conducted under their account.</p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">5. Data Submission and Ownership</h2>
              <ul className="list-disc pl-6 space-y-1">
                <li>Data submitted to the Portal remains the property of the respective county or institution that generated it.</li>
                <li>By submitting data, users grant the Portal Administrators a non-exclusive, royalty-free license to use, store, process, and analyze the data for national climate reporting and research purposes.</li>
                <li>The Portal Administrators may aggregate or anonymize data for national-level reporting, policy development, or system analytics.</li>
                <li>The Portal Administrators do not claim ownership of county-generated data.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">6. Data Accuracy and Liability</h2>
              <ul className="list-disc pl-6 space-y-1">
                <li>Users are solely responsible for ensuring the accuracy and reliability of the data they upload.</li>
                <li>The Portal Administrators do not guarantee the accuracy, completeness, or validity of any submitted data.</li>
                <li>The Portal Administrators shall not be liable for any damages, decisions, or actions taken based on data submitted by users.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">7. Privacy and Data Protection</h2>
              <p className="mb-2">The Portal adheres to recognized privacy and data protection principles, including:</p>
              <ul className="list-disc pl-6 space-y-1 mb-4">
                <li>Lawfulness, fairness, and transparency</li>
                <li>Purpose limitation</li>
                <li>Data minimization</li>
                <li>Accuracy</li>
                <li>Storage limitation</li>
                <li>Integrity and confidentiality</li>
              </ul>
              <p className="mb-2">The Portal may collect limited metadata such as:</p>
              <ul className="list-disc pl-6 space-y-1 mb-4">
                <li>Login timestamps</li>
                <li>IP addresses</li>
                <li>System activity logs</li>
                <li>User actions within the Portal</li>
              </ul>
              <p className="mb-2">This information is used solely for security, audit trails, and system improvements.</p>
              <p className="mb-2">The Portal Administrators will not:</p>
              <ul className="list-disc pl-6 space-y-1 mb-2">
                <li>Sell user data</li>
                <li>Share personal information with unauthorized third parties</li>
                <li>Use data for advertising or commercial profiling</li>
              </ul>
              <p>For more details, refer to the Portal’s Privacy Policy.</p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">8. Security Measures</h2>
              <p className="mb-2">The Portal uses reasonable technical and organizational security measures to protect data, including:</p>
              <ul className="list-disc pl-6 space-y-1 mb-4">
                <li>Authentication and access controls</li>
                <li>Encryption where applicable</li>
                <li>Audit logs</li>
                <li>Regular system updates and monitoring</li>
              </ul>
              <p className="mb-2">However, no system is completely secure. Users accept that:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>The Portal Administrators cannot guarantee absolute protection against cyber threats</li>
                <li>They are not liable for breaches caused by factors beyond their control (e.g., user negligence, force majeure events, or third-party attacks)</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">9. Acceptable Use Policy</h2>
              <p className="mb-2">Users must NOT:</p>
              <ul className="list-disc pl-6 space-y-1 mb-4">
                <li>Attempt to hack, disable, or disrupt the Portal</li>
                <li>Introduce malware or harmful code</li>
                <li>Misrepresent data or impersonate other users</li>
                <li>Use the Portal for political, commercial, or personal activities</li>
                <li>Share restricted information without authorization</li>
                <li>Upload false, misleading, or fraudulent information</li>
              </ul>
              <p>Violation of these conditions may result in account suspension, data removal, or legal action.</p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">10. Intellectual Property</h2>
              <p className="mb-2">All Portal content, including:</p>
              <ul className="list-disc pl-6 space-y-1 mb-2">
                <li>Software</li>
                <li>Design elements</li>
                <li>Analytics dashboards</li>
                <li>User interface components</li>
                <li>Documentation</li>
              </ul>
              <p>…is the intellectual property of the Portal Administrators or its licensed partners.</p>
              <p className="mt-2">Users may not copy, reproduce, distribute, or modify Portal content without prior written consent.</p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">11. System Availability</h2>
              <p className="mb-2">The Portal is provided “as is” and “as available”, without guarantees of uninterrupted service.</p>
              <p className="mb-2">Maintenance, updates, or technical faults may cause temporary downtime.</p>
              <p className="mb-2">The Portal Administrators are not liable for:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Losses caused by system downtime</li>
                <li>Inability to access or submit data</li>
                <li>Technical failures or data transmission errors</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">12. Limitation of Liability</h2>
              <p className="mb-2">To the maximum extent permitted by law, the Portal Administrators:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Are not responsible for direct, indirect, incidental, or consequential damages</li>
                <li>Are not liable for errors, omissions, or delays in system performance</li>
                <li>Are not liable for actions taken based on system outputs or reported data</li>
                <li>Are not liable for any unauthorized access beyond their reasonable control</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">13. Termination of Access</h2>
              <p className="mb-2">The Portal Administrators may suspend or terminate a user’s access if:</p>
              <ul className="list-disc pl-6 space-y-1 mb-2">
                <li>These Terms are violated</li>
                <li>Invalid or fraudulent data is submitted</li>
                <li>Unauthorized access is detected</li>
                <li>Misuse or system abuse is identified</li>
              </ul>
              <p>Counties or institutions may request account deletion in writing.</p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">14. Amendments</h2>
              <ul className="list-disc pl-6 space-y-1">
                <li>These Terms may be updated periodically.</li>
                <li>Users will be notified of significant updates via the Portal dashboard or email.</li>
                <li>Continued use of the Portal after updates constitutes acceptance of the new Terms.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">15. Governing Law</h2>
              <p className="mb-2">These Terms shall be governed by and interpreted in accordance with:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Applicable national laws in Kenya</li>
                <li>Relevant data protection statutes</li>
                <li>Public sector ICT regulations</li>
              </ul>
              <p className="mt-2">Any disputes shall be resolved through the appropriate administrative or legal frameworks.</p>
            </div>

            <div className="pt-6 border-t border-gray-200">
              <Link
                to="/register"
                className="text-blue-600 hover:underline font-medium"
              >
                ← Back to registration
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
