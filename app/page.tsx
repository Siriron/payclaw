// Root page — serves the landing.html directly via redirect
// The actual landing page is landing.html (plain HTML, same design DNA as index.html)
import { redirect } from 'next/navigation';

export default function RootPage() {
  // Redirect to landing.html which is served as static file
  redirect('/landing.html');
}
