"use client";

import { useState } from "react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  BadgeCheck,
  Upload,
  FileText,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  Camera,
  IdCard,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const VerificationPage = () => {
  const [verificationStatus, setVerificationStatus] = useState<
    "not-started" | "pending" | "approved" | "rejected"
  >("not-started");

  const verificationSteps = [
    {
      title: "Personal Information",
      description: "Provide your legal name and contact details",
      status: "completed",
    },
    {
      title: "Identity Verification",
      description: "Upload a government-issued ID",
      status: "completed",
    },
    {
      title: "Artist Information",
      description: "Verify your artist profile and music catalog",
      status: "in-progress",
    },
    {
      title: "Review",
      description: "Our team will review your submission",
      status: "pending",
    },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case "in-progress":
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case "pending":
        return <Clock className="h-5 w-5 text-muted-foreground" />;
      default:
        return <Clock className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getVerificationBadge = () => {
    switch (verificationStatus) {
      case "approved":
        return (
          <Badge className="bg-green-500">
            <CheckCircle2 className="mr-1 h-3 w-3" />
            Verified
          </Badge>
        );
      case "pending":
        return (
          <Badge variant="secondary">
            <Clock className="mr-1 h-3 w-3" />
            Pending Review
          </Badge>
        );
      case "rejected":
        return (
          <Badge variant="destructive">
            <XCircle className="mr-1 h-3 w-3" />
            Rejected
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
            <AlertCircle className="mr-1 h-3 w-3" />
            Not Verified
          </Badge>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-8 pb-24 md:pb-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <BadgeCheck className="h-8 w-8" />
              Verification
            </h1>
            {getVerificationBadge()}
          </div>
          <p className="text-muted-foreground">
            Get verified to unlock premium features and build trust with your audience
          </p>
        </div>

        {/* Progress Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Verification Progress</CardTitle>
            <CardDescription>
              Complete all steps to submit your verification request
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Overall Progress</span>
                  <span className="font-medium">50%</span>
                </div>
                <Progress value={50} />
              </div>

              <div className="space-y-3 mt-6">
                {verificationSteps.map((step, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-3 rounded-lg border"
                  >
                    {getStatusIcon(step.status)}
                    <div className="flex-1">
                      <p className="font-medium">{step.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {step.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Benefits Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Verification Benefits</CardTitle>
            <CardDescription>
              What you'll get with a verified badge
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {[
                "Verified badge on your profile and music releases",
                "Increased visibility in search and recommendations",
                "Access to advanced analytics and insights",
                "Priority support from our team",
                "Eligibility for promotional opportunities",
                "Enhanced credibility and trust with listeners",
              ].map((benefit, index) => (
                <li key={index} className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{benefit}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Verification Form */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Submit Verification Request</CardTitle>
            <CardDescription>
              Provide the required information and documents
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-6">
              {/* Legal Name */}
              <div className="space-y-2">
                <Label htmlFor="legalName">Legal Name *</Label>
                <Input
                  id="legalName"
                  placeholder="Enter your full legal name"
                />
              </div>

              {/* Artist Name */}
              <div className="space-y-2">
                <Label htmlFor="artistName">Artist/Stage Name *</Label>
                <Input
                  id="artistName"
                  placeholder="Enter your artist or stage name"
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Contact Email *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@example.com"
                />
              </div>

              {/* Identity Document */}
              <div className="space-y-2">
                <Label htmlFor="idDocument" className="flex items-center gap-2">
                  <IdCard className="h-4 w-4" />
                  Government-Issued ID *
                </Label>
                <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
                  <Upload className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
                  <Input
                    id="idDocument"
                    type="file"
                    accept="image/*,.pdf"
                    className="hidden"
                  />
                  <Label
                    htmlFor="idDocument"
                    className="cursor-pointer text-sm text-muted-foreground"
                  >
                    Click to upload or drag and drop
                    <br />
                    Driver's License, Passport, or National ID (PDF, PNG, JPG)
                  </Label>
                </div>
              </div>

              {/* Selfie with ID */}
              <div className="space-y-2">
                <Label htmlFor="selfie" className="flex items-center gap-2">
                  <Camera className="h-4 w-4" />
                  Selfie with ID *
                </Label>
                <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
                  <Camera className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
                  <Input
                    id="selfie"
                    type="file"
                    accept="image/*"
                    className="hidden"
                  />
                  <Label
                    htmlFor="selfie"
                    className="cursor-pointer text-sm text-muted-foreground"
                  >
                    Upload a clear photo of yourself holding your ID
                    <br />
                    PNG, JPG (max. 10MB)
                  </Label>
                </div>
              </div>

              {/* Supporting Documents */}
              <div className="space-y-2">
                <Label htmlFor="documents" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Supporting Documents (Optional)
                </Label>
                <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
                  <FileText className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
                  <Input
                    id="documents"
                    type="file"
                    multiple
                    accept=".pdf,.doc,.docx"
                    className="hidden"
                  />
                  <Label
                    htmlFor="documents"
                    className="cursor-pointer text-sm text-muted-foreground"
                  >
                    Upload additional proof (music distribution contracts, press
                    coverage, etc.)
                    <br />
                    PDF, DOC, DOCX (max. 20MB total)
                  </Label>
                </div>
              </div>

              {/* Additional Information */}
              <div className="space-y-2">
                <Label htmlFor="additionalInfo">Additional Information</Label>
                <Textarea
                  id="additionalInfo"
                  placeholder="Tell us more about your music career, achievements, or any additional information that supports your verification request..."
                  rows={4}
                />
              </div>

              {/* Alert */}
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Your information will be kept confidential and only used for
                  verification purposes. The review process typically takes 3-5
                  business days.
                </AlertDescription>
              </Alert>

              {/* Submit Button */}
              <div className="flex gap-3">
                <Button type="submit" className="flex-1">
                  <BadgeCheck className="mr-2 h-4 w-4" />
                  Submit for Review
                </Button>
                <Button type="button" variant="outline">
                  Save Draft
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* FAQ */}
        <Card>
          <CardHeader>
            <CardTitle>Frequently Asked Questions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-1">Who can get verified?</h4>
                <p className="text-sm text-muted-foreground">
                  Any artist with an active music catalog and legitimate online
                  presence can apply for verification.
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-1">How long does it take?</h4>
                <p className="text-sm text-muted-foreground">
                  The verification process typically takes 3-5 business days.
                  You'll receive an email notification once reviewed.
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-1">What if I'm rejected?</h4>
                <p className="text-sm text-muted-foreground">
                  You can reapply after 30 days. We'll provide specific feedback
                  on what needs to be improved.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      <MobileBottomNav />
    </div>
  );
};

export default VerificationPage;
