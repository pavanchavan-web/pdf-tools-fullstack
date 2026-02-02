import { useRef, useState } from "react";
import emailjs from "@emailjs/browser";

export default function Contact() {
    const formRef = useRef();
    const [status, setStatus] = useState("");
    const [loading, setLoading] = useState(false);
    const [openIndex, setOpenIndex] = useState(0);

    const sendEmail = (e) => {
        e.preventDefault();
        setLoading(true);
        setStatus("");

        emailjs
            .sendForm(
                "service_atu04dg",
                "template_1pzxiua",
                formRef.current,
                "42-VJQ5ymoVthnOtJ"
            )
            .then(
                () => {
                    setStatus("success");
                    setLoading(false);
                    formRef.current.reset();
                },
                () => {
                    setStatus("error");
                    setLoading(false);
                }
            );
    };

    const faqs = [
        {
            q: "Are these tools free to use?",
            a: "Yes. All tools on our website are completely free to use. You can compress, convert, edit, and secure files without any hidden charges or subscriptions.",
        },
        {
            q: "Do I need to create an account?",
            a: "No signup required. You can use all tools instantly without registering or logging in.",
        },
        {
            q: "Is my data safe and secure?",
            a: "Absolutely. All uploaded files are processed securely and automatically deleted from our servers after processing to ensure your privacy.",
        },
        {
            q: "Are my files stored on your servers?",
            a: "No. Files are temporarily processed and then permanently removed. We do not store, view, or share your files.",
        },
        {
            q: "Can I use these tools on mobile devices?",
            a: "Yes. Our tools are fully responsive and work smoothly on mobile, tablet, and desktop devices.",
        },
        {
            q: "Can I use these tools for business or commercial purposes?",
            a: "Yes. You can use our tools for both personal and professional use without restrictions.",
        },
    ]

    return (
        <div>
            <Helmet>
                {/* Basic SEO */}
                <title>
                    Contact us to resolve all your questions about using ConvertZip tools to manage PDF files.
                </title>

                <meta
                    name="description"
                    content="Contact us for help and answers to all your questions about ConvertZip PDF management tools.
"
                />
                <meta
                    name="keywords"
                    content="merge pdf, split pdf, compress pdf, image converter, jpg to pdf, png to pdf, webp converter, avif converter, free online tools, jpg to pdf, pdfcompress, image to pdf, pdf to image"
                />
            </Helmet>
            
            <section className="relative min-h-screen bg-gradient-to-br from-indigo-50 via-white to-orange-50 py-20" id="contact">
                <div className="max-w-4xl mx-auto px-4">

                    {/* ================= HERO ================= */}
                    <div className="text-center mb-12">
                        <h3 className="text-gray-600 font-normal mb-5">Get in touch</h3>
                        <h1 className="mb-20">Love to hear from you,</h1>
                    </div>

                    {/* ================= FORM CARD ================= */}
                    <div className="bg-white rounded-2xl shadow-xl p-8 mb-20">
                        <form
                            ref={formRef}
                            onSubmit={sendEmail}
                            className="grid grid-cols-1 md:grid-cols-2 gap-6"
                        >
                            <Input label="First name" name="first_name" placeholder="John" />
                            <Input label="Last name" name="last_name" placeholder="Doe" />

                            <Input
                                label="Email"
                                name="email"
                                type="email"
                                placeholder="you@example.com"
                            />
                            <Input label="Subject" name="subject" placeholder="How can we help?" />

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium mb-2">
                                    Message
                                </label>
                                <textarea
                                    name="message"
                                    rows="4"
                                    required
                                    className="w-full rounded-lg border border-gray-200 px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                    placeholder="Write your message here..."
                                />
                            </div>

                            <div className="md:col-span-2 flex items-center gap-4">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="inline-flex items-center gap-2 bg-gray-900 text-white px-6 py-3 rounded-full hover:bg-gray-800 transition disabled:opacity-60"
                                >
                                    {loading ? "Sending..." : "Send message →"}
                                </button>

                                {status === "success" && (
                                    <span className="text-green-600 text-sm">
                                        Message sent successfully!
                                    </span>
                                )}
                                {status === "error" && (
                                    <span className="text-red-600 text-sm">
                                        Failed to send message. Try again.
                                    </span>
                                )}
                            </div>
                        </form>
                    </div>

                    {/* ================= FAQ ================= */}
                    <div className="mx-20">
                        <div className="text-center mb-10">
                            <h2 className="mb-2">Got questions?</h2>
                            <p className="text-gray-600">We’ve got answers</p>
                        </div>
                        {/* FAQ List */}
                        <div className="">
                            {faqs.map((faq, i) => {
                                const isOpen = openIndex === i;

                                return (
                                    <div key={i} className="p-5 mb-5 border rounded-md bg-gray-50">
                                        <button
                                            onClick={() => setOpenIndex(isOpen ? null : i)}
                                            className="w-full flex items-center justify-between text-left"
                                        >
                                            <span className="font-medium text-[20px]">
                                                {faq.q}
                                            </span>
                                            <span className="faqicons">
                                                {isOpen ? "×" : "+"}
                                            </span>
                                        </button>

                                        {isOpen && (
                                            <p className="mt-4 max-w-3xl">
                                                {faq.a}
                                            </p>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}

/* ================= INPUT COMPONENT ================= */
function Input({ label, name, placeholder, type = "text" }) {
    return (
        <div>
            <label className="block text-sm font-medium mb-2">{label}</label>
            <input
                type={type}
                name={name}
                required
                placeholder={placeholder}
                className="w-full rounded-lg border border-gray-200 px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
        </div>
    );
}

