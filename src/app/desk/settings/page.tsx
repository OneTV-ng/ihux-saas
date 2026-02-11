"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import Navbar from "@/components/landing/navbar";
import { MobileBottomNav } from "@/components/mobile-bottom-nav";
import { PageBreadcrumb } from "@/components/page-breadcrumb";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { themes, applyTheme, applyCustomTheme } from "@/lib/themes";
import {
  Palette,
  Bell,
  Shield,
  Globe,
  Save,
  Loader2,
  Check,
  Moon,
  Sun,
  Monitor,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface UserSettings {
  theme?: string;
  customTheme?: {
    primary?: string;
    secondary?: string;
    accent?: string;
    background?: string;
  };
  notifications?: {
    email?: boolean;
    push?: boolean;
    sms?: boolean;
  };
  privacy?: {
    profileVisibility?: string;
    showEmail?: boolean;
    showPhone?: boolean;
  };
  language?: string;
  timezone?: string;
}

export default function SettingsPage() {
  const { theme: systemTheme, setTheme: setSystemTheme } = useTheme();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { toast } = useToast();

  const [settings, setSettings] = useState<UserSettings>({
    theme: "default",
    customTheme: {
      primary: "#10b981",
      secondary: "#8b5cf6",
      accent: "#f59e0b",
      background: "#09090b",
    },
    notifications: {
      email: true,
      push: false,
      sms: false,
    },
    privacy: {
      profileVisibility: "public",
      showEmail: false,
      showPhone: false,
    },
    language: "en",
    timezone: "UTC",
  });

  const [customTheme, setCustomTheme] = useState({
    primary: "#10b981",
    secondary: "#8b5cf6",
    accent: "#f59e0b",
    background: "#09090b",
  });

  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/profile");
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to fetch settings");
      }

      if (result.data.settings) {
        setSettings(result.data.settings);
        if (result.data.settings.theme) {
          applyTheme(result.data.settings.theme, systemTheme === "dark" ? "dark" : "light");
        }
        if (result.data.settings.customTheme) {
          setCustomTheme(result.data.settings.customTheme);
        }
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load settings",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    try {
      setIsSaving(true);
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          settings,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to save settings");
      }

      toast({
        title: "Success",
        description: "Settings saved successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save settings",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleThemeSelect = (themeId: string) => {
    setSettings({ ...settings, theme: themeId });
    applyTheme(themeId, systemTheme === "dark" ? "dark" : "light");
    setSelectedPreset(null);
  };

  const handleCustomThemeChange = (key: string, value: string) => {
    const newCustomTheme = { ...customTheme, [key]: value };
    setCustomTheme(newCustomTheme);
    setSettings({ ...settings, customTheme: newCustomTheme });
    applyCustomTheme(newCustomTheme);
  };

  const applyCustomPreset = (preset: "custom1" | "custom2") => {
    const presets = {
      custom1: {
        primary: "#06b6d4",
        secondary: "#ec4899",
        accent: "#fbbf24",
        background: "#111827",
      },
      custom2: {
        primary: "#f97316",
        secondary: "#84cc16",
        accent: "#8b5cf6",
        background: "#1e293b",
      },
    };

    const selected = presets[preset];
    setCustomTheme(selected);
    setSettings({ ...settings, customTheme: selected, theme: preset });
    applyCustomTheme(selected);
    setSelectedPreset(preset);
  };

  if (!mounted) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <PageBreadcrumb />
        <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
        <MobileBottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <PageBreadcrumb />

      <div className="container mx-auto px-4 py-8 pb-24 md:pb-8 max-w-6xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Settings</h1>
            <p className="text-muted-foreground">
              Customize your experience and preferences
            </p>
          </div>
          <Button onClick={handleSaveSettings} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save All
              </>
            )}
          </Button>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="appearance" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
            <TabsTrigger value="appearance">
              <Palette className="mr-2 h-4 w-4" />
              Appearance
            </TabsTrigger>
            <TabsTrigger value="notifications">
              <Bell className="mr-2 h-4 w-4" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="privacy">
              <Shield className="mr-2 h-4 w-4" />
              Privacy
            </TabsTrigger>
            <TabsTrigger value="general">
              <Globe className="mr-2 h-4 w-4" />
              General
            </TabsTrigger>
          </TabsList>

          {/* Appearance Tab */}
          <TabsContent value="appearance" className="space-y-6">
            {/* System Theme */}
            <Card>
              <CardHeader>
                <CardTitle>System Theme Mode</CardTitle>
                <CardDescription>
                  Choose between light, dark, or system preference
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  <Button
                    variant={systemTheme === "light" ? "default" : "outline"}
                    onClick={() => setSystemTheme("light")}
                    className="flex flex-col items-center gap-2 h-auto py-4"
                  >
                    <Sun className="h-6 w-6" />
                    <span>Light</span>
                  </Button>
                  <Button
                    variant={systemTheme === "dark" ? "default" : "outline"}
                    onClick={() => setSystemTheme("dark")}
                    className="flex flex-col items-center gap-2 h-auto py-4"
                  >
                    <Moon className="h-6 w-6" />
                    <span>Dark</span>
                  </Button>
                  <Button
                    variant={systemTheme === "system" ? "default" : "outline"}
                    onClick={() => setSystemTheme("system")}
                    className="flex flex-col items-center gap-2 h-auto py-4"
                  >
                    <Monitor className="h-6 w-6" />
                    <span>System</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Preset Themes */}
            <Card>
              <CardHeader>
                <CardTitle>Color Themes</CardTitle>
                <CardDescription>
                  Choose from 12 distinctive preset themes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {themes.map((theme) => (
                    <button
                      key={theme.id}
                      onClick={() => handleThemeSelect(theme.id)}
                      className={`relative p-4 rounded-lg border-2 transition-all hover:scale-105 ${
                        settings.theme === theme.id
                          ? "border-primary ring-2 ring-primary/20"
                          : "border-border"
                      }`}
                      style={{
                        background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.secondary})`,
                      }}
                    >
                      {settings.theme === theme.id && (
                        <div className="absolute top-2 right-2 bg-white rounded-full p-1">
                          <Check className="h-3 w-3 text-primary" />
                        </div>
                      )}
                      <div className="text-white font-semibold text-sm mb-1">
                        {theme.name}
                      </div>
                      <div className="flex gap-1">
                        <div
                          className="h-6 w-6 rounded-full border-2 border-white"
                          style={{ backgroundColor: theme.colors.primary }}
                        />
                        <div
                          className="h-6 w-6 rounded-full border-2 border-white"
                          style={{ backgroundColor: theme.colors.secondary }}
                        />
                        <div
                          className="h-6 w-6 rounded-full border-2 border-white"
                          style={{ backgroundColor: theme.colors.accent }}
                        />
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Custom Themes */}
            <Card>
              <CardHeader>
                <CardTitle>Custom Themes</CardTitle>
                <CardDescription>
                  Create your own custom color schemes
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Preset Custom Themes */}
                <div>
                  <Label className="mb-3 block">Quick Custom Presets</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => applyCustomPreset("custom1")}
                      className={`p-4 rounded-lg border-2 transition-all hover:scale-105 ${
                        selectedPreset === "custom1"
                          ? "border-primary ring-2 ring-primary/20"
                          : "border-border"
                      }`}
                      style={{
                        background: "linear-gradient(135deg, #06b6d4, #ec4899)",
                      }}
                    >
                      <div className="text-white font-semibold mb-2">Neon Glow</div>
                      <div className="flex gap-1">
                        <div className="h-6 w-6 rounded-full bg-cyan-500 border-2 border-white" />
                        <div className="h-6 w-6 rounded-full bg-pink-500 border-2 border-white" />
                        <div className="h-6 w-6 rounded-full bg-amber-400 border-2 border-white" />
                      </div>
                    </button>

                    <button
                      onClick={() => applyCustomPreset("custom2")}
                      className={`p-4 rounded-lg border-2 transition-all hover:scale-105 ${
                        selectedPreset === "custom2"
                          ? "border-primary ring-2 ring-primary/20"
                          : "border-border"
                      }`}
                      style={{
                        background: "linear-gradient(135deg, #f97316, #84cc16)",
                      }}
                    >
                      <div className="text-white font-semibold mb-2">Tropical</div>
                      <div className="flex gap-1">
                        <div className="h-6 w-6 rounded-full bg-orange-500 border-2 border-white" />
                        <div className="h-6 w-6 rounded-full bg-lime-500 border-2 border-white" />
                        <div className="h-6 w-6 rounded-full bg-purple-500 border-2 border-white" />
                      </div>
                    </button>
                  </div>
                </div>

                {/* Custom Color Pickers */}
                <div className="space-y-4">
                  <Label>Or Build Your Own</Label>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="primary">Primary Color</Label>
                      <div className="flex gap-2">
                        <Input
                          id="primary"
                          type="color"
                          value={customTheme.primary}
                          onChange={(e) =>
                            handleCustomThemeChange("primary", e.target.value)
                          }
                          className="w-20 h-10 cursor-pointer"
                        />
                        <Input
                          type="text"
                          value={customTheme.primary}
                          onChange={(e) =>
                            handleCustomThemeChange("primary", e.target.value)
                          }
                          className="flex-1"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="secondary">Secondary Color</Label>
                      <div className="flex gap-2">
                        <Input
                          id="secondary"
                          type="color"
                          value={customTheme.secondary}
                          onChange={(e) =>
                            handleCustomThemeChange("secondary", e.target.value)
                          }
                          className="w-20 h-10 cursor-pointer"
                        />
                        <Input
                          type="text"
                          value={customTheme.secondary}
                          onChange={(e) =>
                            handleCustomThemeChange("secondary", e.target.value)
                          }
                          className="flex-1"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="accent">Accent Color</Label>
                      <div className="flex gap-2">
                        <Input
                          id="accent"
                          type="color"
                          value={customTheme.accent}
                          onChange={(e) =>
                            handleCustomThemeChange("accent", e.target.value)
                          }
                          className="w-20 h-10 cursor-pointer"
                        />
                        <Input
                          type="text"
                          value={customTheme.accent}
                          onChange={(e) =>
                            handleCustomThemeChange("accent", e.target.value)
                          }
                          className="flex-1"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="background">Background Color</Label>
                      <div className="flex gap-2">
                        <Input
                          id="background"
                          type="color"
                          value={customTheme.background}
                          onChange={(e) =>
                            handleCustomThemeChange("background", e.target.value)
                          }
                          className="w-20 h-10 cursor-pointer"
                        />
                        <Input
                          type="text"
                          value={customTheme.background}
                          onChange={(e) =>
                            handleCustomThemeChange("background", e.target.value)
                          }
                          className="flex-1"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>
                  Manage how you receive notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive notifications via email
                    </p>
                  </div>
                  <Switch
                    checked={settings.notifications?.email}
                    onCheckedChange={(checked) =>
                      setSettings({
                        ...settings,
                        notifications: { ...settings.notifications, email: checked },
                      })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Push Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive push notifications on your device
                    </p>
                  </div>
                  <Switch
                    checked={settings.notifications?.push}
                    onCheckedChange={(checked) =>
                      setSettings({
                        ...settings,
                        notifications: { ...settings.notifications, push: checked },
                      })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>SMS Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive notifications via SMS
                    </p>
                  </div>
                  <Switch
                    checked={settings.notifications?.sms}
                    onCheckedChange={(checked) =>
                      setSettings({
                        ...settings,
                        notifications: { ...settings.notifications, sms: checked },
                      })
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Privacy Tab */}
          <TabsContent value="privacy">
            <Card>
              <CardHeader>
                <CardTitle>Privacy Settings</CardTitle>
                <CardDescription>
                  Control your privacy and data visibility
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Profile Visibility</Label>
                  <Select
                    value={settings.privacy?.profileVisibility || "public"}
                    onValueChange={(value) =>
                      setSettings({
                        ...settings,
                        privacy: { ...settings.privacy, profileVisibility: value },
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">Public</SelectItem>
                      <SelectItem value="private">Private</SelectItem>
                      <SelectItem value="friends">Friends Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Show Email Address</Label>
                    <p className="text-sm text-muted-foreground">
                      Display your email on your public profile
                    </p>
                  </div>
                  <Switch
                    checked={settings.privacy?.showEmail}
                    onCheckedChange={(checked) =>
                      setSettings({
                        ...settings,
                        privacy: { ...settings.privacy, showEmail: checked },
                      })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Show Phone Number</Label>
                    <p className="text-sm text-muted-foreground">
                      Display your phone number on your public profile
                    </p>
                  </div>
                  <Switch
                    checked={settings.privacy?.showPhone}
                    onCheckedChange={(checked) =>
                      setSettings({
                        ...settings,
                        privacy: { ...settings.privacy, showPhone: checked },
                      })
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* General Tab */}
          <TabsContent value="general">
            <Card>
              <CardHeader>
                <CardTitle>General Settings</CardTitle>
                <CardDescription>
                  Manage language and regional preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Language</Label>
                  <Select
                    value={settings.language || "en"}
                    onValueChange={(value) =>
                      setSettings({ ...settings, language: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Español</SelectItem>
                      <SelectItem value="fr">Français</SelectItem>
                      <SelectItem value="de">Deutsch</SelectItem>
                      <SelectItem value="pt">Português</SelectItem>
                      <SelectItem value="zh">中文</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Timezone</Label>
                  <Select
                    value={settings.timezone || "UTC"}
                    onValueChange={(value) =>
                      setSettings({ ...settings, timezone: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UTC">UTC</SelectItem>
                      <SelectItem value="America/New_York">Eastern Time</SelectItem>
                      <SelectItem value="America/Chicago">Central Time</SelectItem>
                      <SelectItem value="America/Denver">Mountain Time</SelectItem>
                      <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                      <SelectItem value="Europe/London">London</SelectItem>
                      <SelectItem value="Europe/Paris">Paris</SelectItem>
                      <SelectItem value="Asia/Tokyo">Tokyo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <MobileBottomNav />
    </div>
  );
}
