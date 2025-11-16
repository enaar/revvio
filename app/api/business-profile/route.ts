import { getBusinessProfile } from '@/lib/db/queries';

export async function GET() {
  const businessProfile = await getBusinessProfile();
  return Response.json(businessProfile);
}
