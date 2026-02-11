"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { LogOut, Shield, User, Menu, Home, LayoutDashboard, Settings, Music } from "lucide-react";
import Image from "next/image";
import { ThemeToggle } from "@/components/theme-toggle";
import { useState } from "react";
import { useAuth } from "@/contexts/auth-context";

const Navbar = () => {
  const { user, defaultArtist, isAdmin, isAuthenticated, isLoading, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo/Brand */}
        <div className="flex items-center gap-2 md:gap-6">
          {/* Mobile Menu Toggle */}
          {isAuthenticated && (
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72">
                <SheetHeader>
                  <SheetTitle>Menu</SheetTitle>
                  <SheetDescription>
                    Navigate to different sections
                  </SheetDescription>
                </SheetHeader>
                <div className="mt-6 flex flex-col gap-2">
                  <Link href="/desk" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start">
                      <Home className="mr-2 h-4 w-4" />
                      Dashboard
                    </Button>
                  </Link>
                  <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start">
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      Home
                    </Button>
                  </Link>
                  <Link href="/desk/profile" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start">
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </Button>
                  </Link>
                  <Link href="/desk/settings" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start">
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </Button>
                  </Link>
                  {defaultArtist && (
                    <Link href="/desk/artist" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="ghost" className="w-full justify-start">
                        <Music className="mr-2 h-4 w-4" />
                        Artist Portal
                      </Button>
                    </Link>
                  )}
                  {isAdmin && (
                    <Link href="/admin" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="ghost" className="w-full justify-start">
                        <Shield className="mr-2 h-4 w-4" />
                        Admin Panel
                      </Button>
                    </Link>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          )}

          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Image
                src="/logo.png"
                alt="Zexa Logo"
                width={24}
                height={24}
                loading="eager"
                className="h-6 w-6 object-contain"
              />
            </div>
            <span className="font-bold text-base md:text-xl hidden sm:inline">DXL Music HUB</span>
            <span className="font-bold text-base md:text-xl sm:hidden">DXL</span>
          </Link>

          {/* Navigation Links */}
          {isAuthenticated && (
            <div className="hidden lg:flex items-center gap-4">
              <Link href="/desk">
                <Button variant="ghost" size="sm">
                  Dashboard
                </Button>
              </Link>
              {defaultArtist && (
                <Link href="/desk/artist">
                  <Button variant="ghost" size="sm">
                    <Music className="mr-2 h-4 w-4" />
                    Artist Portal
                  </Button>
                </Link>
              )}
            </div>
          )}
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-4">
          <ThemeToggle />
          {!isAuthenticated ? (
            <div className="flex items-center gap-2">
              <Link href="/auth/signup">
                <Button variant="ghost" size="sm">
                  Sign Up
                </Button>
              </Link>
              <Link href="/auth/sign">
                <Button size="sm">Sign In</Button>
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              {/* Admin Badge */}
              {isAdmin && (
                <Badge
                  variant="secondary"
                  className="hidden sm:flex items-center gap-1"
                >
                  <Shield className="h-3 w-3" />
                  Admin
                </Badge>
              )}

              {/* Artist Badge */}
              {defaultArtist && (
                <Badge
                  variant="outline"
                  className="hidden md:flex items-center gap-1"
                >
                  <Music className="h-3 w-3" />
                  {defaultArtist.name}
                </Badge>
              )}

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-8 w-8 rounded-full"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={user?.image || ""}
                        alt={user?.name || ""}
                      />
                      <AvatarFallback className="text-xs">
                        {user?.name?.charAt(0)?.toUpperCase() ||
                          user?.email?.charAt(0)?.toUpperCase() ||
                          "U"}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {user?.name || "User"}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user?.email || ""}
                      </p>
                      {user?.role && (
                        <Badge variant="secondary" className="w-fit text-xs mt-1">
                          {user.role}
                        </Badge>
                      )}
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />

                  <DropdownMenuItem asChild>
                    <Link href="/dashboard" className="cursor-pointer">
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem asChild>
                    <Link href="/desk/profile" className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem asChild>
                    <Link href="/desk/settings" className="cursor-pointer">
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </Link>
                  </DropdownMenuItem>

                  {/* Admin Panel Link - Only show for admin users */}
                  {isAdmin && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/admin" className="cursor-pointer">
                          <Shield className="mr-2 h-4 w-4" />
                          Admin Panel
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}

                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => signOut()}
                    className="cursor-pointer text-destructive focus:text-destructive"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
