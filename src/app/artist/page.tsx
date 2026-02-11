import { redirect } from "next/navigation";

// Redirect /artist to /artists (plural)
export default function ArtistListRedirect() {
  redirect("/artists");
}
