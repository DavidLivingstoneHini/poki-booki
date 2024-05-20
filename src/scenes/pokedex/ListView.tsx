import {
  ChevronLeftIcon,
  ChevronRightIcon,
  DotsHorizontalIcon,
} from '@radix-ui/react-icons';
import ReactPaginate from 'react-paginate';

import {
  PokemonsDetails,
  useGetPokemons,
  useGetPokemonsDetails,
} from '@/hooks/pokemonList';
import { useFilter } from '@/hooks/queryState';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/select';

import PokemonCard from './PokemonCard';

const perPageValues = [8, 12, 16, 24];

export default function PokemonsList() {
  /* manage state with query params - make filter sharable and maintain filter state on page refresh */
  const [filter, setFilter] = useFilter();

  const { data: pokemonsUrls } = useGetPokemons();
  const pokemonsDetails = useGetPokemonsDetails();

  /* check if some query has errored out or is loading */
  const isPokemonsDetailsComplete = pokemonsDetails.some(
    (query) => query.data === undefined,
  );

  if (!pokemonsUrls || isPokemonsDetailsComplete) {
    return (
      <main>
        <div className="container grid h-full max-w-[1300px] gap-y-24 py-8 pb-16 md:py-12 md:pb-24">
          <p className="text-center font-sans text-xl font-medium md:text-2xl">
            Loading pokemon list...
          </p>
        </div>
      </main>
    );
  }

  const pokemonsDetailsData = pokemonsDetails.map(
    (pokemon) => pokemon.data as PokemonsDetails,
  );

  const allTypes = pokemonsDetailsData.flatMap((pokemon) =>
    pokemon.types.map((type) => type.type.name),
  );
  const uniqueTypes = ['all', ...new Set(allTypes)];

  const pokemonsByType =
    filter.pokemonType === 'all'
      ? pokemonsDetailsData
      : pokemonsDetailsData.filter((pokemon) =>
          pokemon.types.some((type) => type.type.name === filter.pokemonType),
        );

  const pokemonsBySearch = pokemonsByType.filter((pokemon) =>
    pokemon.name.toLowerCase().includes(filter.s.toLowerCase()),
  );

  /* pokemons data pagination */
  const endOffset = filter.pageOffset + filter.perPage;
  const currentPokemons = pokemonsBySearch.slice(filter.pageOffset, endOffset);
  const pageCount = Math.ceil(pokemonsBySearch.length / filter.perPage);

  const handlePageClick = async ({ selected }: { selected: number }) => {
    if (pageCount > 1) {
      const newOffset = (selected * filter.perPage) % pokemonsBySearch.length;
      setFilter({ page: selected + 1, pageOffset: newOffset });
    }
  };

  if (pageCount === 0) {
    return (
      <main>
        <div className="container grid h-full max-w-[1300px] gap-y-24 py-8 pb-16 md:py-12 md:pb-24">
          <p className="text-center font-sans font-medium md:text-lg">
            No matches found.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main>
      <div className="container grid h-full max-w-[1300px] gap-y-24 py-8 pb-16 md:py-12 md:pb-24">
        {/* list of pokemons */}
        <ul className="grid grid-cols-[repeat(auto-fill,_minmax(min(288px,_100%),_1fr))] gap-x-4 gap-y-28">
          {currentPokemons.map((currentPokemon) => (
            <PokemonCard key={currentPokemon.id} pokemon={currentPokemon} />
          ))}
        </ul>
        {/* pagination elements */}
        {pageCount >= 1 ? (
          <div className="flex flex-wrap gap-x-4 gap-y-6 max-md:justify-center md:items-center md:justify-between">
            <ReactPaginate
              pageCount={pageCount}
              forcePage={filter.page - 1}
              pageRangeDisplayed={4}
              marginPagesDisplayed={1}
              renderOnZeroPageCount={null}
              onPageChange={handlePageClick}
              containerClassName="flex w-fit flex-wrap items-center gap-0.5 font-medium text-foreground md:gap-2 md:text-lg"
              pageClassName="block"
              pageLinkClassName="flex aspect-square size-8 items-center justify-center rounded-sm md:size-[40px] md:rounded-[8px] md:bg-muted"
              activeLinkClassName="text-theme max-md:border-theme md:!bg-theme md:text-theme-foreground border border-transparent"
              disabledClassName="pointer-events-none text-muted-foreground/30"
              previousLabel={<ChevronLeftIcon className="size-4 md:size-6" />}
              previousLinkClassName="flex aspect-square size-8 items-center justify-center rounded-sm md:size-[40px] md:rounded-[8px] md:bg-muted"
              breakLabel={<DotsHorizontalIcon className="size-4 md:size-6" />}
              breakClassName="block self-end"
              nextLabel={<ChevronRightIcon className="size-4 md:size-6" />}
              nextLinkClassName="flex aspect-square size-8 items-center justify-center rounded-sm md:size-[40px] md:rounded-[8px] md:bg-muted"
            />

            <div className="flex flex-wrap gap-x-4 gap-y-6 max-md:justify-center md:items-center">
              {/* select pokemon type */}
              <Select
                value={filter.pokemonType}
                onValueChange={(value) => {
                  setFilter({
                    page: undefined,
                    pageOffset: undefined,
                    pokemonType: value,
                  });
                }}
              >
                <SelectTrigger className="w-[133px]">
                  <div className="flex h-[32px] w-[90px] items-center justify-center rounded-[4px] bg-background text-lg font-medium capitalize">
                    <SelectValue />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {uniqueTypes.map((value) => (
                      <SelectItem
                        key={value}
                        value={value.toString()}
                        className="capitalize"
                      >
                        {value}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>

              {/* select pokemons per page */}
              <Select
                value={filter.perPage.toString()}
                onValueChange={(value) => {
                  setFilter({
                    page: undefined,
                    pageOffset: undefined,
                    perPage: Number(value),
                  });
                }}
              >
                <SelectTrigger className="w-[85px]">
                  <div className="flex h-[32px] w-[43px] items-center justify-center rounded-[4px] bg-background text-lg font-medium">
                    <SelectValue />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {perPageValues.map((value) => (
                      <SelectItem
                        key={value}
                        value={value.toString()}
                        className="justify-center"
                      >
                        {value}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>
        ) : null}
      </div>
    </main>
  );
}
