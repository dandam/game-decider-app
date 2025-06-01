import { redirect } from 'next/navigation';

export default async function Home() {
  redirect('/theme-demo');
  // Next.js requires a return statement even though redirect will handle the response
  return null;
} 