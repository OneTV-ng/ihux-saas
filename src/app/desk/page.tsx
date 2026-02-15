"use client";
import Navbar from "@/components/landing/navbar";
import { MobileBottomNav } from "@/components/mobile-bottom-nav";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Upload,
  Music,
  Album,
  Users,
  UserCircle,
  BadgeCheck,
  DollarSign,
  Settings
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

const DeskPage = () => {
  const menus = [
    { title: "📤 New Upload", icon: Upload, link: "/desk/artist/upload/now", badge: "NEW", badgeColor: "bg-green-500" },
    { title: "Upload Music", icon: Upload, link: "/desk/artist/upload" },
    { title: "Artist Songs", icon: Music, link: "/desk/artist/songs" }, // current artist songs
    { title: "User Songs", icon: Album, link: "/desk/songs" }, // all my artist songs
    { title: "Artist Profile", icon: Users, link: "/desk/artist/profile" },
    { title: "User Profile", icon: UserCircle, link: "/desk/profile" },
    { title: "Verification", icon: BadgeCheck, link: "/desk/profile#verification" },
    { title: "Royalty", icon: DollarSign, link: "/desk/artist/royalty" },
    { title: "Artist HUB", icon: DollarSign, link: "/desk/artist/hub" }, // current Artist hub with analytics, growth tools, etc
    { title: "My Artist", icon: DollarSign, link: "/desk/artist" }, // select current artist, List . Add . delete , suspend , edit artist

    { title: "Settings", icon: Settings, link: "/settings" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-100 via-zinc-200 to-zinc-300 text-zinc-900 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-800 dark:text-white transition-colors duration-300">
      <Navbar />
      <div className="container mx-auto px-4 py-12 pb-28 md:pb-12 max-w-6xl">
        {/* Welcome Section */}
        <motion.div
          className="mb-10 text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <h1 className="text-4xl md:text-5xl font-extrabold mb-3 tracking-tight bg-gradient-to-r from-green-600 to-green-400 bg-clip-text text-transparent drop-shadow-lg dark:from-green-400 dark:to-green-600">
            Member Dashboard
          </h1>
          <p className="text-lg text-zinc-600 dark:text-zinc-300 font-medium">
            Welcome back! Access all your music tools and settings from here.
          </p>
        </motion.div>

        {/* Featured Section - New Upload */}
        <motion.div
          className="mb-10"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          <Card className="bg-gradient-to-r from-green-500 via-green-400 to-emerald-500 border-none shadow-2xl rounded-3xl overflow-hidden dark:from-green-600 dark:via-green-500 dark:to-emerald-600 ring-2 ring-green-300/50">
            <CardContent className="pt-8 pb-8 px-8">
              <div className="flex items-center justify-between gap-6">
                <div className="flex-1">
                  <div className="inline-block mb-3 px-3 py-1 bg-white/20 rounded-full text-xs font-bold text-white">
                    ✨ NEW FEATURE
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">Upload Music Faster</h2>
                  <p className="text-green-50 text-lg mb-4">
                    Try our new incremental upload system with step-by-step guidance, real-time progress tracking, and better error recovery.
                  </p>
                  <Button className="bg-white text-green-600 hover:bg-green-50 font-bold" asChild>
                    <Link href="/desk/upload">Start Uploading</Link>
                  </Button>
                </div>
                <div className="hidden md:flex items-center justify-center">
                  <div className="text-6xl">🎵</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Menu Grid */}
        <Card className="bg-gradient-to-br from-zinc-200/80 to-zinc-100/60 border-none shadow-2xl rounded-3xl backdrop-blur-md ring-1 ring-green-400/10 dark:from-zinc-900/80 dark:to-zinc-800/60">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-green-600 tracking-tight dark:text-green-400">Quick Access</CardTitle>
            <CardDescription className="text-zinc-600 dark:text-zinc-300">
              Navigate to your favorite features and manage your content
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4 sm:grid sm:grid-cols-2 lg:grid-cols-4 sm:gap-6">
              {menus.map((menu, index) => {
                const IconComponent = menu.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * index, duration: 0.5 }}
                    className="relative"
                  >
                    <Button
                      variant="outline"
                      className={`w-full h-auto px-4 py-5 flex flex-row items-center gap-4 rounded-2xl bg-zinc-100/80 hover:bg-green-100/40 border-green-400/30 shadow-lg hover:shadow-2xl transition-all duration-200 group dark:bg-zinc-900/80 dark:hover:bg-green-900/20 ${
                        menu.badge ? "ring-2 ring-green-500/50" : ""
                      }`}
                      asChild
                    >
                      <Link href={menu.link} className="flex flex-row items-center w-full">
                        <span className="flex-shrink-0 rounded-full bg-gradient-to-br from-green-600/80 to-green-400/80 p-3 ml-1 mr-5 shadow-lg group-hover:scale-110 transition-transform dark:from-green-400/80 dark:to-green-600/80">
                          <IconComponent className="h-7 w-7 text-black dark:text-white drop-shadow" />
                        </span>
                        <span className="text-base font-semibold text-zinc-800 group-hover:text-green-600 text-left transition-colors dark:text-zinc-100 dark:group-hover:text-green-400 flex-1">
                          {menu.title}
                        </span>
                        {menu.badge && (
                          <span className={`text-xs font-bold px-2 py-1 rounded-full text-white ${menu.badgeColor || "bg-green-500"}`}>
                            {menu.badge}
                          </span>
                        )}
                      </Link>
                    </Button>
                  </motion.div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-16 pt-10 border-t border-zinc-300/50 dark:border-zinc-700/50">
          <p className="text-zinc-500 dark:text-zinc-400">
            Built with <span className="text-red-400">❤️</span> by{' '}
            <Link
              href="https://imediaport.com/dxlmusichub"
              target="_blank"
              className="text-green-600 hover:underline font-bold dark:text-green-400"
            >
             iMediaPORT
            </Link>
          </p>
        </div>
      </div>
      <MobileBottomNav />
    </div>
  );
};

export default DeskPage;
