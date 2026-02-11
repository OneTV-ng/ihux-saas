import { redirect } from "next/navigation";

// Redirect /artist/[slug] to /artists/[slug] (plural)
export default async function ArtistRedirect({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  redirect(`/artists/${slug}`);
}
