import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth-server";
import {
  getUserVerification,
  approveVerification,
  rejectVerification,
  flagVerification,
  suspendVerification,
  updateVerificationStatus,
} from "@/lib/user-verification";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const verification = await getUserVerification(id);
    return NextResponse.json({ verification });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch verification";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAdmin();
    const { id } = await params;
    const body = await req.json();
    const { status, remark, rejectionReason, flagReason } = body;
    const reviewerId = session.user.id;

    let result;
    switch (status) {
      case "verified":
        result = await approveVerification(id, reviewerId, remark);
        break;
      case "rejected":
        result = await rejectVerification(id, reviewerId, rejectionReason || "Rejected by admin");
        break;
      case "flagged":
        result = await flagVerification(id, reviewerId, flagReason || "Flagged by admin");
        break;
      case "suspended":
        result = await suspendVerification(id, reviewerId, remark || "Suspended by admin");
        break;
      default:
        result = await updateVerificationStatus(id, status, { remark });
    }

    return NextResponse.json({ verification: result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update verification";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
