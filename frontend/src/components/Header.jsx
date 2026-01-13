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
  return (
    <header className="sticky top-0 z-50 bg-white border-b">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" >
          <img src={logo} alt="Logo" className="w-[150px] h-auto" />
        </Link>

        {/* Nav */}
        <nav className="hidden md:flex gap-6 text-sm font-medium text-gray-700">
          <Link to="/image-to-pdf" className="hover:text-blue-600">Images to PDF</Link>
          <Link to="/merge-pdf" className="hover:text-blue-600">Merge PDF</Link>
          <Link to="/image-converter" className="hover:text-blue-600">Convert Images</Link>
          <Link to="/image-compressor" className="hover:text-blue-600">Compress Images</Link>
          <Link to="/" className="hover:text-blue-600">All Tools</Link>
        </nav>

        {/* Auth */}
        <div className="flex gap-3 justify-center items-center">
          <SignedOut>
            <Link to="/sign-in" className="text-d font-medium hover:text-indigo-700">
              Login
            </Link>

            <Link
              to="/sign-up"
              className="ml-3 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700">
              Sign up
            </Link>
          </SignedOut>

          {/* When logged IN */}
          <SignedIn>
            {isLoaded && (
              <div className="flex items-center gap-2">
                <UserButton afterSignOutUrl="/" />

                <span className="text-md text-gray-500">
                  Hi, <strong>{user?.firstName || "User"}</strong>
                </span>

              </div>
            )}
          </SignedIn>
        </div>
      </div>
    </header>
  );
}
