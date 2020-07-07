/**
 * IMPORTANT: Only change this file on its origin, i.e /root/shared/, since this file is copied every time "npm run start"
 * is run. If this file is modified inside main or renderer modules, its content will be overwritten by the content on the original file
 */

// Interfaces
export type HeaderValue = string | string[]
export interface RequestContent { cycleId: string, method: string, path: string, headers: Record<string, HeaderValue>, body?: string }
export interface ResponseContent { cycleId: string, statusCode: number, headers: Record<string, HeaderValue>, body?: string }
export interface UpdatedContent { action: string, type: string, updatedContent: RequestContent | ResponseContent }

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