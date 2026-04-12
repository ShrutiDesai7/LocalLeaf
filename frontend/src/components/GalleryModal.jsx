import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, resolveApiUrl } from '../api';
import { Button } from './Button';

function normalizeUrls(plant) {
  const urls = [];

  if (Array.isArray(plant?.image_urls)) {
    urls.push(...plant.image_urls);
  } else if (typeof plant?.image_urls === 'string') {
    try {
      const parsed = JSON.parse(plant.image_urls);
      if (Array.isArray(parsed)) urls.push(...parsed);
    } catch {
      urls.push(
        ...plant.image_urls
          .split(/[,\n]/g)
          .map((value) => value.trim())
          .filter(Boolean)
      );
    }
  }

  if (plant?.image_url) urls.push(plant.image_url);

  const deduped = Array.from(
    new Set(urls.map((value) => String(value).trim()).filter(Boolean))
  );
  return deduped;
}

function formatRating(value) {
  if (!Number.isFinite(value) || value <= 0) return '0.0';
  return Number(value).toFixed(1);
}

function StarRow({ value = 0 }) {
  const rounded = Math.round(Number(value) || 0);
  return (
    <div className="flex items-center gap-1" aria-label={`Rating ${rounded} out of 5`}>
      {Array.from({ length: 5 }).map((_, index) => {
        const filled = index < rounded;
        return (
          <span
            key={index}
            className={filled ? 'text-amber-500' : 'text-leaf-moss/35'}
          >
            ★
          </span>
        );
      })}
    </div>
  );
}

