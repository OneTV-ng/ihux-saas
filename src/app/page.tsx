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

const FEATURE_CARDS = [
  {
    title: "Creator tools",
    description: "Launch releases faster with smart metadata, scheduling, and analytics.",
  },
  {
    title: "Audience growth",
    description: "Build loyalty with curated playlists, drops, and cross-platform sharing.",
  },
  {
    title: "Revenue insights",
    description: "Track performance, royalties, and campaign impact in one place.",
  },
];

export default function PublicHome() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-white">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=2200&q=80')",
        }}
        aria-hidden
      />
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950/95 via-slate-950/70 to-slate-950/95" aria-hidden />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-6xl flex-col items-center justify-center gap-10 px-6 py-16 text-center md:py-24">
        <div className="flex flex-col items-center gap-6">
          <p className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-white/70">
            SingFLEX Music Platform
          </p>
          <h1 className="text-4xl font-semibold leading-tight text-white sm:text-5xl md:text-6xl">
            Elevate your sound.
            <span className="block text-indigo-300">Connect, stream, and grow.</span>
          </h1>
          <p className="max-w-2xl text-base text-slate-200/90 sm:text-lg">
            SingFLEX is a modern music ecosystem for artists, labels, and listeners—stream high-quality audio, manage releases, and unlock new opportunities.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/auth/signin"
              className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-white/30 transition hover:-translate-y-0.5 hover:shadow-white/50"
            >
              Sign In
            </Link>
            <Link
              href="/auth/signup"
              className="rounded-full border border-white/30 bg-white/10 px-6 py-3 text-sm font-semibold text-white backdrop-blur transition hover:-translate-y-0.5 hover:border-white/60 hover:bg-white/20"
            >
              Sign Up
            </Link>
            <Link
              href="#learn-more"
              className="rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-white/80 transition hover:-translate-y-0.5 hover:border-white/50 hover:text-white"
            >
              Learn More
            </Link>
          </div>
        </div>

        <div
          id="learn-more"
          className="grid w-full gap-6 rounded-3xl border border-white/10 bg-white/5 p-6 text-left text-sm text-slate-200/90 backdrop-blur sm:p-8 md:grid-cols-3"
        >
          <div>
            <h3 className="text-base font-semibold text-white">For Artists</h3>
            <p className="mt-2">Upload releases, track performance, and engage your audience with smart insights.</p>
          </div>
          <div>
            <h3 className="text-base font-semibold text-white">For Labels</h3>
            <p className="mt-2">Manage catalogs, distribute globally, and collaborate securely with your roster.</p>
          </div>
          <div>
            <h3 className="text-base font-semibold text-white">For Fans</h3>
            <p className="mt-2">Discover curated playlists, follow creators, and enjoy premium playback features.</p>
          </div>
        </div>

        <div className="grid w-full gap-4 text-left text-sm text-slate-200/80 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURE_CARDS.map((feature) => (
            <div
              key={feature.title}
              className="rounded-2xl border border-white/10 bg-slate-950/60 p-5 shadow-lg shadow-black/20"
            >
              <h3 className="text-base font-semibold text-white">{feature.title}</h3>
              <p className="mt-2 text-slate-200/80">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

