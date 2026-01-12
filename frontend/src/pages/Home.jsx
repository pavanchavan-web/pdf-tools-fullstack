import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import MergePDFs from "../assets/tools/1.svg";
import SplitPDFs from "../assets/tools/3.svg";
import CompressPDFs from "../assets/tools/2.svg";
import Image2PDFs from "../assets/tools/10.svg";
import ImageConverter from "../assets/tools/8.svg";
import ImageCompressor from "../assets/tools/14.svg";
import ExtractImages from "../assets/tools/4.svg";
import Convert2PNG from "../assets/tools/12.svg";
import Convert2AVIF from "../assets/tools/13.svg";
import Convert2GIF from "../assets/tools/16.svg";
import Convert2SVG from "../assets/tools/15.svg";
import Convert2WEBP from "../assets/tools/10.svg";
import Convert2JPEG from "../assets/tools/11.svg";
import BG from "../assets/bg.webp";
import HeroSection from "@/components/HeroSection";

export default function Home() {
  const [openIndex, setOpenIndex] = useState(0);

  const tools = [
    {
      title: "Merge PDF",
      desc: "Merge PDF files online into one document in seconds. Fast, secure, and easy PDF combiner with no quality loss.",
      category: "pdf",
      keywords: "merge pdf, combine pdf, join pdf files",
      icon: MergePDFs,
      path: "/merge-pdf",
      categories: ["PDF Tools"],
    },
    {
      title: "Split PDF",
      desc: "Split PDF pages easily online. Extract specific pages or divide large PDFs into smaller files instantly.",
      category: "pdf",
      keywords: "split pdf, separate pdf pages, pdf page splitter",
      icon: SplitPDFs,
      path: "/split-pdf",
      categories: ["PDF Tools"],
    },
    {
      title: "Compress PDF",
      desc: "Compress PDF files online to reduce file size without losing quality. Perfect for sharing, email, and uploads.",
      category: "pdf",
      keywords: "compress pdf, reduce pdf size, pdf optimizer",
      icon: CompressPDFs,
      path: "/compress-pdf",
      categories: ["PDF Tools"],
    },
    {
      title: "Image to PDF",
      desc: "Convert images to PDF online. Turn JPG, PNG, and other image formats into a single high-quality PDF file.",
      category: "pdf",
      keywords: "image to pdf, jpg to pdf, png to pdf",
      icon: Image2PDFs,
      path: "/image-to-pdf",
      categories: ["PDF Tools"],
    },
    {
      title: "Extract Images from PDF",
      desc: "Extract images from PDF files online in original quality. Download all embedded images in one click.",
      category: "pdf",
      keywords: "extract images from pdf, pdf image extractor",
      icon: ExtractImages,
      path: "/pdf-image-extractor",
      categories: ["PDF Tools"],
    },
    {
      title: "Image Converter",
      desc: "Convert images online between JPG, PNG, WEBP, AVIF, and more. Fast, free, and high-quality image converter.",
      category: "image",
      keywords: "image converter, jpg png webp avif converter",
      icon: ImageConverter,
      path: "/image-converter",
      categories: ["Image Convert", "Image Tools"],
    },
    {
      title: "AI Image Compressor",
      desc: "AI image compressor that reduces image size while preserving quality. Perfect for web, SEO, and performance.",
      category: "image",
      keywords: "ai image compressor, reduce image size, image optimization",
      icon: ImageCompressor,
      path: "/image-compressor",
      categories: ["Image Compress", "Image Tools"],
    },
    {
      title: "Convert to WEBP",
      desc: "Convert images to WEBP format online in bulk. Reduce image size with superior quality for faster websites.",
      category: "image",
      keywords: "webp converter, convert to webp",
      icon: Convert2WEBP,
      path: "/convert-to-webp",
      categories: ["Image Convert", "Image Tools"],
    },
    {
      title: "Convert to PNG",
      desc: "Convert images to PNG format online with transparency support. High-quality PNG converter for all formats.",
      category: "image",
      keywords: "png converter, convert to png",
      icon: Convert2PNG,
      path: "/convert-to-png",
      categories: ["Image Convert", "Image Tools"],
    },
    {
      title: "Convert to JPEG",
      desc: "Convert images to JPEG format online. Optimize photos for web, email, and storage with minimal file size.",
      category: "image",
      keywords: "jpeg converter, convert to jpeg, jpg converter",
      icon: Convert2JPEG,
      path: "/convert-to-jpeg",
      categories: ["Image Convert", "Image Tools"],
    },
    {
      title: "Convert to AVIF",
      desc: "Convert images to AVIF format online for next-gen compression. Smaller files, better quality, faster loading.",
      category: "image",
      keywords: "avif converter, convert to avif",
      icon: Convert2AVIF,
      path: "/convert-to-avif",
      categories: ["Image Convert", "Image Tools"],
    },
    {
      title: "SVG to Others",
      desc: "Convert SVG to others images format online. Create scalable, lightweight vector graphics for web and design use.",
      category: "image",
      keywords: "svg converter, convert to svg",
      icon: Convert2SVG,
      path: "/convert-to-svg",
      categories: ["Image Convert", "Image Tools"],
    },
    {
      title: "Convert to GIF",
      desc: "Convert images to GIF format online. Create lightweight GIFs for animations, icons, and quick sharing.",
      category: "image",
      keywords: "gif converter, convert to gif",
      icon: Convert2GIF,
      path: "/convert-to-gif",
      categories: ["Image Convert", "Image Tools"],
    },
  ];


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

  useEffect(() => {
    document.title = "Free PDF & Image Tools Online";
  }, []);

  const categories = [
    "All",
    "Image Tools",
    "PDF Tools",
    "Image Compress",
    "Image Convert",

  ];

  const [activeCategory, setActiveCategory] = useState("All");

  const filteredTools =
    activeCategory === "All"
      ? tools
      : tools.filter((tool) => tool.categories?.includes(activeCategory));


  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-gray-800">
      {/* ================= HERO ================= */}
      <section className="relative bg-gradient-to-b from-blue-50 to-orange-50 py-[7rem] text-center">
        <h1 className="leading-tight">
          All the {" "}
          <span className="text-indigo-600 font-bold">
            PDF & Image
          </span> Tools You Need <br />
          <span className="font-serif italic">Fast, Secure & Free</span>
        </h1>

        <p className="max-w-2xl mx-auto mt-6">
          Use our free online PDF tools to merge, split, compress,
          convert, extract images, and enjoy AI-powered image compression
          — right in your browser.
        </p>

        <div className="mt-8 flex justify-center gap-4">
          <button className="btn-primary-Custom text-white px-6 py-3 rounded-full hover:bg-blue-900 hover:shadow-md"
            onClick={() => document.getElementById("tools")?.scrollIntoView({ behavior: "smooth" })}>
            Explore All Tools
          </button>
        </div>
      </section>

      <HeroSection />

      {/* ================= TOOLS GRID ================= */}
      <section id="tools" className="py-20 relative bg-gradient-to-b from-orange-50 to-white">
        <div className="max-w-7xl mx-auto px-1 md:px-6">
          <h2 className="mb-2 text-center">
            Popular Free Tools
          </h2>
          <p className=" mb-6 text-center">
            Secure, fast and easy-to-use PDF & image utilities.
          </p>

          {/* ================= FILTER TABS ================= */}
          <div className="mb-10 overflow-x-auto">
            <div className="flex gap-3 justify-center min-w-max px-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`
          px-5 py-2 rounded-full text-md font-medium whitespace-nowrap
          border transition-all
          ${activeCategory === cat
                      ? "bg-gray-900 text-white border-gray-900"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                    }
        `}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {filteredTools.map((tool) => (
              <Link
                key={tool.title}
                to={tool.path}
                className="
            group relative rounded-2xl bg-white border
            p-5 transition-all duration-300
            hover:-translate-y-1 hover:shadow-xl
            hover:border-indigo-500 shadow-soft
          "
              >
                {/* Icon */}
                <div className="
                    h-14 w-14 mb-4 rounded-xl
                    bg-indigo-50 flex items-center justify-center
                    group-hover:bg-indigo-100 transition
                  ">
                  <img
                    src={tool.icon}
                    alt={tool.title}
                    className="h-10 w-10 object-contain"
                  />
                </div>

                {/* Content */}
                <h5 className="text-left font-semibold mb-1">
                  {tool.title}
                </h5>
                <p className="tool-para text-left">
                  {tool.desc}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>


      {/* ================= CTA ================= */}
      <section id="start" className="pb-16 relative bg-gradient-to-t from-blue-50 to-white">
        <div className="max-w-7xl mx-auto px-1 md:px-6">
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

      {/* ================= Testimonial ================= */}
      <section className="py-20 relative bg-gradient-to-b from-blue-50 to-white">
        <div className="max-w-6xl mx-auto px-4">
          {/* Heading */}
          <h2 className="text-center mb-14">
            What our <span className="italic font-serif">satisfied</span> customers
            <br />
            are saying about us
          </h2>

          {/* Grid */}
          <div className="grid grid-cols-1 md:grid-cols-[60%_40%] gap-6 mb-7">
            {/* Top Left – Dark Testimonial */}
            <div className="relative rounded-2xl overflow-hidden bg-black h-[320px]">
              <img
                src={BG}
                alt=""
                className="absolute inset-0 w-full h-full object-cover opacity-40"
              />
              <div className="relative z-10 p-6 flex flex-col justify-end h-full text-white">
                <span className="opacity-70 mb-2">
                  Customer stories
                </span>
                <p className="leading-relaxed max-w-md">
                  Their tools turned what used to be time-consuming PDF
                  work into something fast, simple, and stress-free.
                  The quality and speed genuinely surprised me.
                </p>
                <span className="mt-4 opacity-70">
                  Anaya Shah — User
                </span>
              </div>
            </div>

            {/* Top Right – Stats Card */}
            <div className="rounded-2xl md:col-span-1 bg-[#F6E889] p-6 flex flex-col justify-between h-[320px]">
              <span className="">
                Facts & numbers
              </span>
              <div>
                <h3 className="mb-2">91%</h3>
                <p className="max-w-xs">
                  of users recommend our PDF & image tools for
                  their speed, accuracy, and ease of use.
                </p>
              </div>
            </div>
          </div>

          {/* Bottom Left – Image Card */}
          <div className="grid grid-cols-1 md:grid-cols-[40%_60%] gap-6 ">
            <div className="rounded-2xl border overflow-hidden bg-slate-800 text-white">
              <div className="p-5">
                <span className="">
                  Customer stories
                </span>
                <p className="mt-2 mb-2 max-w-sm">
                  The simplicity and reliability of these tools helped
                  our team save hours every week. Everything works
                  exactly as promised.
                </p>
              </div>
              <img
                src={BG}
                alt=""
                className="w-55 h-48 object-cover pl-5 pb-5 shadow-md"
              />
            </div>

            {/* Bottom Right – Text Card */}
            <div className="rounded-2xl border p-6 flex flex-col justify-between bg-gray-200">
              <div>
                <span className="">
                  Customer stories
                </span>
                <p className="mt-3 leading-relaxed">
                  “This platform made managing PDFs and images incredibly
                  efficient for our marketing workflows. The tools are
                  intuitive, fast, and consistently reliable.”
                </p>
              </div>

              <div className="mt-6">
                <p className="">Sarah Mitchell</p>
                <p className="">
                  Marketing Head
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= FAQ ================= */}
      <section className="py-20 bg-white ">
        <div className="max-w-4xl mx-auto px-4">
          {/* Heading */}
          <h2 className="text-center mb-12">
            Got questions?
            <br />
            We’ve got <span className="italic font-serif">answers</span>
          </h2>

          {/* FAQ List */}
          <div className="">
            {faqs.map((faq, i) => {
              const isOpen = openIndex === i;

              return (
                <div key={i} className="p-5 mb-5 border rounded-md">
                  <button
                    onClick={() => setOpenIndex(isOpen ? null : i)}
                    className="w-full flex items-center justify-between text-left"
                  >
                    <span className="font-medium text-[20px]">
                      {faq.q}
                    </span>
                    <span className="">
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
      </section>
    </div>
  );
}
