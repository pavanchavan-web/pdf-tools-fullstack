import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import MergePdf from "./pages/MergePdf";
import SplitPdf from "./pages/SplitPdf";
import CompressPdf from "./pages/CompressPdf";
import ImageToPdf from "./pages/ImageToPdf";
import ConvertToWebp from "./pages/ConvertToWebp";
import ConvertToPng from "./pages/ConvertToPng";
import ConvertToAvif from "./pages/ConvertToAvif";
import ConvertToJpeg from "./pages/ConvertToJpeg";
import ConvertToSvg from "./pages/ConvertToSvg";
import ConvertToGif from "./pages/ConvertToGif";
import ImageConverter from "./pages/ImageConvert";
import PdfImageExtractor from "./pages/PdfImageExtractor";
import ImageCompressor from "./pages/ImageCompressor";
import SignInPage from "./auth/SignInPage";
import SignUpPage from "./auth/SignUpPage";
import Dashboard from "./pages/Dashboard";
import PrivacyPolicy from "./pages/legal/PrivacyPolicy";
import TermsConditions from "./pages/legal/TermsConditions";
import Security from "./pages/legal/Security";
import CookiesPolicy from "./pages/legal/CookiesPolicy";
import Contact from "./pages/Contact"
import AboutUs from "./pages/AboutUs"

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/merge-pdf" element={<MergePdf />} />
        <Route path="/split-pdf" element={<SplitPdf />} />
        <Route path="/compress-pdf" element={<CompressPdf />} />
        <Route path="/image-to-pdf" element={<ImageToPdf />} />
        <Route path="/convert-to-webp" element={<ConvertToWebp />} />
        <Route path="/convert-to-png" element={<ConvertToPng />} />
        <Route path="/convert-to-avif" element={<ConvertToAvif />} />
        <Route path="/convert-to-jpeg" element={<ConvertToJpeg />} />
        <Route path="/convert-to-svg" element={<ConvertToSvg />} />
        <Route path="/convert-to-gif" element={<ConvertToGif />} />
        <Route path="/image-converter" element={<ImageConverter />} />
        <Route path="/pdf-image-extractor" element={<PdfImageExtractor />} />
        <Route path="/image-compressor" element={<ImageCompressor />} />
        <Route path="/sign-in" element={<SignInPage />} />
        <Route path="/sign-up" element={<SignUpPage />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms-conditions" element={<TermsConditions />} />
        <Route path="/cookies" element={<CookiesPolicy />} />
        <Route path="/security" element={<Security />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/contact-us" element={<Contact />} />
        <Route path="/about-us" element={<AboutUs />} />
      </Routes>
    </Layout>
  );
}
