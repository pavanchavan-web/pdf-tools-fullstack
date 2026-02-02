import { Helmet } from "react-helmet-async";

export default function PrivacyPolicy() {
    return (
        <div>
            {/* ================= SEO ================= */}
            <Helmet>
                <title>Privacy Policy – Data Collection and Usage at ConvertZip</title>
                <meta name="description" key="description"
                    content="Learn how ConvertZip collects, uses, and protects your personal data and ensures privacy when using our online tools."
                />
                <meta
                    name="keywords" key="keywords"
                    content="merge pdf, split pdf, compress pdf, image converter, jpg to pdf, png to pdf, webp converter, avif converter, free online tools, jpg to pdf, pdfcompress, image to pdf, pdf to image"
                />
            </Helmet>

            <section className="border-b bg-white legal-header">
                <div className="mx-auto px-4 md:px-6 md:py-20 text-center space-y-6">
                    <h1 className="mb-2">Privacy Policy</h1>
                    <p>
                        Learn how ConvertZip protects your privacy while using free PDF and image tools online.
                    </p>
                </div>
            </section>

            <div className="prose max-w-4xl mx-auto rounded-3xl border bg-white p-8 my-10 space-y-6 legal-content">
                <p>
                    At <strong>ConvertZip</strong>, your privacy is extremely important to us.
                    This Privacy Policy explains how we collect, use, and protect your
                    information when you use our free online PDF and image tools.
                </p>

                <div className="space-y-3">
                    <h3>Information We Collect</h3>
                    <p>
                        We do <strong>not</strong> collect personal files permanently.
                        Uploaded PDFs and images are processed temporarily and automatically
                        deleted after processing.
                    </p>

                    <ul>
                        <li>1. Temporary file uploads for processing</li>
                        <li>2. Basic usage analytics (anonymous)</li>
                        <li>3. Authentication details (via Clerk)</li>
                    </ul>
                </div>
                <div className="space-y-3">
                    <h3>How We Use Your Data</h3>
                    <p>
                        Your data is used only to provide core features such as:
                    </p>

                    <ul>
                        <li>1. PDF merge, split, compress tools</li>
                        <li>2. Image conversion and compression</li>
                        <li>3. User authentication and security</li>
                    </ul>
                </div>

                <div className="space-y-3">
                    <h3>File Deletion Policy</h3>
                    <p>
                        All uploaded files are automatically deleted after processing.
                        We do not store or share your documents.
                    </p>
                </div>


                <div className="space-y-3">
                    <h3>Third-Party Services</h3>
                    <p>
                        We use trusted services such as <strong>Clerk</strong> for
                        authentication and analytics tools to improve performance.
                    </p>
                </div>
                <div className="space-y-3">
                    <h3>Contact</h3>
                    <p>
                        If you have any privacy-related questions, please contact us via
                        the website.
                    </p>
                </div>
                <p className="text-sm text-gray-500">
                    Last updated: {new Date().toDateString()}
                </p>
            </div>
        </div>
    );
}
