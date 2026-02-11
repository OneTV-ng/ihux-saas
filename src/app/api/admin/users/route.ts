import { NextRequest, NextResponse } from "next/server";
import { getUsers } from "@/utils/users";
import { requireAdmin } from "@/lib/auth-server";

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const offset = (page - 1) * limit;
    const sortBy = searchParams.get("sortBy") || undefined;
    let sortDirection = searchParams.get("sortDirection") || undefined;
    if (sortDirection !== "asc" && sortDirection !== "desc") {
      sortDirection = undefined;
    }
    const role = searchParams.get("role") || undefined;
    const status = searchParams.get("status") || undefined;
    const email = searchParams.get("email") || undefined;
    const name = searchParams.get("name") || undefined;
    const search = searchParams.get("search") || undefined;

    const { users, total } = await getUsers({
      limit,
      offset,
      sortBy,
      sortDirection,
      role,
      status,
      email,
      name,
      search,
    });

    return NextResponse.json({
      users,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    const message = error instanceof Error ? error.message : "Failed to fetch users";
    const statusCode = message.includes("Forbidden") || message.includes("Unauthorized") || message.includes("Admin") ? 403 : 500;
    return NextResponse.json(
      { error: message },
      { status: statusCode },
    );
  }
}
