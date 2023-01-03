import { collection, doc, getDoc } from "firebase/firestore";
import { db } from "../utils/firestore";

export interface Season {
  total: number;
}

const seasonsRef = collection(db, "seasons");

/**
 * Get a season from the database.
 *
 * @param seasonId the id of the season
 * @returns the season
 */
export async function getSeason(seasonId: string) {
  if (!seasonId) return null;

  const seasonRef = doc(seasonsRef, seasonId);
  const season = await getDoc(seasonRef);

  if (!season.exists()) {
    return null
  }

  return season.data() as Season;
}
