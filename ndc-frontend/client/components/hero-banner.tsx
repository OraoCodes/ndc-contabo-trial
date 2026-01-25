"use client"

interface HeroBannerProps {
    title: string
    description: string
    backgroundImage?: string
}

export function HeroBanner({ title, description, backgroundImage }: HeroBannerProps) {
    return (
        <div className="relative h-64 md:h-80 bg-slate-900 text-white overflow-hidden">
            {/* Background pattern */}
            {/* <div className="absolute inset-0   z-10" /> */}
            <div
                className="absolute inset-0 h-100 opacity-90"
                style={{
                    backgroundImage: `url('/background.png')`,
                    backgroundSize: "cover",
                }}
            />

            <div className="relative z-20 max-w-7xl mx-auto px-4 md:px-6 h-full flex flex-col justify-center">
                <h1 className="text-4xl md:text-5xl font-bold mb-4 text-pretty">{title}</h1>
                <p className="text-lg text-slate-200 max-w-5xl">{description}</p>
            </div>
        </div>
    )
}
