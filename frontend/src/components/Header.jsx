import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  SignedIn,
  SignedOut,
  UserButton,
  useUser,
} from "@clerk/clerk-react";
import logo from "../assets/logo.webp";

export default function Header() {
  const { user, isLoaded } = useUser();
  const [menuOpen, setMenuOpen] = useState(false);

  // Prevent body scroll when menu is open (mobile UX)
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "auto";
  }, [menuOpen]);

  return (
    <header className="sticky top-0 z-50 bg-white border-b">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">

        {/* Left */}
        <div className="flex items-center gap-3">
          <button
            className="md:hidden text-2xl text-gray-700"
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
          >
            ☰
          </button>

          <Link to="/">
            <img src={logo} alt="Logo" className="w-[140px]" />
          </Link>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden md:flex gap-6 text-sm font-medium text-gray-700">
          <Link to="/image-to-pdf" className="hover:text-blue-600">Images to PDF</Link>
          <Link to="/merge-pdf" className="hover:text-blue-600">Merge PDF</Link>
          <Link to="/image-converter" className="hover:text-blue-600">Convert Images</Link>
          <Link to="/image-compressor" className="hover:text-blue-600">Compress Images</Link>
          <Link to="/all-tools" className="hover:text-blue-600">All Tools</Link>
        </nav>

        {/* Auth */}
        <div className="flex gap-3 items-center">
          <SignedOut>
            <Link to="/sign-in" className="text-md font-medium hover:text-indigo-700">
              Login
            </Link>
            <Link
              to="/sign-up"
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
            >
              Sign up
            </Link>
          </SignedOut>

          <SignedIn>
            {isLoaded && (
              <div className="flex items-center gap-2">
                <UserButton afterSignOutUrl="/" />
                <span className="hidden sm:inline text-gray-500">
                  Hi, <strong>{user?.firstName || "User"}</strong>
                </span>
              </div>
            )}
          </SignedIn>
        </div>
      </div>

      {/* Mobile Drawer */}
      <div
        className={`fixed inset-0 z-50 bg-black/40 transition-opacity duration-300 md:hidden ${
          menuOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        onClick={() => setMenuOpen(false)} // outside click close
      >
        <div
          className={`bg-white w-72 h-full p-5 transform transition-transform duration-300 ease-in-out ${
            menuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
          onClick={(e) => e.stopPropagation()} // prevent close on drawer click
        >
          <button
            className="text-gray-600 mb-6"
            onClick={() => setMenuOpen(false)}
          >
            ✕ Close
          </button>

          <nav className="flex flex-col gap-5 text-sm font-medium text-gray-700">
            {/* Image Tools */}
            <p className="text-xs uppercase text-gray-400">Image Tools</p>
            <Link onClick={() => setMenuOpen(false)} to="/image-to-pdf">Images to PDF</Link>
            <Link onClick={() => setMenuOpen(false)} to="/image-converter">Image Converter</Link>
            <Link onClick={() => setMenuOpen(false)} to="/image-compressor">Image Compressor</Link>

            {/* PDF Tools */}
            <p className="text-xs uppercase text-gray-400 mt-4">PDF Tools</p>
            <Link onClick={() => setMenuOpen(false)} to="/merge-pdf">Merge PDF</Link>
            <Link onClick={() => setMenuOpen(false)} to="/split-pdf">Split PDF</Link>
            <Link onClick={() => setMenuOpen(false)} to="/compress-pdf">Compress PDF</Link>

            {/* More */}
            <p className="text-xs uppercase text-gray-400 mt-4">More</p>
            <Link onClick={() => setMenuOpen(false)} to="/all-tools">All Tools</Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