export function GalleryModal({ open, plant, onClose, user }) {
  const images = useMemo(() => normalizeUrls(plant), [plant]);
  const [activeIndex, setActiveIndex] = useState(0);

  const [reviews, setReviews] = useState([]);
  const [reviewsSummary, setReviewsSummary] = useState({ total: 0, avg_rating: 0 });
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewsError, setReviewsError] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [showMoreReviews, setShowMoreReviews] = useState(false);

  useEffect(() => {
    if (!open) return;
    setActiveIndex(0);
  }, [open, plant?.id]);

  useEffect(() => {
    if (!open || !plant?.id) return;

    let alive = true;
    (async () => {
      try {
        setReviewsLoading(true);
        setReviewsError('');
        const data = await api.getPlantReviews(plant.id, { limit: 25 });
        if (!alive) return;
        setReviews(Array.isArray(data?.reviews) ? data.reviews : []);
        setReviewsSummary(data?.summary || { total: 0, avg_rating: 0 });
      } catch (err) {
        if (!alive) return;
        setReviewsError(err.message);
      } finally {
        if (!alive) return;
        setReviewsLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [open, plant?.id]);

  useEffect(() => {
    if (!open) return;
    setReviewForm({ rating: 5, comment: '' });
    setShowMoreReviews(false);
  }, [open, plant?.id]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose?.();
      if (event.key === 'ArrowRight') {
        setActiveIndex((current) => Math.min(images.length - 1, current + 1));
      }
      if (event.key === 'ArrowLeft') {
        setActiveIndex((current) => Math.max(0, current - 1));
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [images.length, onClose, open]);

  if (!open || !plant) return null;

  const active = images[activeIndex] ? resolveApiUrl(images[activeIndex]) : '';
  const canReview = user?.role === 'customer';

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-leaf-deep/60 px-4 py-8">
      <div className="glass-panel w-full max-w-4xl overflow-hidden">
        <div className="flex items-center justify-between gap-4 border-b border-white/30 px-6 py-4">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-leaf-moss">Gallery</p>
            <h3 className="mt-1 font-display text-2xl text-leaf-forest">{plant.name}</h3>
          </div>
          <button
            aria-label="Close gallery"
            className="rounded-full bg-leaf-sage/40 px-3 py-2 text-sm text-leaf-forest"
            type="button"
            onClick={onClose}
          >
            Close
          </button>
        </div>

        <div className="grid gap-0 md:grid-cols-[1fr_360px]">
          <div className="relative bg-black/10">
            {active ? (
              <img alt={plant.name} className="h-[60vh] w-full object-contain" src={active} />
            ) : (
              <div className="flex h-[60vh] w-full items-center justify-center text-sm font-semibold text-leaf-forest">
                No photos available
              </div>
            )}

            {images.length > 1 && (
              <>
                <button
                  aria-label="Previous photo"
                  className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/85 px-3 py-2 text-sm font-semibold text-leaf-forest disabled:opacity-40"
                  type="button"
                  disabled={activeIndex === 0}
                  onClick={() => setActiveIndex((current) => Math.max(0, current - 1))}
                >
                  Prev
                </button>
                <button
                  aria-label="Next photo"
                  className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/85 px-3 py-2 text-sm font-semibold text-leaf-forest disabled:opacity-40"
                  type="button"
                  disabled={activeIndex >= images.length - 1}
                  onClick={() =>
                    setActiveIndex((current) => Math.min(images.length - 1, current + 1))
                  }
                >
                  Next
                </button>
              </>
            )}
          </div>

          <div className="border-t border-white/30 p-6 md:border-l md:border-t-0">
            <p className="text-sm font-semibold text-leaf-forest">
              Photos ({images.length || 0})
            </p>
            <div className="mt-4 grid grid-cols-4 gap-3 md:grid-cols-3">
              {images.map((url, index) => {
                const selected = index === activeIndex;
                return (
                  <button
                    key={`${url}-${index}`}
                    aria-label={`View photo ${index + 1}`}
                    className={`aspect-square overflow-hidden rounded-xl border transition ${
                      selected
                        ? 'border-leaf-forest'
                        : 'border-leaf-moss/25 hover:border-leaf-moss/60'
                    }`}
                    type="button"
                    onClick={() => setActiveIndex(index)}
                  >
                    <img alt="" className="h-full w-full object-cover" src={resolveApiUrl(url)} />
                  </button>
                );
              })}
            </div>

            {plant?.description && (
              <p className="mt-5 text-sm leading-6 text-leaf-moss">
                {String(plant.description).trim()}
              </p>
            )}

            <div className="mt-6 border-t border-white/40 pt-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-leaf-forest">Reviews</p>
                  <div className="mt-2 flex items-center gap-2 text-sm text-leaf-moss">
                    <StarRow value={reviewsSummary?.avg_rating || 0} />
                    <span className="font-semibold text-leaf-forest">
                      {formatRating(reviewsSummary?.avg_rating || 0)}
                    </span>
                    <span className="text-leaf-moss/80">
                      ({Number(reviewsSummary?.total || 0) || 0})
                    </span>
                  </div>
                </div>
              </div>

              {reviewsLoading ? (
                <p className="mt-4 text-sm text-leaf-moss">Loading reviews...</p>
              ) : reviewsError ? (
                <p className="mt-4 text-sm text-rose-700">{reviewsError}</p>
              ) : reviews.length === 0 ? (
                <p className="mt-4 text-sm text-leaf-moss">No reviews yet.</p>
              ) : (
                <div className="mt-4 space-y-3">
                  {reviews.slice(0, showMoreReviews ? 8 : 1).map((review) => (
                    <div key={review.id} className="rounded-[20px] bg-white/70 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-leaf-forest">
                            {review.customer_name || 'Customer'}
                          </p>
                            <div className="mt-1 flex items-center gap-2 text-sm text-leaf-moss">
                              <StarRow value={review.rating || 0} />
                              <span>
                                {review.created_at
                                  ? new Date(review.created_at).toLocaleDateString()
                                  : ''}
                              </span>
                            </div>
                          </div>
                        <div className="rounded-full bg-leaf-sage/50 px-3 py-1 text-sm font-semibold text-leaf-deep">
                          {Number(review.rating || 0)}/5
                        </div>
                      </div>
                      {review.comment && (
                        <p className="mt-2 text-sm leading-6 text-leaf-moss">
                          {String(review.comment).trim()}
                        </p>
                      )}
                    </div>
                  ))}

                  {(reviewsSummary?.total || reviews.length) > 1 && (
                    <button
                      type="button"
                      className="mt-2 inline-flex items-center text-sm font-semibold text-leaf-forest underline"
                      onClick={() => setShowMoreReviews((current) => !current)}
                    >
                      {showMoreReviews
                        ? 'Show less'
                        : `More reviews (${Number(reviewsSummary?.total || reviews.length) - 1})`}
                    </button>
                  )}
                </div>
              )}

              {canReview ? (
                <form
                  className="mt-5 rounded-[24px] bg-white/70 p-5"
                  onSubmit={async (event) => {
                    event.preventDefault();
                    try {
                      setReviewSubmitting(true);
                      setReviewsError('');
                      const payload = {
                        rating: Number(reviewForm.rating),
                        comment: reviewForm.comment?.trim() || ''
                      };
                      const result = await api.addPlantReview(plant.id, payload);
                      const saved = result?.review;
                      if (saved?.id) {
                        setReviews((current) => {
                          const withoutMine = current.filter((r) => r.user_id !== saved.user_id);
                          return [saved, ...withoutMine];
                        });
                        setReviewsSummary((current) => ({
                          ...(current || {}),
                          total: Math.max(1, Number(current?.total || 0) || 0)
                        }));
                      }
                      const refreshed = await api.getPlantReviews(plant.id, { limit: 25 });
                      setReviews(Array.isArray(refreshed?.reviews) ? refreshed.reviews : []);
                      setReviewsSummary(refreshed?.summary || { total: 0, avg_rating: 0 });
                      setReviewForm({ rating: 5, comment: '' });
                    } catch (err) {
                      setReviewsError(err.message);
                    } finally {
                      setReviewSubmitting(false);
                    }
                  }}
                >
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-leaf-moss">
                    Write a review
                  </p>
                  <div className="mt-3 grid gap-3">
                    <div>
                      <label className="mb-2 block text-sm font-semibold uppercase tracking-[0.18em] text-leaf-moss">
                        Rating
                      </label>
                      <select
                        className="field-input"
                        value={reviewForm.rating}
                        onChange={(e) =>
                          setReviewForm((c) => ({ ...c, rating: Number(e.target.value) }))
                        }
                      >
                        {[5, 4, 3, 2, 1].map((value) => (
                          <option key={value} value={value}>
                            {value} - {value === 5 ? 'Excellent' : value === 4 ? 'Good' : value === 3 ? 'Okay' : value === 2 ? 'Poor' : 'Bad'}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-semibold uppercase tracking-[0.18em] text-leaf-moss">
                        Comment (optional)
                      </label>
                      <textarea
                        className="field-input min-h-24 resize-none"
                        value={reviewForm.comment}
                        onChange={(e) =>
                          setReviewForm((c) => ({ ...c, comment: e.target.value }))
                        }
                        placeholder="Share your experience..."
                      />
                    </div>
                    <Button disabled={reviewSubmitting} type="submit">
                      {reviewSubmitting ? 'Saving...' : 'Submit review'}
                    </Button>
                  </div>
                </form>
              ) : (
                <p className="mt-5 text-sm text-leaf-moss">
                  <Link className="font-semibold text-leaf-forest underline" to="/login">
                    Log in
                  </Link>{' '}
                  as a customer to write a review.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
