"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Music,
  Zap,
  Globe,
  TrendingUp,
  Shield,
  Headphones,
  ArrowRight,
  Sparkles,
  Users,
  Radio,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/landing/navbar";
import { useAuth } from "@/contexts/auth-context";

export default function Home() {
  const { isAuthenticated, isLoading } = useAuth();

  const features = [
    {
      icon: Music,
      title: "Upload & Distribute",
      description: "Share your music across 50+ streaming platforms instantly",
      color: "from-blue-500 to-blue-600",
    },
    {
      icon: TrendingUp,
      title: "Analytics & Insights",
      description: "Track streams, revenue, and audience growth in real-time",
      color: "from-purple-500 to-purple-600",
    },
    {
      icon: Globe,
      title: "Global Reach",
      description: "Connect with listeners worldwide and expand your fanbase",
      color: "from-green-500 to-green-600",
    },
    {
      icon: Shield,
      title: "Rights Protection",
      description: "Secure your music with industry-leading copyright management",
      color: "from-red-500 to-red-600",
    },
    {
      icon: Headphones,
      title: "Artist Tools",
      description: "Professional tools to manage your music and career",
      color: "from-yellow-500 to-yellow-600",
    },
    {
      icon: Sparkles,
      title: "Royalty Tracking",
      description: "Transparent payment tracking and instant settlements",
      color: "from-pink-500 to-pink-600",
    },
  ];

  const stats = [
    { label: "Active Artists", value: "10K+", icon: Users },
    { label: "Songs Distributed", value: "100K+", icon: Music },
    { label: "Monthly Streams", value: "50M+", icon: Radio },
    { label: "Countries Reached", value: "180+", icon: Globe },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden px-4 py-20 sm:py-32">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>

        <div className="relative container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left content */}
            <div className="space-y-8">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20">
                  <Sparkles className="w-4 h-4 text-blue-400" />
                  <span className="text-sm font-semibold text-blue-300">
                    Welcome to SingFLEX Global Distributions
                  </span>
                </div>

                <h1 className="text-5xl sm:text-6xl font-bold tracking-tight leading-tight">
                  Your Music,{" "}
                  <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                    Global Stage
                  </span>
                </h1>

                <p className="text-lg text-gray-300 leading-relaxed">
                  Distribute your music to 50+ streaming platforms, manage royalties,
                  and grow your fanbase worldwide. All from one intuitive platform.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                {!isAuthenticated && !isLoading && (
                  <>
                    <Link href="/auth/signup">
                      <Button
                        size="lg"
                        className="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                      >
                        Get Started Free
                        <ArrowRight className="ml-2 w-4 h-4" />
                      </Button>
                    </Link>
                    <Link href="/auth/signin">
                      <Button
                        size="lg"
                        variant="outline"
                        className="w-full sm:w-auto border-gray-600 hover:bg-gray-800"
                      >
                        Sign In
                      </Button>
                    </Link>
                  </>
                )}
                {isAuthenticated && (
                  <Link href="/desk">
                    <Button
                      size="lg"
                      className="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                    >
                      Go to Dashboard
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </Link>
                )}
              </div>

              {/* Trust badges */}
              <div className="flex flex-wrap gap-6 text-sm text-gray-400">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-green-400" />
                  <span>Secure & Licensed</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-yellow-400" />
                  <span>Instant Distribution</span>
                </div>
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-blue-400" />
                  <span>Global Reach</span>
                </div>
              </div>
            </div>

            {/* Right visual */}
            <div className="relative">
              <div className="relative w-full aspect-square rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/20 p-8 flex items-center justify-center">
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500/5 to-purple-500/5"></div>
                <div className="relative">
                  <div className="w-32 h-32 sm:w-48 sm:h-48 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center shadow-2xl">
                    <Music className="w-16 h-16 sm:w-24 sm:h-24 text-white" />
                  </div>
                  <div className="absolute -bottom-4 -right-4 w-24 h-24 rounded-lg bg-gradient-to-br from-pink-500 to-red-500 flex items-center justify-center shadow-2xl">
                    <Headphones className="w-12 h-12 text-white" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative py-20 bg-slate-800/50 backdrop-blur border-y border-gray-700/50">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div
                  key={index}
                  className="flex flex-col items-center text-center space-y-2"
                >
                  <Icon className="w-8 h-8 text-blue-400" />
                  <div className="text-3xl sm:text-4xl font-bold text-white">
                    {stat.value}
                  </div>
                  <div className="text-sm text-gray-400">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-4xl sm:text-5xl font-bold">
              Powerful Features for Artists
            </h2>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              Everything you need to distribute, manage, and monetize your music
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="group relative p-8 rounded-xl border border-gray-700/50 bg-gradient-to-br from-gray-800/50 to-slate-800/50 hover:border-blue-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10"
                >
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                  <div className="relative space-y-4">
                    <div
                      className={`w-12 h-12 rounded-lg bg-gradient-to-br ${feature.color} flex items-center justify-center`}
                    >
                      <Icon className="w-6 h-6 text-white" />
                    </div>

                    <h3 className="text-xl font-bold text-white">
                      {feature.title}
                    </h3>

                    <p className="text-gray-400 leading-relaxed">
                      {feature.description}
                    </p>

                    <div className="flex items-center text-blue-400 font-semibold text-sm group-hover:gap-2 transition-all duration-300">
                      Learn more
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="relative rounded-2xl overflow-hidden">
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-90"></div>
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-transparent"></div>

            {/* Content */}
            <div className="relative p-12 sm:p-16 text-center space-y-8">
              <div className="space-y-4">
                <h2 className="text-4xl sm:text-5xl font-bold text-white">
                  Ready to Share Your Music?
                </h2>
                <p className="text-lg text-blue-100 max-w-2xl mx-auto">
                  Join thousands of artists distributing their music globally.
                  Get started in minutes, no experience needed.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {!isAuthenticated && !isLoading && (
                  <>
                    <Link href="/auth/signup">
                      <Button
                        size="lg"
                        className="w-full sm:w-auto bg-white text-blue-600 hover:bg-gray-100 font-semibold"
                      >
                        Create Free Account
                        <ArrowRight className="ml-2 w-4 h-4" />
                      </Button>
                    </Link>
                    <Link href="/auth/signin">
                      <Button
                        size="lg"
                        variant="outline"
                        className="w-full sm:w-auto border-white text-white hover:bg-white/10"
                      >
                        Already have an account?
                      </Button>
                    </Link>
                  </>
                )}
                {isAuthenticated && (
                  <Link href="/desk/artist/upload/now">
                    <Button
                      size="lg"
                      className="w-full sm:w-auto bg-white text-blue-600 hover:bg-gray-100 font-semibold"
                    >
                      Upload Your Music
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative border-t border-gray-700/50 bg-slate-900 py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div className="space-y-4">
              <h4 className="font-semibold text-white">Platform</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Security
                  </Link>
                </li>
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="font-semibold text-white">Resources</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Guides
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Support
                  </Link>
                </li>
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="font-semibold text-white">Company</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Contact
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Careers
                  </Link>
                </li>
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="font-semibold text-white">Legal</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Privacy
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Terms
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    License
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-700/50 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-400">
            <div>
              © 2026 SingFLEX Global Distributions. All rights reserved.
            </div>
            <div className="flex gap-6">
              <Link href="#" className="hover:text-white transition-colors">
                Twitter
              </Link>
              <Link href="#" className="hover:text-white transition-colors">
                Instagram
              </Link>
              <Link href="#" className="hover:text-white transition-colors">
                LinkedIn
              </Link>
            </div>
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </main>
  );
}
