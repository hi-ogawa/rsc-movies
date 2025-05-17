import { MovieGrid } from "../components/movie-grid.tsx";
import { MovieTile } from "../components/movie-tile.tsx";

// TODO: route-module transform to auto-wrap client exports?
// export const shouldRevalidate = () => false;
export { shouldRevalidate } from "./home.client.tsx"

export default async function ServerComponent() {
  let featuredMovieIds = [32932, 23643, 29915, 30895, 31472, 33411];

  return (
    <>
      <title>RR RSC Movies</title>
      <MovieGrid>
        {featuredMovieIds.map((id: number) => (
          <MovieTile key={id} id={id} />
        ))}
      </MovieGrid>
    </>
  );
}
