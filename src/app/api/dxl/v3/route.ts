import { NextRequest } from "next/server";
import { createApiResponse } from "@/lib/dxl-api-handler";
import { SongsHandler } from "@/lib/handlers/songs-handler";
import { UploadsHandler } from "@/lib/handlers/uploads-handler";
import { AdminHandler } from "@/lib/handlers/admin-handler";
import { AuthHandler } from "@/lib/handlers/auth-handler";

// GET handler
export async function GET(request: NextRequest) {
  return handleRequest(request);
}

// POST handler
export async function POST(request: NextRequest) {
  return handleRequest(request);
}

// PATCH handler
export async function PATCH(request: NextRequest) {
  return handleRequest(request);
}

// DELETE handler
export async function DELETE(request: NextRequest) {
  return handleRequest(request);
}

async function handleRequest(request: NextRequest) {
  try {
    // Extract @= action parameter
    const url = new URL(request.url);
    const action = url.searchParams.get("@");

    if (!action) {
      return createApiResponse(
        {
          info: {
            action_requested: "unknown",
            response_module: "system",
            module_version: "3.0.0",
            timestamp: new Date().toISOString(),
            request_id: `req_${Date.now()}`,
            execution_time_ms: 0,
          },
          status: false,
          data: null,
          message: "Missing @= action parameter. Expected format: ?@=module.operation",
          error_details: {
            code: 400,
            type: "BadRequest",
            details: {
              example: "/api/dxl/v3?@=songs.list",
              format: "@=module.operation",
            },
          },
          vendor: {
            name: "iMediaPORT Limited",
            url: "https://imediaport.com",
            copyright: `Copyright © ${new Date().getFullYear()} iMediaPORT Limited`,
          },
        },
        400
      );
    }

    // Parse action into module and operation
    // Split only on first dot to preserve multi-part operations like "check.email"
    const dotIndex = action.indexOf(".");
    const module = dotIndex > 0 ? action.substring(0, dotIndex) : action;
    const operation = dotIndex > 0 ? action.substring(dotIndex + 1) : "";

    if (!module || !operation) {
      return createApiResponse(
        {
          info: {
            action_requested: action,
            response_module: "system",
            module_version: "3.0.0",
            timestamp: new Date().toISOString(),
            request_id: `req_${Date.now()}`,
            execution_time_ms: 0,
          },
          status: false,
          data: null,
          message: "Invalid action format. Expected format: module.operation",
          error_details: {
            code: 400,
            type: "BadRequest",
            details: {
              received: action,
              expected: "module.operation",
              examples: ["songs.list", "uploads.start", "admin.approvals"],
            },
          },
          vendor: {
            name: "iMediaPORT Limited",
            url: "https://imediaport.com",
            copyright: `Copyright © ${new Date().getFullYear()} iMediaPORT Limited`,
          },
        },
        400
      );
    }

    // Route to appropriate handler
    let handler;
    let response;

    switch (module.toLowerCase()) {
      case "songs":
        handler = new SongsHandler();
        response = await handler.process(request, operation);
        break;

      case "uploads":
        handler = new UploadsHandler();
        response = await handler.process(request, operation);
        break;

      case "admin":
        handler = new AdminHandler();
        response = await handler.process(request, operation);
        break;

      case "auth":
        handler = new AuthHandler();
        response = await handler.process(request, operation);
        break;

      default:
        return createApiResponse(
          {
            info: {
              action_requested: action,
              response_module: "system",
              module_version: "3.0.0",
              timestamp: new Date().toISOString(),
              request_id: `req_${Date.now()}`,
              execution_time_ms: 0,
            },
            status: false,
            data: null,
            message: `Unknown module: ${module}`,
            error_details: {
              code: 404,
              type: "NotFound",
              details: {
                module,
                available_modules: ["songs", "uploads", "admin"],
              },
            },
            vendor: {
              name: "iMediaPORT Limited",
              url: "https://imediaport.com",
              copyright: `Copyright © ${new Date().getFullYear()} iMediaPORT Limited`,
            },
          },
          404
        );
    }

    // Determine status code based on response
    let statusCode = 200;
    if (!response.status) {
      const errorCode = response.error_details?.code;
      statusCode = errorCode || 500;
    }

    return createApiResponse(response, statusCode);
  } catch (error: any) {
    console.error("DXL API Error:", error);

    return createApiResponse(
      {
        info: {
          action_requested: "unknown",
          response_module: "system",
          module_version: "3.0.0",
          timestamp: new Date().toISOString(),
          request_id: `req_${Date.now()}`,
          execution_time_ms: 0,
        },
        status: false,
        data: null,
        message: "Internal server error",
        error_details: {
          code: 500,
          type: "InternalError",
          details: process.env.NODE_ENV === "development" ? error.message : undefined,
        },
        vendor: {
          name: "iMediaPORT Limited",
          url: "https://imediaport.com",
          copyright: `Copyright © ${new Date().getFullYear()} iMediaPORT Limited`,
        },
      },
      500
    );
  }
}
