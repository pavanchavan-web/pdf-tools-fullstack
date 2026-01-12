import React from "react";
import { Button } from "../components/ui/button";
import { Upload, ArrowRight } from "lucide-react";

const HeroSection = () => {
  return (
    <section className="relative overflow-hidden py-16 md:py-24 lg:py-32">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-primary/5 rounded-full blur-3xl" />
      </div>

      <div className="container">
        <div className="mx-auto max-w-3xl text-center">
          {/* Badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-secondary px-4 py-1.5 text-sm font-medium text-secondary-foreground animate-fade-in">
            <span className="flex h-2 w-2 rounded-full bg-primary" />
            Trusted by 1M+ users worldwide
          </div>

          {/* Headline */}
          <h1 className="mb-6 text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl md:text-6xl animate-fade-in [animation-delay:100ms] ">
            Every PDF Tool You Need,{" "}
            <span className="text-gradient">All in One Place</span>
          </h1>

          {/* Subtext */}
          <p className="mb-10 text-lg text-muted-foreground md:text-xl max-w-2xl mx-auto animate-fade-in [animation-delay:200ms]">
            Merge, split, compress, convert, rotate, unlock and watermark PDFs with
            just a few clicks. 100% free and secure.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in [animation-delay:300ms] ">
            <Button
              size="lg"
              className="btn-gradient text-primary-foreground border-0 gap-2 px-8 h-12 text-base font-semibold shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all"
            >
              <Upload className="h-5 w-5" />
              Select PDF File
            </Button>

            <Button
              variant="outline"
              size="lg"
              className="gap-2 h-12 text-base font-medium"
            >
              See All Tools
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Trust indicators */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-8 text-sm text-muted-foreground animate-fade-in [animation-delay:400ms] opacity-0">
            {[
              "No file size limits",
              "Secure & private",
              "Works on any device",
            ].map((text, index) => (
              <div key={index} className="flex items-center gap-2">
                <svg
                  className="h-5 w-5 text-tool-green"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
