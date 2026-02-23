export function handleSupabaseError(error: unknown, context?: string): string {
  if (error && typeof error === "object" && "message" in error) {
    const message = (error as { message: string }).message;
    console.error(`Supabase error${context ? ` in ${context}` : ""}:`, error);

    if (message.includes("JWT expired")) return "Your session has expired. Please log in again.";
    if (message.includes("duplicate key")) return "This item already exists.";
    if (message.includes("violates row-level security")) return "You do not have permission to do this.";
    if (message.includes("Failed to fetch")) return "Network error. Please check your connection.";

    return message;
  }
  return "An unexpected error occurred. Please try again.";
}
