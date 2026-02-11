"use client";
import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";


const covers = [
  "/uploads/renny/cover/1770792088461.jpg",
  "/uploads/renny/cover/1770772544445.JPG",
  "/uploads/renny/cover/1770791797839.jpg",
  "/uploads/renny/cover/1770773590967.jpg",
  "/uploads/renny/cover/1770772903860.jpg",
  "/uploads/renny/cover/1770796686134.jpg",
];

function getRandomCover() {
  return covers[Math.floor(Math.random() * covers.length)];
}

const HomePage = () => {
  const [bg, setBg] = React.useState(getRandomCover());
  React.useEffect(() => {
    const interval = setInterval(() => {
      setBg(getRandomCover());
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div
        className="absolute inset-0 w-full h-full z-0 animate-zoom bg-center bg-cover transition-all duration-1000"
        style={{
          backgroundImage: `url(${bg})`,
          filter: "brightness(0.5) blur(1.5px)",
        }}
      />
      <main className="relative z-10 flex flex-col items-center justify-center w-full px-4 py-24">
        <h1 className="text-5xl md:text-6xl font-extrabold text-white drop-shadow-lg text-center mb-6">
          Distribute Your Music Globally
        </h1>
        <p className="text-xl md:text-2xl text-white/90 max-w-2xl text-center mb-8 drop-shadow">
          Upload, manage, and monetize your music on all major platforms. <br />
          Fast, secure, and artist-friendly music distribution for everyone.
        </p>
        <div className="flex gap-6 justify-center mb-10">
          <Link href="/auth/signup">
            <Button size="lg" className="bg-primary text-white shadow-xl hover:bg-primary/90">
              Get Started
            </Button>
          </Link>
          <Link href="/auth/signin">
            <Button size="lg" variant="outline" className="bg-white/80 text-primary border-white shadow-xl hover:bg-white">
              Sign In
            </Button>
          </Link>
        </div>
        <div className="flex flex-wrap gap-4 justify-center mt-4">
          <span className="bg-white/20 text-white px-4 py-2 rounded-full text-sm font-medium shadow">
            100% Royalties
          </span>
          <span className="bg-white/20 text-white px-4 py-2 rounded-full text-sm font-medium shadow">
            Fast Approval
          </span>
          <span className="bg-white/20 text-white px-4 py-2 rounded-full text-sm font-medium shadow">
            Global Reach
          </span>
          <span className="bg-white/20 text-white px-4 py-2 rounded-full text-sm font-medium shadow">
            Artist Support
          </span>
        </div>
      </main>
      <footer className="absolute bottom-0 left-0 w-full text-center py-4 z-20 text-white/80 text-sm bg-gradient-to-t from-black/60 to-transparent">
        &copy; {new Date().getFullYear()} SingFLEX Global Distributions. All rights reserved.
      </footer>
    </div>
  );
};

export default HomePage;
