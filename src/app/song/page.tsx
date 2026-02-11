import { redirect } from "next/navigation";

// Redirect /song to /songs (plural)
export default function SongListRedirect() {
  redirect("/songs");
}
