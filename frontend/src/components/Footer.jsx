
import { Link } from "react-router-dom";
import logo from "../assets/Footer-Logo.webp";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 ">
      <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-5 gap-8">
        {/* Brand */}
        <div className="space-y-3">
          {/* Logo */}
          <Link to="/" >
            <img src={logo} alt="Logo" className="w-48 h-auto" />
          </Link>
          <p className="text-sm">
            Simple, fast and secure PDF tools to manage your documents online.
          </p>
        </div>

        {/* Tools */}
        <div>
          <h4 className="text-white font-medium mb-3">Tools</h4>
          <ul className="space-y-2 text-sm flex flex-col">
            <Link to="/merge-pdf" className="space-y-2 text-sm">Merge PDF</Link>
            <Link to="/split-pdf" className="space-y-2 text-sm">Split PDF</Link>
            <Link to="/image-compressor" className="space-y-2 text-sm">Compress Images</Link>
            <Link to="/image-converter" className="space-y-2 text-sm">Convert Image</Link>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-medium mb-3">Quick Links</h4>
          <ul className="space-y-2 text-sm flex flex-col">
            <Link to="/privacy-policy" className="space-y-2 text-sm">Privacy Policy</Link>
            <Link to="/terms-conditions" className="space-y-2 text-sm">Terms & conditions</Link>
            <Link to="/cookies" className="space-y-2 text-sm">Cookies</Link>
            <Link to="/security" className="space-y-2 text-sm">Security</Link>
          </ul>
        </div>

        {/* Company */}
        <div>
          <h4 className="text-white font-medium mb-3">Company</h4>
          <ul className="space-y-2 text-sm flex flex-col">
            <Link to="/about-us" className="space-y-2 text-sm">About Us</Link>
            <Link to="/contact-us" className="space-y-2 text-sm">Contact</Link>
          </ul>
        </div>

        {/* Trust */}
        <div>
          <h4 className="text-white font-medium mb-3">Why ConvertZip?</h4>
          <ul className="space-y-2 text-sm">
            <li>🔒 Secure processing</li>
            <li>⚡ Fast conversions</li>
            <li>🧹 Auto file deletion</li>
          </ul>
        </div>
      </div>

      <div className="text-center text-xs text-gray-500 border-t border-gray-800 py-4">
        © {new Date().getFullYear()} ConvertZip. All rights reserved.
      </div>
    </footer>
  );
}
