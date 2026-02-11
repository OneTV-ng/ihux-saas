import { useContext } from "react";
import { PlayerContext } from "@/contexts/player-context";

export function usePlayer() {
  return useContext(PlayerContext);
}
