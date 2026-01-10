import { redirect } from 'next/navigation';
import { headers } from 'next/headers';

export default async function RootPage() {
  const headersList = await headers();
  const acceptLanguage = headersList.get('accept-language') || '';
  
  // Extract preferred locale from Accept-Language header
  const preferredLocale = acceptLanguage.startsWith('he') ? 'he' : 'en';
  
  redirect(`/${preferredLocale}`);
}
