import { useState } from "react";
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

  return (
    <header className="sticky top-0 z-50 bg-white border-b">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">

        {/* Left: Hamburger + Logo */}
        <div className="flex items-center gap-3">
          {/* Hamburger (Mobile) */}
          <button
            className="md:hidden text-2xl text-gray-700"
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
          >
            ☰
          </button>

          {/* Logo */}
          <Link to="/">
            <img src={logo} alt="Logo" className="w-[140px] h-auto" />
          </Link>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden md:flex gap-6 text-sm font-medium text-gray-700">
          <Link to="/image-to-pdf" className="hover:text-blue-600">Images to PDF</Link>
          <Link to="/merge-pdf" className="hover:text-blue-600">Merge PDF</Link>
          <Link to="/image-converter" className="hover:text-blue-600">Convert Images</Link>
          <Link to="/image-compressor" className="hover:text-blue-600">Compress Images</Link>
          <Link to="/" className="hover:text-blue-600">All Tools</Link>
        </nav>

        {/* Desktop Auth */}
        <div className="hidden md:flex gap-3 items-center">
          <SignedOut>
            <Link to="/sign-in" className="font-medium hover:text-indigo-700">
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
                <span className="text-gray-500">
                  Hi, <strong>{user?.firstName || "User"}</strong>
                </span>
              </div>
            )}
          </SignedIn>
        </div>
      </div>

      {/* ================= Mobile Menu ================= */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 md:hidden">
          <div className="bg-white w-72 h-full p-5">

            {/* Close Button */}
            <button
              className="text-gray-600 mb-6"
              onClick={() => setMenuOpen(false)}
            >
              ✕ Close
            </button>

            {/* Mobile Nav */}
            <nav className="flex flex-col gap-4 text-sm font-medium text-gray-700">
              <Link onClick={() => setMenuOpen(false)} to="/image-to-pdf">Images to PDF</Link>
              <Link onClick={() => setMenuOpen(false)} to="/merge-pdf">Merge PDF</Link>
              <Link onClick={() => setMenuOpen(false)} to="/image-converter">Convert Images</Link>
              <Link onClick={() => setMenuOpen(false)} to="/image-compressor">Compress Images</Link>
              <Link onClick={() => setMenuOpen(false)} to="/">All Tools</Link>
            </nav>

            {/* Mobile Auth (NOT REMOVED ✅) */}
            <div className="mt-6 border-t pt-4">
              <SignedOut>
                <Link
                  to="/sign-in"
                  onClick={() => setMenuOpen(false)}
                  className="block mb-3 font-medium"
                >
                  Login
                </Link>

                <Link
                  to="/sign-up"
                  onClick={() => setMenuOpen(false)}
                  className="inline-block bg-indigo-600 text-white px-4 py-2 rounded-lg"
                >
                  Sign up
                </Link>
              </SignedOut>

              <SignedIn>
                {isLoaded && (
                  <div className="flex items-center gap-2">
                    <UserButton afterSignOutUrl="/" />
                    <span className="text-gray-500">
                      Hi, <strong>{user?.firstName || "User"}</strong>
                    </span>
                  </div>
                )}
              </SignedIn>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
