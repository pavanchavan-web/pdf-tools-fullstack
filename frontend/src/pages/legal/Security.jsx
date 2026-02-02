import { Helmet } from "react-helmet-async";

export default function Security() {
  return (
    <div>
      {/* ================= SEO ================= */}
      <Helmet>
        <title>Security – File Protection and Data Safety at ConvertZip</title>
        <meta name="description" key="description"
          content="Learn how ConvertZip keeps your files secure with strong data protection, encryption, and safe file handling practices."
        />
        <meta
          name="keywords" key="keywords"
          content="merge pdf, split pdf, compress pdf, image converter, jpg to pdf, png to pdf, webp converter, avif converter, free online tools, jpg to pdf, pdfcompress, image to pdf, pdf to image"
        />
      </Helmet>

      <section className="border-b bg-white legal-header">
        <div className="mx-auto px-4 md:px-6 md:py-20 text-center space-y-6">
          <h1 className="mb-2">Security</h1>
          <p>
            Learn how ConvertZip ensures secure PDF and image processing online.                    </p>
        </div>
      </section>
      <div className="prose max-w-4xl mx-auto rounded-3xl border bg-white p-8 my-10 space-y-6 legal-content">
        <p>
          Security is a top priority at <strong>ConvertZip</strong>.
          We design our systems to protect your files and personal data.
        </p>

        <div className="space-y-3">
          <h3>File Security</h3>
          <ul>
            <li>1. Files processed in isolated environments</li>
            <li>2. Automatic deletion after processing</li>
            <li>3. No permanent file storage</li>
          </ul>
        </div>
        <div className="space-y-3">
          <h3>Data Encryption</h3>
          <p>
            All data transfers are secured using HTTPS encryption to prevent
            unauthorized access.
          </p>
        </div>
        <div className="space-y-3">
          <h3>User Authentication</h3>
          <p>
            We use <strong>Clerk</strong> for secure login and identity management,
            ensuring industry-standard authentication practices.
          </p>
        </div>
        <div className="space-y-3">
          <h3>Infrastructure Protection</h3>
          <p>
            Our servers are monitored and protected against abuse, malware,
            and unauthorized access.
          </p>
        </div>
        <div className="space-y-3">
          <h3>Responsible Disclosure</h3>
          <p>
            If you discover a security vulnerability, please report it
            responsibly through our contact page.
          </p>
        </div>
      </div>
    </div>
  );
}
