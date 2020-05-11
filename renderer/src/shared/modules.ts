// Interfaces
export interface RequestContent { cycleId: string, method: string, path: string, headers: Map<string, string>, body?: string }
export interface ResponseContent { cycleId: string, status: string, statusCode: number, headers: Map<string, string>, body?: string }
export interface UpdatedContent { action: string, contentType: string, updatedContent: RequestContent | ResponseContent }

// Enums
export enum ContentType {
  request, response
}

export enum InterceptAction {
  send, drop
}

// Type alias
export type InterceptResult = (action: InterceptAction, contentType: ContentType, updatedContent: RequestContent | ResponseContent) => void
export type AnyContent = RequestContent | ResponseContent