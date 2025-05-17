import { MovieGrid } from "../components/movie-grid.tsx";
import { MovieTile } from "../components/movie-tile.tsx";

// TODO: require route-module transform?
// export const shouldRevalidate = () => false;

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
