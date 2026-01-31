export default function TermsConditions() {
  return (
    <div>
      <section className="border-b bg-white legal-header">
        <div className="mx-auto px-4 md:px-6 md:py-20 text-center space-y-6">
          <h1 className="mb-2">Terms & Conditions</h1>
          <p>
            Read the terms and conditions for using ConvertZip free PDF and image tools online.                    </p>
        </div>
      </section>
      <div className="prose max-w-4xl mx-auto rounded-3xl border bg-white p-8 my-10 space-y-6 legal-content">
        <p>
          By accessing or using <strong>ConvertZip</strong>, you agree to comply
          with these Terms & Conditions.
        </p>

        <div className="space-y-3">
          <h3>Use of Services</h3>
          <p>
            ConvertZip provides free online tools including PDF merge, split,
            compress, image conversion, and image compression.
          </p>
        </div>
        <div className="space-y-3">
          <h3>Acceptable Use</h3>
          <ul>
            <li>1. No illegal or copyrighted material</li>
            <li>2. No abuse of system resources</li>
            <li>3. No automated scraping or misuse</li>
          </ul>
        </div>
        <div className="space-y-3">
          <h3>File Responsibility</h3>
          <p>
            You are solely responsible for the files you upload and process.
            We do not verify ownership of documents.
          </p>
        </div>
        <div className="space-y-3">
          <h3>Service Availability</h3>
          <p>
            We aim to keep our services available at all times, but we do not
            guarantee uninterrupted access.
          </p>
        </div>
        <div className="space-y-3">
          <h3>Limitation of Liability</h3>
          <p>
            ConvertZip is provided "as is". We are not liable for data loss,
            business interruption, or indirect damages.
          </p>
        </div>
        <div className="space-y-3">
          <h3>Changes to Terms</h3>
          <p>
            These terms may be updated periodically. Continued use means
            acceptance of changes.
          </p>
        </div>
        <div className="space-y-3">
          <p className="text-sm text-gray-500">
            Last updated: {new Date().toDateString()}
          </p>
        </div>
      </div>
    </div>
  );
}
