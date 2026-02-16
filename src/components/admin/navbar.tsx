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
import { LogOut, Shield, User, Menu, Home, LayoutDashboard, Settings, Music, Users, Upload, Flag, BarChart3 } from "lucide-react";
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
        {/* Logo/Brand - Branded for SingFLEX */}
        <div className="flex items-center gap-2 md:gap-6">
          {/* Mobile Menu Toggle */}
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
                {isAuthenticated && isAdmin ? (
                  <>
                    <Link href="/admin" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="ghost" className="w-full justify-start">
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        Admin Home
                      </Button>
                    </Link>
                    <div className="border-t pt-2 mt-2">
                      <p className="text-xs font-semibold text-muted-foreground px-2 mb-2">Admin Tools</p>
                    </div>
                    <Link href="/admin/users" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="ghost" className="w-full justify-start">
                        <Users className="mr-2 h-4 w-4" />
                        User Management
                      </Button>
                    </Link>
                    <Link href="/admin/songs" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="ghost" className="w-full justify-start">
                        <Music className="mr-2 h-4 w-4" />
                        Songs Management
                      </Button>
                    </Link>
                    <Link href="/admin/upload" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="ghost" className="w-full justify-start">
                        <Upload className="mr-2 h-4 w-4" />
                        Upload Songs
                      </Button>
                    </Link>
                    <Link href="/admin/moderation" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="ghost" className="w-full justify-start">
                        <Flag className="mr-2 h-4 w-4" />
                        Moderation
                      </Button>
                    </Link>
                    <Link href="/admin/reports" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="ghost" className="w-full justify-start">
                        <BarChart3 className="mr-2 h-4 w-4" />
                        Reports
                      </Button>
                    </Link>
                    <Link href="/admin/settings" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="ghost" className="w-full justify-start">
                        <Settings className="mr-2 h-4 w-4" />
                        Settings
                      </Button>
                    </Link>
                    <div className="border-t pt-2 mt-2">
                      <Button
                        onClick={() => {
                          signOut();
                          setMobileMenuOpen(false);
                        }}
                        variant="ghost"
                        className="w-full justify-start text-destructive hover:text-destructive"
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        Sign Out
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <Link href="/auth/signup" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="ghost" className="w-full justify-start">
                        Sign Up
                      </Button>
                    </Link>
                    <Link href="/auth/signin" onClick={() => setMobileMenuOpen(false)}>
                      <Button className="w-full justify-start">
                        Sign In
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>

          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white border border-primary">
              <Image
                src="/images/tenant/sflogo.png"
                alt="SingFLEX Logo"
                width={32}
                height={32}
                loading="eager"
                className="h-8 w-8 object-contain"
              />
            </div>
            <span className="font-bold text-base md:text-xl hidden sm:inline text-primary">Admin - SingFLEX Global Distributions</span>
            <span className="font-bold text-base md:text-xl sm:hidden text-primary">Admin - SingFLEX</span>
          </Link>

          {/* Admin Navigation Links */}
          {isAuthenticated && isAdmin && (
            <div className="hidden lg:flex items-center gap-2">
              <Link href="/admin/users">
                <Button variant="ghost" size="sm" className="text-xs">
                  <Users className="mr-1 h-4 w-4" />
                  Users
                </Button>
              </Link>
              <Link href="/admin/songs">
                <Button variant="ghost" size="sm" className="text-xs">
                  <Music className="mr-1 h-4 w-4" />
                  Songs
                </Button>
              </Link>
              <Link href="/admin/upload">
                <Button variant="ghost" size="sm" className="text-xs">
                  <Upload className="mr-1 h-4 w-4" />
                  Upload
                </Button>
              </Link>
              <Link href="/admin/moderation">
                <Button variant="ghost" size="sm" className="text-xs">
                  <Flag className="mr-1 h-4 w-4" />
                  Moderation
                </Button>
              </Link>
              <Link href="/admin/reports">
                <Button variant="ghost" size="sm" className="text-xs">
                  <BarChart3 className="mr-1 h-4 w-4" />
                  Reports
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-4">
          <ThemeToggle />
          {isLoading ? (
            <div className="h-9 w-20 bg-muted rounded animate-pulse" />
          ) : !isAuthenticated ? (
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
