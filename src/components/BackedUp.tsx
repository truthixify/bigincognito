import React from "react"
import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import { useInView } from "react-intersection-observer"
import StarkWare from "../../public/assets/img/starkware.svg"
import StarkNet from "../../public/assets/img/starknet.png"
import OnlyDust from '../../public/assets/img/onlydust.svg'

const BackedBy: React.FC = () => {
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
    const sectionRef = useRef<HTMLElement>(null)
    const { ref, inView } = useInView({ threshold: 0.3, triggerOnce: true })

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (sectionRef.current) {
                const rect = sectionRef.current.getBoundingClientRect()
                setMousePosition({
                    x: ((e.clientX - rect.left) / rect.width) * 100,
                    y: ((e.clientY - rect.top) / rect.height) * 100,
                })
            }
        }

        const section = sectionRef.current
        if (section) {
            section.addEventListener("mousemove", handleMouseMove)
            return () => section.removeEventListener("mousemove", handleMouseMove)
        }
    }, [])

    return (
        <section
            ref={sectionRef}
            className="w-full py-20 base:max-md:py-12 border-b border-gray-600 relative overflow-hidden"
        >
            <div className="absolute inset-0 opacity-20">
                <div
                    className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-teal-900/20 transition-all duration-1000 ease-out"
                    style={{
                        background: `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, rgba(147, 51, 234, 0.1) 0%, rgba(59, 130, 246, 0.05) 35%, rgba(20, 184, 166, 0.05) 70%, transparent 100%)`,
                    }}
                />


                <div className="absolute top-10 left-10 w-20 h-20 border border-gray-700/30 rotate-45 animate-pulse" />
                <div
                    className="absolute bottom-20 right-20 w-16 h-16 border border-gray-600/20 rounded-full animate-bounce"
                    style={{ animationDuration: "3s" }}
                />
                <div
                    className="absolute top-1/2 left-1/4 w-12 h-12 bg-gradient-to-r from-gray-800/20 to-gray-700/20 rotate-12 animate-spin"
                    style={{ animationDuration: "8s" }}
                />
            </div>

            <div ref={ref} className="base:max-md:px-3 px-10 text-center relative z-10">

                <div className="mb-8 relative">
                    <h2
                        className={`text-3xl base:max-md:text-2xl tracking-wide font-lighten font-bold text-ourWhite mb-4 transition-all duration-1000 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
                    >
                        <span className="text-gray-400 text-4xl base:max-md:text-3xl">*</span>
                        <span className="bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
                            BACKED BY
                        </span>
                    </h2>
                    <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-24 h-0.5 bg-gradient-to-r from-transparent via-gray-500 to-transparent" />
                </div>

                <p
                    className={`text-gray-400 font-thin poppins-light mb-16 base:max-md:mb-12 text-lg base:max-md:text-base max-w-2xl mx-auto transition-all duration-1000 delay-200 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
                >
                    Powered by the technologies and ecosystems we believe in.
                </p>


                <div className="relative">

                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 base:max-md:w-24 base:max-md:h-24 rounded-full border-2 border-gray-600/30 backdrop-blur-sm bg-gray-900/20" />


                    <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 800 400">
                        <defs>
                            <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="rgba(156, 163, 175, 0)" />
                                <stop offset="50%" stopColor="rgba(156, 163, 175, 0.3)" />
                                <stop offset="100%" stopColor="rgba(156, 163, 175, 0)" />
                            </linearGradient>
                        </defs>


                        <path
                            d="M 200 200 Q 400 100 600 200"
                            stroke="url(#lineGradient)"
                            strokeWidth="1"
                            fill="none"
                            className={`transition-all duration-2000 delay-500 ${inView ? "opacity-100" : "opacity-0"}`}
                        />
                        <path
                            d="M 200 200 Q 400 300 600 200"
                            stroke="url(#lineGradient)"
                            strokeWidth="1"
                            fill="none"
                            className={`transition-all duration-2000 delay-700 ${inView ? "opacity-100" : "opacity-0"}`}
                        />
                    </svg>

                    <div ref={ref} className="flex flex-col md:flex-row items-center justify-center gap-12 md:gap-16 lg:gap-20">
                        {/* StarkWare Logo */}
                        <div
                            className={`group cursor-pointer transition-all duration-700 hover:scale-105 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                                }`}
                            style={{ transitionDelay: "200ms" }}
                        >
                            <div className="w-32 h-16 md:w-40 md:h-20 relative opacity-70 group-hover:opacity-100 transition-opacity duration-300">
                                <Image src={StarkWare} alt="StarkWare" fill className="object-contain" style={{ filter: "brightness(0) invert(1)" }} />
                            </div>
                        </div>

                        {/* Starknet Logo */}
                        <div
                            className={`group cursor-pointer transition-all duration-700 hover:scale-105 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                                }`}
                            style={{ transitionDelay: "400ms" }}
                        >
                            <div className="w-32 h-16 md:w-40 md:h-20 relative opacity-70 group-hover:opacity-100 transition-opacity duration-300">
                                <Image src={StarkNet} alt="Starknet" fill className="object-contain" style={{ filter: "brightness(0) invert(1)" }} />
                            </div>
                        </div>

                        {/* OnlyDust Logo */}
                        <div
                            className={`group cursor-pointer transition-all duration-700 hover:scale-105 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                                }`}
                            style={{ transitionDelay: "600ms" }}
                        >
                            <div className="w-32 h-16 md:w-40 md:h-20 relative opacity-70 group-hover:opacity-100 transition-opacity duration-300">
                                <Image src={OnlyDust} alt="OnlyDust" fill className="object-contain" />
                            </div>
                        </div>
                    </div>
                </div>


                <div
                    className={`mt-12 flex justify-center transition-all duration-1000 delay-1000 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
                >
                    <div className="flex space-x-2">
                        <div className="w-2 h-2 bg-gray-600 rounded-full animate-pulse" />
                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse" style={{ animationDelay: "0.5s" }} />
                        <div className="w-2 h-2 bg-gray-600 rounded-full animate-pulse" style={{ animationDelay: "1s" }} />
                    </div>
                </div>
            </div>

        </section>
    )
}

export default BackedBy
