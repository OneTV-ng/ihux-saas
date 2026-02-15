"use client";

import { useState, useEffect, useRef } from "react";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Edit,
  Save,
  Shield,
  Bell,
  Lock,
  CreditCard,
  Loader2,
  Camera,
  Upload,
  ImageIcon,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { FileUpload } from "@/components/ui/file-upload";
import { getRoleColors, getRoleBadgeClasses, getRoleHexColor, generateHeaderGradient } from "@/lib/role-colors";
import { getRoleDisplayName } from "@/lib/role-middleware";

interface UserData {
  id: string;
  name: string;
  email: string;
  username: string | null;
  image: string | null;
  thumbnail: string | null;
  profilePicture: string | null;
  headerBackground: string | null;
  phone: string | null;
  whatsapp: string | null;
  dateOfBirth: string | null;
  address: string | null;
  recordLabel: string | null;
  governmentid?: string | null;
  signature?: string | null;
  verificationStatus?: "updating" | "submitted" | "processing" | "flagged" | "rejected" | "suspended" | "verified";
  verificationSubmittedAt?: Date | null;
  verificationVerifiedAt?: Date | null;
  socialMedia: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    tiktok?: string;
    youtube?: string;
    spotify?: string;
    appleMusic?: string;
  } | null;
  bankDetails: {
    bankName?: string;
    accountNumber?: string;
    accountName?: string;
    sortCode?: string;
    swiftCode?: string;
    paypalEmail?: string;
  } | null;
  role: string | null;
  createdAt: Date;
}

