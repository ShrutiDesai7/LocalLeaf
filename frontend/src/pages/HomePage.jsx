import { useEffect, useMemo, useState } from 'react';
import { PlantCard } from '../components/PlantCard';
import { RequestModal } from '../components/RequestModal';
import { GalleryModal } from '../components/GalleryModal';

const categories = ['All', 'Indoor', 'Outdoor', 'Flowering', 'Succulent', 'Herbal'];

export function HomePage({
  loading,
  plants,
  plantsPagination,
  onLoadMorePlants,
  error,
  user,
  onCreateOrder,
  orderSubmitting
}) {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [selectedPlant, setSelectedPlant] = useState(null);
  const [galleryPlant, setGalleryPlant] = useState(null);
  const [showAllPlants, setShowAllPlants] = useState(false);
  const [gridColumns, setGridColumns] = useState(1);

  useEffect(() => {
    const mediaSm = window.matchMedia('(min-width: 640px)');
    const mediaXl = window.matchMedia('(min-width: 1280px)');
    const media2xl = window.matchMedia('(min-width: 1536px)');

    const update = () => {
      if (media2xl.matches) return setGridColumns(4);
      if (mediaXl.matches) return setGridColumns(3);
      if (mediaSm.matches) return setGridColumns(2);
      return setGridColumns(1);
    };

    update();

    mediaSm.addEventListener('change', update);
    mediaXl.addEventListener('change', update);
    media2xl.addEventListener('change', update);

    return () => {
      mediaSm.removeEventListener('change', update);
      mediaXl.removeEventListener('change', update);
      media2xl.removeEventListener('change', update);
    };
  }, []);

  const filteredPlants = useMemo(() => {
    return plants.filter((plant) => {
      const matchesCategory =
        selectedCategory === 'All' || plant.category === selectedCategory;
      const matchesSearch =
        !search ||
        plant.name.toLowerCase().includes(search.toLowerCase()) ||
        plant.category.toLowerCase().includes(search.toLowerCase()) ||
        (plant.nursery_name || '').toLowerCase().includes(search.toLowerCase());

      return matchesCategory && matchesSearch;
    });
  }, [plants, search, selectedCategory]);

  const totalPlants = Number(plantsPagination?.total || 0) || plants.length;
  const canLoadMore = Boolean(
    plantsPagination?.totalPages && plantsPagination.page < plantsPagination.totalPages
  );

  const initialVisibleCount = Math.max(4, Number(gridColumns || 1) * 4);

  useEffect(() => {
    setShowAllPlants(false);
  }, [search, selectedCategory]);

  const visiblePlants = useMemo(() => {
    if (showAllPlants) return filteredPlants;
    return filteredPlants.slice(0, initialVisibleCount);
  }, [filteredPlants, initialVisibleCount, showAllPlants]);

  return (
    <>
      <section className="container-wide pb-12 pt-8">
        <div className="overflow-hidden rounded-[36px] bg-hero px-6 py-10 shadow-card sm:px-10 lg:px-12 lg:py-14">
          <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <p className="text-base uppercase tracking-[0.3em] text-leaf-moss">
                Green spaces, simply ordered
              </p>
              <h1 className="mt-4 max-w-2xl font-display text-5xl leading-tight text-leaf-forest sm:text-6xl">
                Discover joyful plants from local nurseries around you.
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-leaf-moss sm:text-lg">
                Browse healthy indoor, outdoor, and flowering plants, then send a
                quick request that nursery owners can manage from one place.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                {categories.map((category) => (
                  <button
                    key={category}
                    type="button"
                    className={`rounded-full px-6 py-3.5 text-base font-semibold transition ${
                      selectedCategory === category
                        ? 'bg-leaf-forest text-white'
                        : 'bg-white/80 text-leaf-forest hover:bg-white'
                    }`}
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            <div className="glass-panel p-5 sm:p-6">
              <p className="text-base uppercase tracking-[0.24em] text-leaf-moss">
                Find your next plant
              </p>
              <input
                className="field-input mt-4"
                placeholder="Search by plant, category, or nursery..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="rounded-[24px] bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:bg-white/90 hover:shadow-md">
                  <p className="text-3xl font-semibold text-leaf-forest">{totalPlants}</p>
                  <p className="mt-2 text-lg text-leaf-moss">Plants ready to request</p>
                  {totalPlants > plants.length && (
                    <p className="mt-2 text-base leading-7 text-leaf-moss/90">
                      Showing {plants.length}. Load more to see the rest.
                    </p>
                  )}
                </div>
                <div className="rounded-[24px] bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:bg-white/90 hover:shadow-md">
                  <p className="text-3xl font-semibold text-leaf-forest">2 steps</p>
                  <p className="mt-2 text-base text-leaf-moss">Pick → request</p>
                  <p className="mt-2 text-base leading-7 text-leaf-moss/90">
                    Share your details once. The nursery confirms availability.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container-wide pb-16">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <p className="text-base uppercase tracking-[0.24em] text-leaf-moss">
              Plant collection
            </p>
            <h2 className="mt-2 font-display text-3xl text-leaf-forest">
              Curated for homes and gardens
            </h2>
          </div>
          <p className="text-base text-leaf-moss">{filteredPlants.length} results</p>
        </div>

        {loading ? (
          <div className="glass-panel p-8 text-center text-leaf-moss">
            Loading plants...
          </div>
        ) : error ? (
          <div className="glass-panel p-8 text-center text-rose-700">{error}</div>
        ) : (
          <div className="grid gap-7 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {visiblePlants.map((plant) => (
              <PlantCard
                key={plant.id}
                plant={plant}
                onRequest={(item) => setSelectedPlant(item)}
                onOpenGallery={(item) => setGalleryPlant(item)}
              />
            ))}
          </div>
        )}

        {!loading && !error && !showAllPlants && filteredPlants.length > initialVisibleCount && (
          <div className="mt-10 flex justify-center">
            <button
              type="button"
              className="rounded-full bg-white px-7 py-3.5 text-base font-semibold text-leaf-forest shadow-sm transition hover:bg-leaf-sage/40"
              onClick={() => setShowAllPlants(true)}
            >
              Read more plants
            </button>
          </div>
        )}

        {!loading && !error && showAllPlants && canLoadMore && (
          <div className="mt-10 flex justify-center">
            <button
              type="button"
              className="rounded-full bg-white px-7 py-3.5 text-base font-semibold text-leaf-forest shadow-sm transition hover:bg-leaf-sage/40"
              onClick={onLoadMorePlants}
            >
              Load more plants
            </button>
          </div>
        )}
      </section>

      <RequestModal
        open={Boolean(selectedPlant)}
        plant={selectedPlant}
        submitting={orderSubmitting}
        user={user}
        onClose={() => setSelectedPlant(null)}
        onSubmit={async (payload) => {
          await onCreateOrder(payload);
          setSelectedPlant(null);
        }}
      />

      <GalleryModal
        open={Boolean(galleryPlant)}
        plant={galleryPlant}
        user={user}
        onClose={() => setGalleryPlant(null)}
      />
    </>
  );
}
