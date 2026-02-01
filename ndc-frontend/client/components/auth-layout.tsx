import type React from "react"

const partners = [
    "/EU.png",
    "/PACJA.png",
    "/Friedrich.png",
    "/Civil Society.png",
    "/SCEJU.png"
];

export function AuthLayout({
    children,
    title,
    description,
}: { children: React.ReactNode; title: string; description: string }) {
    return (
        <div className="min-h-screen flex flex-col lg:flex-row">
            {/* Left Side - Water Background (Now visible full-width at the top on mobile/tablet) */}
            <div
                className="flex w-full lg:w-1/2 bg-cover bg-center relative flex-col justify-center lg:justify-between p-6 sm:p-10 lg:p-12 h-64 lg:h-auto lg:min-h-screen overflow-hidden"
                style={{ backgroundImage: "url(/background.png)", backgroundPosition: "center" }}
            >
                <div className="absolute inset-0 bg-black/30"></div>

                {/* Main Title/Description for the Tool */}
                <div className="relative z-10 text-center lg:text-left">
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white leading-tight mb-2">
                        NDC tracking tool for water and waste management in Kenya
                    </h1>
                </div>

                {/* Partners Section (Now shown at the bottom of the background block) */}
                <div className="relative z-10 mt-6 lg:mt-0 text-center lg:text-left">
                    <p className="text-sm sm:text-base lg:text-xl mb-3 opacity-90 text-white font-medium">Partners</p>
                    <div className="flex flex-wrap justify-center lg:justify-start gap-4 sm:gap-6 items-center">
                        {partners.map((logo, i) => (
                            <img
                                key={i}
                                src={logo}
                                alt="Partner logo"
                                className="h-8 sm:h-10 lg:h-14 object-contain filter brightness-125 contrast-75"
                            />
                        ))}
                    </div>
                </div>
            </div>

            {/* Right Side - Form (Always visible, now second in the flex-col order) */}
            <div className="w-full lg:w-1/2 flex items-center justify-center bg-gray-50 p-6 sm:p-10 md:p-16">
                <div className="w-full max-w-md">

                    {/* Mobile Logo for context near the form */}
                    <div className="text-center lg:hidden mb-8">
                        <img src="/ndc_logo.png" className="h-10 w-auto mx-auto" alt="Logo" />
                    </div>

                    <h2 className="text-4xl font-bold text-gray-900 mb-4">{title}</h2>
                    <p className="text-gray-600 mb-8">{description}</p>

                    {/* The main form content */}
                    {children}

                </div>
            </div>
        </div>
    )
}
