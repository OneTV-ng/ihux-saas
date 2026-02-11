import { NextRequest, NextResponse } from "next/server";

export interface DxlApiResponse {
  info: {
    action_requested: string;
    response_module: string;
    module_version: string;
    timestamp: string;
    request_id: string;
    execution_time_ms: number;
    memory_usage?: string;
  };
  status: boolean;
  data: any;
  message: string;
  error_details?: {
    code: number;
    type: string;
    details?: any;
  };
  vendor: {
    name: string;
    url: string;
    copyright: string;
  };
}

export interface DxlApiContext {
  userId?: string;
  role?: string;
  apiClass?: number;
  tenant?: string;
  platform?: string;
  apiKey?: string;
}

export class DxlApiHandler {
  protected startTime: number;
  protected requestId: string;

  constructor() {
    this.startTime = Date.now();
    this.requestId = this.generateRequestId();
  }

  protected generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  protected getExecutionTime(): number {
    return Date.now() - this.startTime;
  }

  public createResponse(
    action: string,
    module: string,
    status: boolean,
    data: any,
    message: string,
    error?: { code: number; type: string; details?: any }
  ): DxlApiResponse {
    return {
      info: {
        action_requested: action,
        response_module: module,
        module_version: "3.0.0",
        timestamp: new Date().toISOString(),
        request_id: this.requestId,
        execution_time_ms: parseFloat(this.getExecutionTime().toFixed(2)),
      },
      status,
      data,
      message,
      ...(error && { error_details: error }),
      vendor: {
        name: "iMediaPORT Limited",
        url: "https://imediaport.com",
        copyright: `Copyright © ${new Date().getFullYear()} iMediaPORT Limited`,
      },
    };
  }

  public successResponse(action: string, module: string, data: any, message: string): DxlApiResponse {
    return this.createResponse(action, module, true, data, message);
  }

  public errorResponse(
    action: string,
    module: string,
    message: string,
    code: number = 500,
    type: string = "Error",
    details?: any
  ): DxlApiResponse {
    return this.createResponse(
      action,
      module,
      false,
      null,
      message,
      { code, type, details }
    );
  }

  protected async extractContext(request: NextRequest): Promise<DxlApiContext> {
    const apiKey = request.headers.get("X-API-KEY");
    const authHeader = request.headers.get("Authorization");
    const platform = request.headers.get("X-PLATFORM") || "web";
    const tenant = request.headers.get("X-TENANT");

    let userId: string | undefined;
    let role: string | undefined;
    let apiClass: number = 5;

    // Extract from JWT if present
    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.substring(7);
      try {
        // Decode JWT (you may want to verify it properly)
        const payload = JSON.parse(
          Buffer.from(token.split(".")[1], "base64").toString()
        );
        userId = payload.user_id || payload.sub;
        role = payload.role;
        apiClass = payload.api_class || 5;
      } catch (e) {
        // Invalid token, continue with defaults
      }
    }

    return {
      userId,
      role,
      apiClass,
      tenant: tenant || undefined,
      platform,
      apiKey: apiKey || undefined,
    };
  }

  protected checkPermission(context: DxlApiContext, requiredClass: number = 5): boolean {
    return (context.apiClass || 5) >= requiredClass;
  }

  protected checkAdminPermission(context: DxlApiContext): boolean {
    return context.role === "admin" || context.apiClass === 50;
  }

  protected getPaginationParams(request: NextRequest) {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "20");
    const offset = (page - 1) * limit;

    return { page, limit, offset };
  }
}

export function createApiResponse(response: DxlApiResponse, statusCode: number = 200) {
  return NextResponse.json(response, { 
    status: statusCode,
    headers: {
      "Content-Type": "application/json",
      "X-API-Version": "3.0.0",
    }
  });
}
