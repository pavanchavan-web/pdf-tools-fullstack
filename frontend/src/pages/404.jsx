import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">

      {/* Header spacer (optional if you use shared header) */}
      <div className="h-16" />

      {/* Main Content */}
      <main className="flex-grow flex items-center justify-center px-4">
        <div className="max-w-2xl text-center">

          {/* Big 404 */}
          <h1 className="text-[120px] font-extrabold text-gray-200 leading-none">
            404
          </h1>

          {/* Message */}
          <h2 className="text-2xl font-semibold text-gray-800 mt-4">
            Page not found
          </h2>

          <p className="text-gray-500 mt-3">
            The tool or page you’re looking for 
            doesn’t exist or may have been moved.
          </p>

          {/* CTA */}
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/"
              className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 transition"
            >
              Go to Homepage
            </Link>

            <Link
              to="/image-to-pdf"
              className="border border-gray-300 px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition"
            >
              Try Image to PDF
            </Link>
          </div>

          {/* Popular Tools */}
          <div className="mt-10">
            <p className="text-sm text-gray-400 mb-3">
              Popular tools
            </p>

            <div className="flex flex-wrap justify-center gap-3 text-sm">
              <Link to="/merge-pdf" className="text-indigo-600 hover:underline">
                Merge PDF
              </Link>
              <Link to="/image-converter" className="text-indigo-600 hover:underline">
                Convert Images
              </Link>
              <Link to="/image-compressor" className="text-indigo-600 hover:underline">
                Compress Images
              </Link>
            </div>
          </div>

        </div>
      </main>

      {/* Footer spacer (optional if shared footer exists) */}
      <div className="h-16" />
    </div>
  );
}
