import { addFavorite, getFavorites, removeFavorite, isFavorite } from "./db";
import { session } from "./session";

export async function addSessionFavorite(movieId: number) {
  let sessionId = session().get("_id");
  addFavorite(sessionId, movieId);
}

export async function removeSessionFavorite(movieId: number) {
  let sessionId = session().get("_id");
  removeFavorite(sessionId, movieId);
}

export async function isSessionFavorite(movieId: number) {
  let sessionId = session().get("_id");
  return isFavorite(sessionId, movieId);
}

export async function getSessionFavorites() {
  // TODO
  // it looks like `Layout > Favorites` is rendered without middleware
  // for example, when route is not found or .manifest request.
  // for now, let's just do null check to avoid the error.
  if (!session()) return []
  let sessionId = session().get("_id");
  return getFavorites(sessionId);
}
