import { z } from "zod";

export const authSchema = z.object({
  email: z.string().trim().email("Invalid email address").max(255, "Email too long"),
  password: z.string().min(6, "Password must be at least 6 characters").max(128, "Password too long"),
});

export const travelMarkerSchema = z.object({
  name: z.string().trim().min(1, "Place name is required").max(200, "Name too long"),
  lat: z.number().min(-90).max(90, "Invalid latitude"),
  lng: z.number().min(-180).max(180, "Invalid longitude"),
  type: z.enum(["visited", "planned"]),
  description: z.string().trim().max(1000, "Description too long").nullable().optional(),
  visit_date: z.string().nullable().optional(),
});

export const cacheEntrySchema = z.object({
  key: z.string().trim().min(1, "Key is required").max(500, "Key too long"),
  value: z.unknown(),
  category: z.enum(["general", "user", "config", "session", "analytics"]),
  ttl_seconds: z.number().int().positive("TTL must be positive").max(86400 * 365, "TTL too large"),
});

export type AuthInput = z.infer<typeof authSchema>;
export type TravelMarkerInput = z.infer<typeof travelMarkerSchema>;
export type CacheEntryInput = z.infer<typeof cacheEntrySchema>;
