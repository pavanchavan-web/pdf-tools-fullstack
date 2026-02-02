import { Helmet } from "react-helmet-async";

export default function CookiesPolicy() {
  return (
    <>
      {/* ================= SEO ================= */}
      <Helmet>
        <title>Cookies Policy – Information About Cookies on ConvertZip</title>
        <meta name="description" key="description"
          content="Learn how ConvertZip uses cookies to improve website performance, user experience, and security, and how you can manage your preferences."
        />
        <meta
          name="keywords" key="keywords"
          content="merge pdf, split pdf, compress pdf, image converter, jpg to pdf, png to pdf, webp converter, avif converter, free online tools, jpg to pdf, pdfcompress, image to pdf, pdf to image"
        />
      </Helmet>

      <section className="border-b bg-white legal-header">
        <div className="mx-auto px-4 md:px-6 md:py-20 text-center space-y-6">
          <h1 className="mb-2">Cookies Policy</h1>
          <p>
            Understand how cookies are used on ConvertZip to improve performance and user experience.                    </p>
        </div>
      </section>
      <div className="prose max-w-4xl mx-auto rounded-3xl border bg-white p-8 my-10 space-y-6 legal-content">

        <p>
          This Cookies Policy explains how <strong>ConvertZip</strong> uses cookies
          to improve user experience and site functionality.
        </p>

        <div className="space-y-3">
          <h3>What Are Cookies?</h3>
          <p>
            Cookies are small text files stored on your device to help websites
            function properly.
          </p>

        </div>
        <div className="space-y-3">
          <h3>How We Use Cookies</h3>
          <ul>
            <li>1. User authentication (login sessions)</li>
            <li>2. Performance and analytics</li>
            <li>3. Security and fraud prevention</li>
          </ul>
        </div>
        <div className="space-y-3">
          <h3>Third-Party Cookies</h3>
          <p>
            Some cookies are set by trusted third-party services like Clerk or
            analytics platforms.
          </p>
        </div>
        <div className="space-y-3">
          <h3>Managing Cookies</h3>
          <p>
            You can disable cookies in your browser settings, but some features
            may not work correctly.
          </p>
        </div>
        <p className="text-sm text-gray-500">
          Last updated: {new Date().toDateString()}
        </p>
      </div>
    </>
  );
}
