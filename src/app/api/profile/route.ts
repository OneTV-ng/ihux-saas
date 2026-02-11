import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/db";
import { user, userVerification } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getUserVerification, updateVerificationDocuments, createUserVerification } from "@/lib/user-verification";

// GET - Fetch user profile
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userData = await db
      .select({
        id: user.id,
        name: user.name,
        email: user.email,
        username: user.username,
        image: user.image,
        thumbnail: user.thumbnail,
        profilePicture: user.profilePicture,
        headerBackground: user.headerBackground,
        phone: user.phone,
        whatsapp: user.whatsapp,
        dateOfBirth: user.dateOfBirth,
        address: user.address,
        recordLabel: user.recordLabel,
        socialMedia: user.socialMedia,
        bankDetails: user.bankDetails,
        settings: user.settings,
        role: user.role,
        createdAt: user.createdAt,
      })
      .from(user)
      .where(eq(user.id, session.user.id))
      .limit(1);

    if (!userData || userData.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Fetch verification documents from user_verification table
    const verification = await getUserVerification(session.user.id);

    return NextResponse.json({
      success: true,
      data: {
        ...userData[0],
        governmentid: verification?.governmentIdUrl || null,
        signature: verification?.signatureUrl || null,
        verificationStatus: verification?.status || "updating",
        verificationSubmittedAt: verification?.submittedAt || null,
        verificationVerifiedAt: verification?.verifiedAt || null,
      },
    });
  } catch (error) {
    console.error("Error fetching profile:", error);
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 }
    );
  }
}

// PUT - Update user profile
export async function PUT(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    let {
      name,
      username,
      image,
      thumbnail,
      profilePicture,
      headerBackground,
      phone,
      whatsapp,
      dateOfBirth,
      address,
      recordLabel,
      socialMedia,
      bankDetails,
      settings,
      governmentid,
      signature,
    } = body;

    // Fix MySQL date format: convert ISO string to 'YYYY-MM-DD' if needed
    if (dateOfBirth && typeof dateOfBirth === 'string' && dateOfBirth.includes('T')) {
      try {
        const d = new Date(dateOfBirth);
        if (!isNaN(d.getTime())) {
          // Format as YYYY-MM-DD
          const yyyy = d.getFullYear();
          const mm = String(d.getMonth() + 1).padStart(2, '0');
          const dd = String(d.getDate()).padStart(2, '0');
          dateOfBirth = `${yyyy}-${mm}-${dd}`;
        }
      } catch {}
    }

    // Validate input
    if (!name || name.trim().length === 0) {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      );
    }

    // Check if username is already taken (if provided and changed)
    if (username) {
      const existingUser = await db
        .select()
        .from(user)
        .where(eq(user.username, username))
        .limit(1);

      if (existingUser.length > 0 && existingUser[0].id !== session.user.id) {
        return NextResponse.json(
          { error: "Username already taken" },
          { status: 400 }
        );
      }
    }

    // Update user
    const updateData: any = {
      name: name.trim(),
      updatedAt: new Date(),
    };

    if (username !== undefined) {
      updateData.username = username.trim() || null;
    }

    if (image !== undefined) {
      updateData.image = image || null;
    }

    if (thumbnail !== undefined) {
      updateData.thumbnail = thumbnail || null;
    }

    if (profilePicture !== undefined) {
      updateData.profilePicture = profilePicture || null;
    }

    if (headerBackground !== undefined) {
      updateData.headerBackground = headerBackground || null;
    }

    if (phone !== undefined) {
      updateData.phone = phone || null;
    }

    if (whatsapp !== undefined) {
      updateData.whatsapp = whatsapp || null;
    }

    if (dateOfBirth !== undefined) {
      updateData.dateOfBirth = dateOfBirth || null;
    }

    if (address !== undefined) {
      updateData.address = address || null;
    }

    if (recordLabel !== undefined) {
      updateData.recordLabel = recordLabel || null;
    }

    if (socialMedia !== undefined) {
      updateData.socialMedia = socialMedia || null;
    }

    if (bankDetails !== undefined) {
      updateData.bankDetails = bankDetails || null;
    }

    if (settings !== undefined) {
      updateData.settings = settings || null;
    }

    await db
      .update(user)
      .set(updateData)
      .where(eq(user.id, session.user.id));

    // Handle verification documents (government ID and signature)
    if (governmentid !== undefined || signature !== undefined) {
      // Check if verification record exists
      const existingVerification = await getUserVerification(session.user.id);

      if (existingVerification) {
        // Update existing verification record
        await updateVerificationDocuments(session.user.id, {
          governmentIdUrl: governmentid !== undefined ? governmentid : existingVerification.governmentIdUrl,
          signatureUrl: signature !== undefined ? signature : existingVerification.signatureUrl,
        });
      } else {
        // Create new verification record
        await createUserVerification(session.user.id, {
          governmentIdUrl: governmentid || undefined,
          signatureUrl: signature || undefined,
        });
      }
    }

    // Fetch updated user data
    const updatedUser = await db
      .select({
        id: user.id,
        name: user.name,
        email: user.email,
        username: user.username,
        image: user.image,
        thumbnail: user.thumbnail,
        profilePicture: user.profilePicture,
        headerBackground: user.headerBackground,
        phone: user.phone,
        whatsapp: user.whatsapp,
        dateOfBirth: user.dateOfBirth,
        address: user.address,
        recordLabel: user.recordLabel,
        socialMedia: user.socialMedia,
        bankDetails: user.bankDetails,
        settings: user.settings,
        role: user.role,
        createdAt: user.createdAt,
      })
      .from(user)
      .where(eq(user.id, session.user.id))
      .limit(1);

    // Fetch updated verification documents
    const updatedVerification = await getUserVerification(session.user.id);

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
      data: {
        ...updatedUser[0],
        governmentid: updatedVerification?.governmentIdUrl || null,
        signature: updatedVerification?.signatureUrl || null,
        verificationStatus: updatedVerification?.status || "updating",
        verificationSubmittedAt: updatedVerification?.submittedAt || null,
        verificationVerifiedAt: updatedVerification?.verifiedAt || null,
      },
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}