const UserProfilePage = () => {
  // Tab state logic
  const tabNames = [
    { value: "personal", label: "Profile" },
    { value: "social", label: "Social Media" },
    { value: "banking", label: "Banking" },
    { value: "files", label: "Files" },
    { value: "security", label: "Security" },
    { value: "verification", label: "Verification" },
  ];
  const [activeTab, setActiveTab] = useState("personal");
  useEffect(() => {
    if (typeof window !== "undefined") {
      const hash = window.location.hash?.replace(/^#/, "");
      const search = new URLSearchParams(window.location.search);
      const atTab = search.get("@") || search.get("tab");
      const tab = atTab || hash;
      if (tab && tabNames.some(t => t.value === tab)) {
        setActiveTab(tab);
      }
    }
  }, []);
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (typeof window !== "undefined") {
      window.history.replaceState(null, "", `#${tab}`);
    }
  };
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    image: "",
    thumbnail: "",
    profilePicture: "",
    headerBackground: "",
    phone: "",
    whatsapp: "",
    dateOfBirth: "",
    address: "",
    recordLabel: "",
    governmentid: "",
    signature: "",
    socialMedia: {
      facebook: "",
      instagram: "",
      twitter: "",
      tiktok: "",
      youtube: "",
      spotify: "",
      appleMusic: "",
    },
    bankDetails: {
      bankName: "",
      accountNumber: "",
      accountName: "",
      sortCode: "",
      swiftCode: "",
      paypalEmail: "",
    },
  });
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Verification checklist
  const verificationChecklist = [
    { field: 'name', label: 'Full Name', required: true },
    { field: 'username', label: 'Username', required: true },
    { field: 'email', label: 'Email', required: true },
    { field: 'phone', label: 'Phone Number', required: true },
    { field: 'dateOfBirth', label: 'Date of Birth', required: true },
    { field: 'address', label: 'Address', required: true },
    { field: 'recordLabel', label: 'Record Label', required: false },
    { field: 'image', label: 'Profile Photo', required: true },
    { field: 'governmentid', label: 'Government ID', required: true },
    { field: 'signature', label: 'Signature', required: true },
    { field: 'thumbnail', label: 'Thumbnail', required: false },
    { field: 'headerBackground', label: 'Header Background', required: false },
    { field: 'socialMedia', label: 'Social Media (at least one)', required: true },
    { field: 'bankDetails', label: 'Banking Information', required: true },
  ];

  // Calculate verification status
  const calculateVerificationStatus = () => {
    if (!userData) return { completedCount: 0, totalCount: 0, percentage: 0, items: [] };

    const items = verificationChecklist.map(item => {
      let isCompleted = false;

      if (item.field === 'socialMedia') {
        const socialMedia = formData.socialMedia || userData.socialMedia;
        isCompleted = Object.values(socialMedia).some(value => value && value.trim() !== '');
      } else if (item.field === 'bankDetails') {
        const bankDetails = formData.bankDetails || userData.bankDetails;
        isCompleted = !!(bankDetails?.accountNumber && bankDetails?.bankName);
      } else {
        const value = (formData as any)[item.field] || (userData as any)[item.field];
        isCompleted = value && value.toString().trim() !== '';
      }

      return { ...item, isCompleted };
    });

    const requiredItems = items.filter(item => item.required);
    const completedCount = requiredItems.filter(item => item.isCompleted).length;
    const totalCount = requiredItems.length;
    const percentage = Math.round((completedCount / totalCount) * 100);

    return { completedCount, totalCount, percentage, items };
  };

  const verificationStatus = calculateVerificationStatus();
  const verificationDBStatus = userData?.verificationStatus || "updating";
  const isVerified = verificationDBStatus === "verified";
  const isSubmitted = verificationDBStatus === "submitted" || verificationDBStatus === "processing";
  const isRejected = verificationDBStatus === "rejected";
  const canSubmit = (verificationDBStatus === "updating" || verificationDBStatus === "rejected") && verificationStatus.percentage === 100;
  const [isSubmittingVerification, setIsSubmittingVerification] = useState(false);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>("");
  const [isUpdatingField, setIsUpdatingField] = useState(false);

  // Fetch user data on mount
  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/profile");
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to fetch profile");
      }

      setUserData(result.data);
      setFormData({
        name: result.data.name || "",
        username: result.data.username || "",
        image: result.data.image || "",
        thumbnail: result.data.thumbnail || "",
        profilePicture: result.data.profilePicture || "",
        headerBackground: result.data.headerBackground || "",
        phone: result.data.phone || "",
        whatsapp: result.data.whatsapp || "",
        dateOfBirth: result.data.dateOfBirth || "",
        address: result.data.address || "",
        recordLabel: result.data.recordLabel || "",
        governmentid: result.data.governmentid || "",
        signature: result.data.signature || "",
        socialMedia: {
          facebook: result.data.socialMedia?.facebook || "",
          instagram: result.data.socialMedia?.instagram || "",
          twitter: result.data.socialMedia?.twitter || "",
          tiktok: result.data.socialMedia?.tiktok || "",
          youtube: result.data.socialMedia?.youtube || "",
          spotify: result.data.socialMedia?.spotify || "",
          appleMusic: result.data.socialMedia?.appleMusic || "",
        },
        bankDetails: {
          bankName: result.data.bankDetails?.bankName || "",
          accountNumber: result.data.bankDetails?.accountNumber || "",
          accountName: result.data.bankDetails?.accountName || "",
          sortCode: result.data.bankDetails?.sortCode || "",
          swiftCode: result.data.bankDetails?.swiftCode || "",
          paypalEmail: result.data.bankDetails?.paypalEmail || "",
        },
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load profile",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {

    
    if (!formData.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Name is required",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSaving(true);
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to update profile");
      }

      setUserData(result.data);
      setIsEditing(false);
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (userData) {
      setFormData({
        name: userData.name || "",
        username: userData.username || "",
        image: userData.image || "",
        thumbnail: userData.thumbnail || "",
        profilePicture: userData.profilePicture || "",
        headerBackground: userData.headerBackground || "",
        phone: userData.phone || "",
        whatsapp: userData.whatsapp || "",
        dateOfBirth: userData.dateOfBirth || "",
        address: userData.address || "",
        recordLabel: userData.recordLabel || "",
        governmentid: userData.governmentid || "",
        signature: userData.signature || "",
        socialMedia: {
          facebook: userData.socialMedia?.facebook || "",
          instagram: userData.socialMedia?.instagram || "",
          twitter: userData.socialMedia?.twitter || "",
          tiktok: userData.socialMedia?.tiktok || "",
          youtube: userData.socialMedia?.youtube || "",
          spotify: userData.socialMedia?.spotify || "",
          appleMusic: userData.socialMedia?.appleMusic || "",
        },
        bankDetails: {
          bankName: userData.bankDetails?.bankName || "",
          accountNumber: userData.bankDetails?.accountNumber || "",
          accountName: userData.bankDetails?.accountName || "",
          sortCode: userData.bankDetails?.sortCode || "",
          swiftCode: userData.bankDetails?.swiftCode || "",
          paypalEmail: userData.bankDetails?.paypalEmail || "",
        },
      });
    }
    setIsEditing(false);
  };

  const handleQuickFileUpload = async (field: string, file: File) => {
    try {
      setIsUpdatingField(true);

      // Upload file first
      const formDataUpload = new FormData();
      formDataUpload.append("file", file);
      formDataUpload.append("type", field);

      const uploadResponse = await fetch("/api/upload", {
        method: "POST",
        body: formDataUpload,
      });

      const uploadResult = await uploadResponse.json();

      if (!uploadResponse.ok) {
        throw new Error(uploadResult.error || "Failed to upload file");
      }

      // Then update profile with the URL
      await handleQuickUpdate(field, uploadResult.url);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to upload file",
        variant: "destructive",
      });
      setIsUpdatingField(false);
    }
  };

  const handleQuickUpdate = async (field: string, value: string) => {
    try {
      setIsUpdatingField(true);
      const updatePayload: any = {};

      // Always include name to satisfy API validation
      updatePayload.name = formData.name || userData?.name || '';

      // Handle different field types
      if (field === 'socialMedia') {
        // For social media, we need to update the entire object
        updatePayload.socialMedia = {
          ...formData.socialMedia,
          instagram: value, // Default to instagram, can be enhanced
        };
      } else if (field === 'bankDetails') {
        // For bank details, update the account number as primary field
        updatePayload.bankDetails = {
          ...formData.bankDetails,
          accountNumber: value,
          bankName: value, // Also set bank name
        };
      } else {
        updatePayload[field] = value;
      }

      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatePayload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to update field");
      }

      // Update local state
      setUserData(result.data);
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));

      toast({
        title: "Success",
        description: "Field updated successfully",
      });

      setEditingField(null);
      setEditValue("");
      fetchUserData(); // Refresh to get latest data
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update field",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingField(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid File",
        description: "Please select an image file",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please select an image smaller than 5MB",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", "profile");

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to upload image");
      }

      setFormData((prev) => ({ ...prev, image: result.url }));
      toast({
        title: "Success",
        description: "Profile picture uploaded successfully",
      });
    } catch (error: any) {
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload image",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

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

  if (!userData) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <PageBreadcrumb />
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">Failed to load profile data</p>
            </CardContent>
          </Card>
        </div>
        <MobileBottomNav />
      </div>
    );
  }

  const membershipType = userData.role === "admin" ? "Admin" : "Premium";
  const joinDate = new Date(userData.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <PageBreadcrumb />

      <div className="container mx-auto px-4 py-8 pb-24 md:pb-8 max-w-4xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">User Profile</h1>
            <p className="text-muted-foreground">
              Manage your personal information and account settings
            </p>
          </div>
          <div className="flex gap-2">
            {isEditing && (
              <Button
                onClick={handleCancel}
                variant="outline"
                disabled={isSaving}
              >
                Cancel
              </Button>
            )}
            <Button
              onClick={isEditing ? handleSave : () => setIsEditing(true)}
              variant={isEditing ? "default" : "outline"}
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : isEditing ? (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save
                </>
              ) : (
                <>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Profile Card */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="relative group">
                <Avatar className="w-24 h-24">
                  <AvatarImage src={formData.image || userData.image || ""} />
                  <AvatarFallback className="text-2xl">
                    {userData.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                {isEditing && (
                  <>
                    <input
                      name={"file"}
                  
                  type="file"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      accept="image/*"
                      className="hidden"
                      title="Upload Profile Picture"
                      placeholder="Choose profile picture"
                    />
                    <Button
                      size="sm"
                      variant="secondary"
                      className="absolute bottom-0 right-0 rounded-full w-8 h-8 p-0"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                    >
                      {isUploading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Camera className="h-4 w-4" />
                      )}
                    </Button>
                  </>
                )}
              </div>
              <div className="flex-1 text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <h2 className="text-2xl font-bold mb-0">{userData.name}</h2>
                  {isVerified ? (
                    <Badge variant="secondary" className="flex items-center gap-1 bg-green-500/20 text-green-700 dark:text-green-400 border-green-500">
                      <CheckCircle2 className="h-4 w-4" /> Verified
                    </Badge>
                  ) : isSubmitted ? (
                    <Badge variant="secondary" className="flex items-center gap-1 bg-blue-500/20 text-blue-700 dark:text-blue-400 border-blue-500">
                      <Loader2 className="h-4 w-4 animate-spin" /> Submitted
                    </Badge>
                  ) : isRejected ? (
                    <Badge variant="secondary" className="flex items-center gap-1 bg-red-500/20 text-red-700 dark:text-red-400 border-red-500">
                      <XCircle className="h-4 w-4" /> Rejected
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="flex items-center gap-1 text-gray-500 border-gray-300">
                      <AlertCircle className="h-4 w-4" /> Not Verified
                    </Badge>
                  )}
                </div>
                <p className="text-muted-foreground">{userData.email}</p>
                <div className="flex flex-wrap gap-2 mt-3 justify-center sm:justify-start">
                  <Badge variant="default">{membershipType} Member</Badge>
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Joined {joinDate}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs with URL sync and reordered */}
        {/* Tab state logic moved to top of component */}
        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-6">
            {tabNames.map((tab) =>
              tab.value === "verification" ? (
                <TabsTrigger key={tab.value} value={tab.value} className="flex items-center gap-1">
                  {isVerified ? <CheckCircle2 className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
                  {tab.label}
                </TabsTrigger>
              ) : (
                <TabsTrigger key={tab.value} value={tab.value}>{tab.label}</TabsTrigger>
              )
            )}
          </TabsList>

          {/* Verification Tab */}
          <TabsContent value="verification">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {isVerified ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-yellow-500" />
                  )}
                  Verification
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold mb-4">Verification Checklist</h3>
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-muted-foreground mb-2">Required Fields</h4>
                    {verificationStatus.items
                      .filter(item => item.required)
                      .map((item, index) => {
                        const isEditing = editingField === item.field && !['socialMedia', 'bankDetails'].includes(item.field);
                        const isFileField = ['image', 'governmentid', 'signature', 'thumbnail', 'headerBackground'].includes(item.field);

                        return (
                          <div
                            key={index}
                            className={`p-3 rounded-lg border ${
                              item.isCompleted
                                ? 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900'
                                : 'bg-muted/50 border-muted-foreground/20 hover:border-primary/50 cursor-pointer transition-colors'
                            }`}
                            onClick={() => {
                              if (!item.isCompleted && !isEditing) {
                                // For complex fields, navigate to their tab
                                if (item.field === 'socialMedia') {
                                  setActiveTab('social');
                                  setIsEditing(true);
                                } else if (item.field === 'bankDetails') {
                                  setActiveTab('banking');
                                  setIsEditing(true);
                                } else if (['image', 'thumbnail', 'headerBackground', 'governmentid', 'signature'].includes(item.field)) {
                                  // File fields - navigate to Files tab
                                  setActiveTab('files');
                                  setIsEditing(true);
                                  toast({
                                    title: `Upload ${item.label}`,
                                    description: `Please upload your ${item.label.toLowerCase()} in the Files tab.`,
                                  });
                                } else {
                                  // Inline edit for simple fields
                                  setEditingField(item.field);
                                  setEditValue((formData as any)[item.field] || '');
                                }
                              }
                            }}
                          >
                            {isEditing ? (
                              <div className="space-y-2">
                                <div className="flex items-center justify-between mb-2">
                                  <Label className="text-sm font-medium">{item.label}</Label>
                                  <div className="flex gap-1">
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="h-7 w-7 p-0"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setEditingField(null);
                                        setEditValue("");
                                      }}
                                      disabled={isUpdatingField}
                                    >
                                      <XCircle className="h-4 w-4" />
                                    </Button>
                                    {!isFileField && (
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        className="h-7 w-7 p-0 text-green-600"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleQuickUpdate(item.field, editValue);
                                        }}
                                        disabled={isUpdatingField || !editValue}
                                      >
                                        {isUpdatingField ? (
                                          <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                          <CheckCircle2 className="h-4 w-4" />
                                        )}
                                      </Button>
                                    )}
                                  </div>
                                </div>
                                {isFileField ? (
                                  <div className="space-y-2">
                                    <Input
                                      type="file"
                                      accept={item.field === 'governmentid' || item.field === 'signature' ? 'image/*,.pdf' : 'image/*'}
                                      onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                          handleQuickFileUpload(item.field, file);
                                        }
                                      }}
                                      onClick={(e) => e.stopPropagation()}
                                      disabled={isUpdatingField}
                                    />
                                    {isUpdatingField && (
                                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                                        <Loader2 className="h-3 w-3 animate-spin" />
                                        Uploading...
                                      </p>
                                    )}
                                  </div>
                                ) : item.field === 'dateOfBirth' ? (
                                  <Input
                                    type="date"
                                    value={editValue ? (editValue.includes('T') ? editValue.split('T')[0] : editValue) : ''}
                                    onChange={(e) => setEditValue(e.target.value)}
                                    onClick={(e) => e.stopPropagation()}
                                    placeholder={`Enter ${item.label.toLowerCase()}`}
                                  />
                                ) : item.field === 'address' ? (
                                  <Textarea
                                    value={editValue}
                                    onChange={(e) => setEditValue(e.target.value)}
                                    onClick={(e) => e.stopPropagation()}
                                    placeholder={`Enter ${item.label.toLowerCase()}`}
                                    rows={2}
                                  />
                                ) : item.field === 'socialMedia' ? (
                                  <Input
                                    type="url"
                                    value={editValue}
                                    onChange={(e) => setEditValue(e.target.value)}
                                    onClick={(e) => e.stopPropagation()}
                                    placeholder="Enter Instagram URL (e.g., https://instagram.com/username)"
                                  />
                                ) : item.field === 'bankDetails' ? (
                                  <div className="space-y-2">
                                    <Input
                                      type="text"
                                      value={editValue}
                                      onChange={(e) => setEditValue(e.target.value)}
                                      onClick={(e) => e.stopPropagation()}
                                      placeholder="Enter bank name"
                                    />
                                  </div>
                                ) : (
                                  <Input
                                    type="text"
                                    value={editValue}
                                    onChange={(e) => setEditValue(e.target.value)}
                                    onClick={(e) => e.stopPropagation()}
                                    placeholder={`Enter ${item.label.toLowerCase()}`}
                                  />
                                )}
                              </div>
                            ) : (
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  {item.isCompleted ? (
                                    <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                                  ) : (
                                    <XCircle className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                                  )}
                                  <span className={item.isCompleted ? 'text-green-700 dark:text-green-400' : ''}>
                                    {item.label}
                                  </span>
                                </div>
                                {item.isCompleted ? (
                                  <Badge variant="secondary" className="bg-green-500/20 text-green-700 dark:text-green-400">
                                    Complete
                                  </Badge>
                                ) : (
                                  <Badge variant="outline">Click to edit</Badge>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                  </div>
                  <div className="space-y-2 pt-4">
                    <h4 className="text-sm font-medium text-muted-foreground mb-2">Optional Fields</h4>
                    {verificationStatus.items
                      .filter(item => !item.required)
                      .map((item, index) => {
                        const isEditing = editingField === item.field && !['socialMedia', 'bankDetails'].includes(item.field);
                        const isFileField = ['image', 'governmentid', 'signature', 'thumbnail', 'headerBackground'].includes(item.field);

                        return (
                          <div
                            key={index}
                            className={`p-3 rounded-lg border ${
                              item.isCompleted
                                ? 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900'
                                : 'bg-muted/50 border-muted-foreground/20 hover:border-primary/50 cursor-pointer transition-colors'
                            }`}
                            onClick={() => {
                              if (!isEditing) {
                                // For complex fields, navigate to their tab
                                if (item.field === 'socialMedia') {
                                  setActiveTab('social');
                                  setIsEditing(true);
                                } else if (item.field === 'bankDetails') {
                                  setActiveTab('banking');
                                  setIsEditing(true);
                                } else if (['image', 'thumbnail', 'headerBackground', 'governmentid', 'signature'].includes(item.field)) {
                                  // File fields - navigate to Files tab
                                  setActiveTab('files');
                                  setIsEditing(true);
                                  toast({
                                    title: `Upload ${item.label}`,
                                    description: `Please upload your ${item.label.toLowerCase()} in the Files tab.`,
                                  });
                                } else {
                                  // Inline edit for simple fields
                                  setEditingField(item.field);
                                  setEditValue((formData as any)[item.field] || '');
                                }
                              }
                            }}
                          >
                            {isEditing ? (
                              <div className="space-y-2">
                                <div className="flex items-center justify-between mb-2">
                                  <Label className="text-sm font-medium">{item.label}</Label>
                                  <div className="flex gap-1">
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="h-7 w-7 p-0"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setEditingField(null);
                                        setEditValue("");
                                      }}
                                      disabled={isUpdatingField}
                                    >
                                      <XCircle className="h-4 w-4" />
                                    </Button>
                                    {!isFileField && (
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        className="h-7 w-7 p-0 text-green-600"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleQuickUpdate(item.field, editValue);
                                        }}
                                        disabled={isUpdatingField || !editValue}
                                      >
                                        {isUpdatingField ? (
                                          <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                          <CheckCircle2 className="h-4 w-4" />
                                        )}
                                      </Button>
                                    )}
                                  </div>
                                </div>
                                {isFileField ? (
                                  <div className="space-y-2">
                                    <Input
                                      type="file"
                                      accept={item.field === 'governmentid' || item.field === 'signature' ? 'image/*,.pdf' : 'image/*'}
                                      onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                          handleQuickFileUpload(item.field, file);
                                        }
                                      }}
                                      onClick={(e) => e.stopPropagation()}
                                      disabled={isUpdatingField}
                                    />
                                    {isUpdatingField && (
                                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                                        <Loader2 className="h-3 w-3 animate-spin" />
                                        Uploading...
                                      </p>
                                    )}
                                  </div>
                                ) : item.field === 'recordLabel' ? (
                                  <Input
                                    type="text"
                                    value={editValue}
                                    onChange={(e) => setEditValue(e.target.value)}
                                    onClick={(e) => e.stopPropagation()}
                                    placeholder="Enter record label name"
                                  />
                                ) : (
                                  <Input
                                    type="text"
                                    value={editValue}
                                    onChange={(e) => setEditValue(e.target.value)}
                                    onClick={(e) => e.stopPropagation()}
                                    placeholder={`Enter ${item.label.toLowerCase()}`}
                                  />
                                )}
                              </div>
                            ) : (
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  {item.isCompleted ? (
                                    <CheckCircle2 className="h-5 w-5 text-blue-500 flex-shrink-0" />
                                  ) : (
                                    <div className="h-5 w-5 rounded-full border-2 border-muted-foreground/30 flex-shrink-0" />
                                  )}
                                  <span className={item.isCompleted ? 'text-blue-700 dark:text-blue-400' : 'text-muted-foreground'}>
                                    {item.label}
                                  </span>
                                </div>
                                {item.isCompleted ? (
                                  <Badge variant="secondary" className="bg-blue-500/20 text-blue-700 dark:text-blue-400">
                                    Complete
                                  </Badge>
                                ) : (
                                  <Badge variant="outline" className="text-xs">Click to edit</Badge>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                  </div>
                </div>
                {/* Submission logic - Single unified button */}
                {!isVerified && (
                  <div className={`${
                    isSubmitted
                      ? 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900'
                      : isRejected
                      ? 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900'
                      : canSubmit
                      ? 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900'
                      : 'bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-900'
                  } border p-4 rounded-lg mt-4`}>
                    <div className="flex items-start gap-3 mb-3">
                      {isSubmitted ? (
                        <Loader2 className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 animate-spin" />
                      ) : isRejected ? (
                        <XCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0" />
                      ) : canSubmit ? (
                        <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                      ) : (
                        <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                      )}
                      <div>
                        {isSubmitted ? (
                          <>
                            <p className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-2">
                              📋 Verification Submitted - Under Review
                            </p>
                            <p className="text-xs text-blue-700 dark:text-blue-400 leading-relaxed">
                              Your profile has been submitted for verification. Our team is reviewing your information.
                              This typically takes 2-3 working days. You'll receive an email notification once the review is complete.
                            </p>
                          </>
                        ) : isRejected ? (
                          <>
                            <p className="text-sm font-medium text-red-800 dark:text-red-300 mb-2">
                              ❌ Verification Rejected
                            </p>
                            <p className="text-xs text-red-700 dark:text-red-400 leading-relaxed">
                              Your verification was rejected. Please review and update your information, then submit again for verification.
                            </p>
                          </>
                        ) : canSubmit ? (
                          <>
                            <p className="text-sm font-medium text-green-800 dark:text-green-300 mb-2">
                              ✅ Profile Complete - Ready for Verification
                            </p>
                            <p className="text-xs text-green-700 dark:text-green-400 leading-relaxed">
                              All required fields are filled. By submitting, you confirm that all information provided is true and correct.
                              Verification typically takes 2-3 working days, sometimes longer.
                            </p>
                          </>
                        ) : (
                          <>
                            <p className="text-sm font-medium text-yellow-800 dark:text-yellow-300">
                              Complete all required fields to submit for verification
                            </p>
                            <p className="text-xs text-yellow-700 dark:text-yellow-400 mt-1">
                              {verificationStatus.completedCount} of {verificationStatus.totalCount} required fields completed
                            </p>
                          </>
                        )}
                      </div>
                    </div>
                    <Button
                      className="w-full"
                      disabled={isSubmittingVerification || !canSubmit || isSubmitted}
                      variant={canSubmit && !isSubmitted ? "default" : "outline"}
                      onClick={async () => {
                        // If already submitted, do nothing
                        if (isSubmitted) {
                          toast({
                            title: 'Already Submitted',
                            description: 'Your verification request is currently under review.',
                          });
                          return;
                        }

                        // If profile not complete, navigate to first incomplete field
                        if (!canSubmit) {
                          const firstIncomplete = verificationStatus.items.find(
                            item => item.required && !item.isCompleted
                          );
                          if (firstIncomplete) {
                            if (["socialMedia"].includes(firstIncomplete.field)) {
                              setActiveTab('social');
                              setIsEditing(true);
                            } else if (["bankDetails"].includes(firstIncomplete.field)) {
                              setActiveTab('banking');
                              setIsEditing(true);
                            } else if (["image", "thumbnail", "headerBackground", "governmentid", "signature"].includes(firstIncomplete.field)) {
                              setActiveTab('files');
                              setIsEditing(true);
                            } else {
                              setActiveTab('personal');
                              setIsEditing(true);
                            }
                            toast({
                              title: `Complete: ${firstIncomplete.label}`,
                              description: `Please fill in your ${firstIncomplete.label.toLowerCase()} to continue.`,
                            });
                          }
                          return;
                        }

                        // Show confirmation dialog with important information
                        const confirmed = window.confirm(
                          '⚠️ IMPORTANT NOTICE\n\n' +
                          'Before submitting, please confirm that:\n' +
                          '✓ All information provided is TRUE and CORRECT\n' +
                          '✓ Your documents (Government ID & Signature) are authentic\n' +
                          '✓ You understand that false information may result in account suspension\n\n' +
                          'Verification typically takes 2-3 working days.\n\n' +
                          'Do you want to proceed with submission?'
                        );

                        if (!confirmed) return;

                        setIsSubmittingVerification(true);
                        try {
                          const response = await fetch('/api/profile/submit-verification', { method: 'POST' });
                          const result = await response.json();
                          if (!response.ok) throw new Error(result.error || 'Failed to submit for verification');

                          // Show success message with detailed information
                          toast({
                            title: '✅ Verification Submitted Successfully!',
                            description: result.message || 'Your profile has been submitted for verification. Check your email for details.',
                          });

                          // Show additional info toast
                          setTimeout(() => {
                            toast({
                              title: '📧 Email Sent',
                              description: 'We\'ve sent you a confirmation email with processing timeline and next steps.',
                            });
                          }, 1500);

                          fetchUserData();
                        } catch (error) {
                          let message = 'Failed to submit for verification. Please try again.';
                          if (error instanceof Error) message = error.message;
                          toast({ title: '❌ Submission Failed', description: message, variant: 'destructive' });
                        } finally {
                          setIsSubmittingVerification(false);
                        }
                      }}
                    >
                      {isSubmittingVerification ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Submitting...
                        </>
                      ) : isSubmitted ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Under Review
                        </>
                      ) : canSubmit ? (
                        <>
                          <Shield className="h-4 w-4 mr-2" />
                          Submit for Verification
                        </>
                      ) : (
                        <>
                          <Edit className="h-4 w-4 mr-2" />
                          Complete Profile ({verificationStatus.completedCount}/{verificationStatus.totalCount})
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Personal Information Tab */}
          <TabsContent value="personal">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>
                  Update your personal details and contact information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      disabled={!isEditing}
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      value={formData.username}
                      onChange={(e) =>
                        setFormData({ ...formData, username: e.target.value })
                      }
                      disabled={!isEditing}
                      placeholder="Enter your username"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={userData.email}
                    disabled
                  />
                  <p className="text-xs text-muted-foreground">
                    Email cannot be changed
                  </p>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      Phone Number
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      disabled={!isEditing}
                      placeholder="+1 (555) 000-0000"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="whatsapp">WhatsApp Number</Label>
                    <Input
                      id="whatsapp"
                      type="tel"
                      value={formData.whatsapp}
                      onChange={(e) =>
                        setFormData({ ...formData, whatsapp: e.target.value })
                      }
                      disabled={!isEditing}
                      placeholder="+1 (555) 000-0000"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth" className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Date of Birth
                  </Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) =>
                      setFormData({ ...formData, dateOfBirth: e.target.value })
                    }
                    disabled={!isEditing}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address" className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Address
                  </Label>
                  <Textarea
                    id="address"
                    value={formData.address}
                    onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                    disabled={!isEditing}
                    placeholder="Enter your full address"
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="recordLabel">Record Label</Label>
                  <Input
                    id="recordLabel"
                    value={formData.recordLabel}
                    onChange={(e) =>
                      setFormData({ ...formData, recordLabel: e.target.value })
                    }
                    disabled={!isEditing}
                    placeholder="Enter your record label"
                  />
                </div>

                {/* Bottom Action Buttons */}
                <div className="flex justify-end gap-2 pt-6 border-t">
                  {isEditing && (
                    <Button
                      onClick={handleCancel}
                      variant="outline"
                      disabled={isSaving}
                    >
                      Cancel
                    </Button>
                  )}
                  <Button
                    onClick={isEditing ? handleSave : () => setIsEditing(true)}
                    variant={isEditing ? "default" : "outline"}
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : isEditing ? (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save Changes
                      </>
                    ) : (
                      <>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Profile
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Social Media Tab */}
          <TabsContent value="social">
            <Card>
              <CardHeader>
                <CardTitle>Social Media Links</CardTitle>
                <CardDescription>
                  Connect your social media profiles
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="facebook">Facebook</Label>
                  <Input
                    id="facebook"
                    value={formData.socialMedia.facebook}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        socialMedia: { ...formData.socialMedia, facebook: e.target.value },
                      })
                    }
                    disabled={!isEditing}
                    placeholder="https://facebook.com/yourusername"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="instagram">Instagram</Label>
                  <Input
                    id="instagram"
                    value={formData.socialMedia.instagram}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        socialMedia: { ...formData.socialMedia, instagram: e.target.value },
                      })
                    }
                    disabled={!isEditing}
                    placeholder="https://instagram.com/yourusername"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="twitter">Twitter/X</Label>
                  <Input
                    id="twitter"
                    value={formData.socialMedia.twitter}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        socialMedia: { ...formData.socialMedia, twitter: e.target.value },
                      })
                    }
                    disabled={!isEditing}
                    placeholder="https://twitter.com/yourusername"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tiktok">TikTok</Label>
                  <Input
                    id="tiktok"
                    value={formData.socialMedia.tiktok}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        socialMedia: { ...formData.socialMedia, tiktok: e.target.value },
                      })
                    }
                    disabled={!isEditing}
                    placeholder="https://tiktok.com/@yourusername"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="youtube">YouTube</Label>
                  <Input
                    id="youtube"
                    value={formData.socialMedia.youtube}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        socialMedia: { ...formData.socialMedia, youtube: e.target.value },
                      })
                    }
                    disabled={!isEditing}
                    placeholder="https://youtube.com/@yourusername"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="spotify">Spotify Artist Profile</Label>
                  <Input
                    id="spotify"
                    value={formData.socialMedia.spotify}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        socialMedia: { ...formData.socialMedia, spotify: e.target.value },
                      })
                    }
                    disabled={!isEditing}
                    placeholder="https://open.spotify.com/artist/..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="appleMusic">Apple Music Artist Profile</Label>
                  <Input
                    id="appleMusic"
                    value={formData.socialMedia.appleMusic}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        socialMedia: { ...formData.socialMedia, appleMusic: e.target.value },
                      })
                    }
                    disabled={!isEditing}
                    placeholder="https://music.apple.com/artist/..."
                  />
                </div>

                {/* Bottom Action Buttons */}
                <div className="flex justify-end gap-2 pt-6 border-t">
                  {isEditing && (
                    <Button
                      onClick={handleCancel}
                      variant="outline"
                      disabled={isSaving}
                    >
                      Cancel
                    </Button>
                  )}
                  <Button
                    onClick={isEditing ? handleSave : () => setIsEditing(true)}
                    variant={isEditing ? "default" : "outline"}
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : isEditing ? (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save Changes
                      </>
                    ) : (
                      <>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Profile
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Banking Tab */}
          <TabsContent value="banking">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Banking Information
                </CardTitle>
                <CardDescription>
                  Manage your payment and banking details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="bankName">Bank Name</Label>
                  <Input
                    id="bankName"
                    value={formData.bankDetails.bankName}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        bankDetails: { ...formData.bankDetails, bankName: e.target.value },
                      })
                    }
                    disabled={!isEditing}
                    placeholder="Enter bank name"
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="accountName">Account Name</Label>
                    <Input
                      id="accountName"
                      value={formData.bankDetails.accountName}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          bankDetails: { ...formData.bankDetails, accountName: e.target.value },
                        })
                      }
                      disabled={!isEditing}
                      placeholder="Account holder name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="accountNumber">Account Number</Label>
                    <Input
                      id="accountNumber"
                      value={formData.bankDetails.accountNumber}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          bankDetails: { ...formData.bankDetails, accountNumber: e.target.value },
                        })
                      }
                      disabled={!isEditing}
                      placeholder="Enter account number"
                      type="password"
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="sortCode">Sort Code</Label>
                    <Input
                      id="sortCode"
                      value={formData.bankDetails.sortCode}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          bankDetails: { ...formData.bankDetails, sortCode: e.target.value },
                        })
                      }
                      disabled={!isEditing}
                      placeholder="00-00-00"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="swiftCode">SWIFT Code</Label>
                    <Input
                      id="swiftCode"
                      value={formData.bankDetails.swiftCode}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          bankDetails: { ...formData.bankDetails, swiftCode: e.target.value },
                        })
                      }
                      disabled={!isEditing}
                      placeholder="Enter SWIFT/BIC code"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="paypalEmail">PayPal Email</Label>
                  <Input
                    id="paypalEmail"
                    type="email"
                    value={formData.bankDetails.paypalEmail}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        bankDetails: { ...formData.bankDetails, paypalEmail: e.target.value },
                      })
                    }
                    disabled={!isEditing}
                    placeholder="your-paypal@email.com"
                  />
                </div>

                <div className="bg-muted/50 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    🔒 Your banking information is encrypted and secure. It will only be used for royalty payments and never shared with third parties.
                  </p>
                </div>

                {/* Bottom Action Buttons */}
                <div className="flex justify-end gap-2 pt-6 border-t">
                  {isEditing && (
                    <Button
                      onClick={handleCancel}
                      variant="outline"
                      disabled={isSaving}
                    >
                      Cancel
                    </Button>
                  )}
                  <Button
                    onClick={isEditing ? handleSave : () => setIsEditing(true)}
                    variant={isEditing ? "default" : "outline"}
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : isEditing ? (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save Changes
                      </>
                    ) : (
                      <>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Profile
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Files Tab */}
          <TabsContent value="files">
            <Card>
              <CardHeader>
                <CardTitle>File Uploads</CardTitle>
                <CardDescription>
                  Upload and manage your media files
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <FileUpload
                  label="Profile Picture"
                  accept="image/*"
                  maxSize={5}
                  type="profile"
                  value={formData.image}
                  disabled={!isEditing}
                  onUploadComplete={(url) =>
                    setFormData({ ...formData, image: url })
                  }
                />

                <FileUpload
                  label="Thumbnail"
                  accept="image/*"
                  maxSize={5}
                  type="thumbnail"
                  value={formData.thumbnail}
                  disabled={!isEditing}
                  onUploadComplete={(url) =>
                    setFormData({ ...formData, thumbnail: url })
                  }
                />

                <FileUpload
                  label="Header Background"
                  accept="image/*"
                  maxSize={10}
                  type="header"
                  value={formData.headerBackground}
                  disabled={!isEditing}
                  onUploadComplete={(url) =>
                    setFormData({ ...formData, headerBackground: url })
                  }
                />

                <FileUpload
                  label="Audio Sample (MP3)"
                  accept="audio/*"
                  maxSize={10}
                  type="audio"
                  disabled={!isEditing}
                  onUploadComplete={(url, info) => {
                    console.log("Audio uploaded:", url, info);
                  }}
                />

                <FileUpload
                  label="Documents (PDF, DOC)"
                  accept=".pdf,.doc,.docx"
                  maxSize={5}
                  type="document"
                  disabled={!isEditing}
                  onUploadComplete={(url, info) => {
                    console.log("Document uploaded:", url, info);
                  }}
                />

                <FileUpload
                  label="Government ID"
                  accept="image/*,.pdf"
                  maxSize={5}
                  type="governmentid"
                  value={formData.governmentid || ""}
                  disabled={!isEditing}
                  onUploadComplete={(url) =>
                    setFormData((prev) => ({ ...prev, governmentid: url }))
                  }
                />

                <div className="flex items-center gap-2 mb-4">
                  <span className="font-medium">Government ID:</span>
                  {formData.governmentid ? (
                    <a href={formData.governmentid} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">View</a>
                  ) : (
                    <Badge variant="outline">Pending</Badge>
                  )}
                </div>

                <FileUpload
                  label="Signature"
                  accept="image/*,.pdf"
                  maxSize={2}
                  type="signature"
                  value={formData.signature || ""}
                  disabled={!isEditing}
                  onUploadComplete={(url) =>
                    setFormData((prev) => ({ ...prev, signature: url }))
                  }
                />

                <div className="flex items-center gap-2 mb-4">
                  <span className="font-medium">Signature:</span>
                  {formData.signature ? (
                    <a href={formData.signature} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">View</a>
                  ) : (
                    <Badge variant="outline">Pending</Badge>
                  )}
                </div>

                {/* Bottom Action Buttons */}
                <div className="flex justify-end gap-2 pt-6 border-t">
                  {isEditing && (
                    <Button
                      onClick={handleCancel}
                      variant="outline"
                      disabled={isSaving}
                    >
                      Cancel
                    </Button>
                  )}
                  <Button
                    onClick={isEditing ? handleSave : () => setIsEditing(true)}
                    variant={isEditing ? "default" : "outline"}
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : isEditing ? (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save Changes
                      </>
                    ) : (
                      <>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Profile
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security">
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lock className="h-5 w-5" />
                    Password & Authentication
                  </CardTitle>
                  <CardDescription>
                    Manage your password and security settings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Password</p>
                      <p className="text-sm text-muted-foreground">
                        Last changed 3 months ago
                      </p>
                    </div>
                    <Button variant="outline">Change Password</Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Two-Factor Authentication</p>
                      <p className="text-sm text-muted-foreground">
                        Add an extra layer of security
                      </p>
                    </div>
                    <Button variant="outline">Enable</Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Active Sessions
                  </CardTitle>
                  <CardDescription>
                    Manage devices where you're logged in
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">Chrome on MacBook Pro</p>
                        <p className="text-sm text-muted-foreground">
                          New York, USA • Active now
                        </p>
                      </div>
                      <Badge variant="secondary">Current</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">Safari on iPhone 14</p>
                        <p className="text-sm text-muted-foreground">
                          New York, USA • 2 hours ago
                        </p>
                      </div>
                      <Button variant="ghost" size="sm">
                        Revoke
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notification Preferences
                </CardTitle>
                <CardDescription>
                  Choose what notifications you want to receive
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Email Notifications</p>
                      <p className="text-sm text-muted-foreground">
                        Receive updates via email
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      Enabled
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">New Follower Alerts</p>
                      <p className="text-sm text-muted-foreground">
                        Get notified when someone follows you
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      Enabled
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Music Releases</p>
                      <p className="text-sm text-muted-foreground">
                        Notifications about new releases from artists you follow
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      Enabled
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Royalty Updates</p>
                      <p className="text-sm text-muted-foreground">
                        Get notified about earnings and payments
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      Enabled
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Marketing Emails</p>
                      <p className="text-sm text-muted-foreground">
                        Receive promotional content and offers
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      Disabled
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Billing Tab */}
          <TabsContent value="billing">
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Membership & Billing
                  </CardTitle>
                  <CardDescription>
                    Manage your subscription and payment methods
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 border rounded-lg bg-primary/5">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-lg">Premium Plan</h3>
                      <Badge>Active</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                      Unlimited uploads, advanced analytics, priority support
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold">$9.99/month</span>
                      <Button variant="outline">Manage Plan</Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Payment Method</Label>
                    <div className="p-3 border rounded-lg flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <CreditCard className="h-5 w-5" />
                        <div>
                          <p className="font-medium">•••• •••• •••• 4242</p>
                          <p className="text-sm text-muted-foreground">
                            Expires 12/2025
                          </p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        Edit
                      </Button>
                    </div>
                  </div>

                  <Button variant="outline" className="w-full">
                    View Billing History
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Danger Zone</CardTitle>
                  <CardDescription>
                    Irreversible actions for your account
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="destructive" className="w-full">
                    Delete Account
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
      <MobileBottomNav />
    </div>
  );
};

export default UserProfilePage;
