import { authorized, failure, json } from "@/lib/server/http";
export async function GET() {
  try {
    const { user } = await authorized();
    return json({
      onboarded: user.user_metadata?.onboarding_completed === true,
    });
  } catch (e) {
    return failure(e);
  }
}
