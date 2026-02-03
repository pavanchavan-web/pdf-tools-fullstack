import { Helmet } from "react-helmet-async";

export default function About() {
    return (
        <main className="bg-white text-gray-800">
            <Helmet>
                {/* Title */}
                <title>
                    About ConvertZip – Free PDF & Image Tools
                </title>

                {/* Meta Description */}
                <meta
                    name="description"
                    content="Learn about ConvertZip, a platform providing fast, secure, and easy-to-use online tools to manage, convert, and compress PDF and image files."
                />

                {/* Open Graph */}
                <meta
                    property="og:title"
                    content="About ConvertZip – PDF & Image Tool Platform"
                />
                <meta
                    property="og:description"
                    content="Discover ConvertZip and our mission to make PDF and image file management simple, fast, and secure."
                />
                <meta
                    property="og:url"
                    content={window.location.href}
                />
                <meta
                    property="og:type"
                    content="website"
                />
                <meta property="og:image" content="https://convertzip.com/og/convertzip.png" />
            </Helmet>

            {/* Hero */}
            <section className="bg-gradient-to-br from-indigo-50 to-white py-24 text-center justify-center align-middle items-center flex">
                <div className="max-w-3xl">
                    <h1 className="text-4xl font-bold mb-4 ma">
                        Empowering Every User to Manage PDFs & Images — Fast, Simple, and Free
                    </h1>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        A unified online toolbox built to help individuals and teams work smarter, not harder.
                    </p>
                </div>
            </section>

            {/* Facts & Numbers */}
            <section className="py-20 px-6 text-center bg-white about-sect">
                {/* Top Text */}
                <h6 className="max-w-4xl mx-auto text-[25px] text-gray-800 leading-relaxed about-title">
                    We blend{" "}
                    <span className="inline-flex items-center gap-1 px-3 py-1 mx-1 rounded-full bg-purple-100 text-purple-600 text-[25px] font-medium">
                        ✦ Design
                    </span>
                    <span className="inline-flex items-center gap-1 px-3 py-1 mx-1 rounded-full bg-blue-100 text-blue-600 text-[25px] font-medium">
                        ✦ Technology
                    </span>
                    &{" "}
                    <span className="inline-flex items-center gap-1 px-3 py-1 mx-1 rounded-full bg-orange-100 text-orange-600 text-[25px] font-medium">
                        ✦ Intelligence
                    </span>
                    <br />
                    to build powerful, digital solutions, products, and platforms that deliver measurable, real-world impact.
                </h6>

                {/* Numbers */}
                <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 max-w-4xl mx-auto">
                    {[
                        { value: "13", label: "Powerful Tools Available" },
                        { value: "1M+", label: "Files Processed Securely" },
                        { value: "99.9%", label: "Uptime & Reliability" },
                    ].map((item, index) => (
                        <div
                            key={item.label}
                            className={`px-6 ${index !== 0 ? "sm:border-l border-gray-200" : ""
                                }`}
                        >
                            <h5 className="text-5xl font-semibold text-gray-900">
                                +{item.value}
                            </h5>
                            <p className="mt-2 text-md text-gray-500">
                                {item.label}
                            </p>
                        </div>
                    ))}
                </div>
            </section>


            {/* Our Story */}
            <section className="py-16 px-6 max-w-4xl mx-auto">
                <h2 className="text-3xl font-semibold mb-4 text-center">
                    Our Journey
                </h2>
                <p className="text-lg text-gray-600 text-center">
                    Born out of frustration with scattered tools and poor user experiences, we built a unified platform where powerful PDF and image utilities live under one roof — intuitive, secure, and free for everyone.
                </p>
            </section>

            {/* What We Do */}
            <section className="py-16 px-3 relative bg-gradient-to-t from-blue-50 to-white">
                <h2 className="text-3xl font-semibold text-center mb-10">
                    What We Offer
                </h2>

                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-5 gap-4 max-w-6xl mx-auto ">
                    {[
                        {
                            title: "Convert files between formats",
                            bg: "bg-purple-100",
                        },
                        {
                            title: "Compress without quality loss",
                            bg: "bg-blue-100",
                        },
                        {
                            title: "Edit PDFs instantly",
                            bg: "bg-orange-100",

                        },
                        {
                            title: "Secure sensitive documents",
                            bg: "bg-green-100",
                        },
                        {
                            title: "Handle images with ease",
                            bg: "bg-red-100",
                        },
                    ].map((item) => (
                        <div
                            key={item.title}
                            className={`rounded-xl p-10 text-left ${item.bg}`}
                        >
                            <p className="text-md font-medium" >
                                {item.title}
                            </p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Values / Principles */}
            <section className="py-20 px-3 bg-white">
                {/* Heading */}
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-semibold text-gray-900">
                        Where innovation <br />
                        meets <span className="italic font-light">aesthetics</span>
                    </h2>
                </div>

                {/* Service Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-5 gap-4 max-w-6xl mx-auto mb-12">
                    {[
                        {
                            title: "Security first — We protect your files.",
                            bg: "bg-purple-100",
                            text: "text-purple-600",
                            icon: "💡",
                        },
                        {
                            title: "No barriers — No sign-ups. No installs.",
                            bg: "bg-blue-100",
                            text: "text-blue-600",
                            icon: "📣",
                        },
                        {
                            title: "Fast & reliable — Tools built for performance.",
                            bg: "bg-orange-100",
                            text: "text-orange-600",
                            icon: "🎨",
                        },
                        {
                            title: "User-friendly — Designed for everyone.",
                            bg: "bg-green-100",
                            text: "text-green-600",
                            icon: "📊",
                        },
                        {
                            title: "Accessible — Built for all users and devices",
                            bg: "bg-red-100",
                            text: "text-red-600",
                            icon: "💻",
                        },
                    ].map((item) => (
                        <div
                            key={item.title}
                            className={`rounded-xl p-10 text-left ${item.bg}`}
                        >
                            <div className="text-[30px] mb-3">{item.icon}</div>
                            <p className={`text-md font-medium ${item.text}`}>
                                {item.title}
                            </p>
                        </div>
                    ))}
                </div>

                <div className="max-w-7xl mx-auto px-1 md:px-[3.5rem]">
                    <div className="rounded-3xl border bg-gray-900 text-white p-8 flex flex-col md:flex-row justify-between gap-6 align-middle items-center">
                        <div>
                            <h3 className="mb-2 text-white">
                                Start using free tools now
                            </h3>
                            <p className="">
                                No signup. Files auto-deleted. 100% secure.
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <button onClick={() => (window.location.href = "/contact-us")}
                                className="bg-white text-gray-900 px-5 py-2 rounded-full text-sm font-medium hover:bg-gray-100 transition">
                                Let’s Collaborate
                            </button>
                            <button onClick={() => document.getElementById("tools")?.scrollIntoView({ behavior: "smooth" })}
                                className="border border-white text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-white hover:text-gray-900 transition">
                                Explore Tools →
                            </button>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}
