import { useEffect, useMemo, useState } from 'react';
import { Button } from './Button';
import { resolveApiUrl } from '../api';

const buildInitialState = (defaults) => {
  const allExisting = Array.isArray(defaults?.image_urls) ? defaults.image_urls : [];
  const coverExisting = defaults?.image_url || allExisting[0] || '';
  const galleryExisting = allExisting.filter((url) => url && url !== coverExisting);

  return {
    name: defaults?.name || '',
    price: defaults?.price || '',
    category: defaults?.category || '',
    description: defaults?.description || defaults?.short_description || '',
    request_title: defaults?.request_title || '',
    request_message: defaults?.request_message || '',
    coverFile: null,
    newGalleryFiles: [],
    replace_images: false,
    existingCoverUrl: coverExisting,
    existingGalleryUrls: galleryExisting,
    removedGalleryUrls: []
  };
};

const dedupeFiles = (files) => {
  const seen = new Set();
  const next = [];

  for (const file of files) {
    const key = [file?.name, file?.size, file?.lastModified].join('::');
    if (seen.has(key)) continue;
    seen.add(key);
    next.push(file);
  }

  return next;
};

export function PlantForm({
  onSubmit,
  onCancel,
  defaultValues = {},
  submitLabel = 'Add Plant',
  isLoading = false
}) {
  const [formData, setFormData] = useState(() => buildInitialState(defaultValues));

  useEffect(() => {
    setFormData(buildInitialState(defaultValues));
  }, [defaultValues?.id]);

  const coverPreviewUrl = useMemo(() => {
    if (!formData.coverFile) return '';
    return URL.createObjectURL(formData.coverFile);
  }, [formData.coverFile]);

  useEffect(() => {
    if (!coverPreviewUrl) return;
    return () => URL.revokeObjectURL(coverPreviewUrl);
  }, [coverPreviewUrl]);

  const newGalleryPreviews = useMemo(() => {
    return (formData.newGalleryFiles || []).map((file) => ({
      key: [file?.name, file?.size, file?.lastModified].join('::'),
      name: file?.name || 'image',
      url: URL.createObjectURL(file)
    }));
  }, [formData.newGalleryFiles]);

  useEffect(() => {
    return () => {
      for (const preview of newGalleryPreviews) {
        URL.revokeObjectURL(preview.url);
      }
    };
  }, [newGalleryPreviews]);

  const visibleExistingGallery = useMemo(() => {
    const removed = new Set(formData.removedGalleryUrls);
    return (formData.existingGalleryUrls || []).filter((url) => url && !removed.has(url));
  }, [formData.existingGalleryUrls, formData.removedGalleryUrls]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = new FormData();
    payload.append('name', formData.name.trim());
    payload.append('price', parseFloat(formData.price));
    payload.append('category', formData.category.trim());
    if (formData.coverFile) payload.append('image', formData.coverFile);
    for (const file of formData.newGalleryFiles) payload.append('images', file);
    if (formData.description?.trim()) payload.append('description', formData.description.trim());
    if (formData.request_title?.trim()) payload.append('request_title', formData.request_title.trim());
    if (formData.request_message?.trim()) {
      payload.append('request_message', formData.request_message.trim());
    }
    if (formData.replace_images) payload.append('replace_images', 'true');
    if (!formData.replace_images && formData.removedGalleryUrls.length > 0) {
      payload.append('remove_images', JSON.stringify(formData.removedGalleryUrls));
    }
    onSubmit(payload);
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'image') {
      setFormData((current) => ({ ...current, coverFile: files?.[0] || null }));
    } else if (name === 'images') {
      const selected = Array.from(files || []);
      if (selected.length === 0) return;
      setFormData((current) => ({
        ...current,
        newGalleryFiles: dedupeFiles([...(current.newGalleryFiles || []), ...selected])
      }));
      e.target.value = '';
    } else {
      setFormData((current) => ({ ...current, [name]: value }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="glass-panel p-6 space-y-4">
      <div>
        <label className="block text-sm font-medium text-leaf-moss mb-2">Plant Name</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className="w-full rounded-xl border border-leaf-moss/30 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-leaf-forest"
          required
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-leaf-moss mb-2">Price (Rs)</label>
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleChange}
            step="0.01"
            min="0"
            className="w-full rounded-xl border border-leaf-moss/30 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-leaf-forest"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-leaf-moss mb-2">Category</label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full rounded-xl border border-leaf-moss/30 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-leaf-forest"
            required
          >
            <option value="">Select Category</option>
            <option value="Indoor">Indoor</option>
            <option value="Outdoor">Outdoor</option>
            <option value="Flowering">Flowering</option>
            <option value="Succulent">Succulent</option>
            <option value="Herbal">Herbal</option>
          </select>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-leaf-moss mb-2">Description (optional)</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={3}
          className="w-full rounded-xl border border-leaf-moss/30 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-leaf-forest resize-none"
          placeholder="1–2 lines that describe this plant for customers"
        />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-leaf-moss mb-2">Request Title (optional)</label>
          <input
            type="text"
            name="request_title"
            value={formData.request_title}
            onChange={handleChange}
            className="w-full rounded-xl border border-leaf-moss/30 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-leaf-forest"
            placeholder="Shown on the request form"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-leaf-moss mb-2">Request Message (optional)</label>
          <input
            type="text"
            name="request_message"
            value={formData.request_message}
            onChange={handleChange}
            className="w-full rounded-xl border border-leaf-moss/30 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-leaf-forest"
            placeholder="Short guidance for the customer"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-leaf-moss mb-2">Image (optional)</label>
        {formData.existingCoverUrl && !formData.coverFile && (
          <div className="mb-3 flex items-center gap-3 rounded-2xl bg-white/70 p-3">
            <img
              alt="Current cover"
              className="h-16 w-16 rounded-xl object-cover"
              src={resolveApiUrl(formData.existingCoverUrl)}
            />
            <div className="min-w-0">
              <p className="text-xs uppercase tracking-[0.22em] text-leaf-moss">
                Current cover
              </p>
              <p className="mt-1 truncate text-sm font-semibold text-leaf-forest">
                {formData.existingCoverUrl.split('/').pop()}
              </p>
            </div>
          </div>
        )}
        {formData.coverFile && coverPreviewUrl && (
          <div className="mb-3 flex items-center gap-3 rounded-2xl bg-white/70 p-3">
            <img
              alt="New cover"
              className="h-16 w-16 rounded-xl object-cover"
              src={coverPreviewUrl}
            />
            <div className="min-w-0">
              <p className="text-xs uppercase tracking-[0.22em] text-leaf-moss">
                New cover
              </p>
              <p className="mt-1 truncate text-sm font-semibold text-leaf-forest">
                {formData.coverFile.name}
              </p>
            </div>
            <button
              type="button"
              className="ml-auto rounded-full bg-white px-3 py-2 text-xs font-semibold text-leaf-forest shadow-sm transition hover:bg-leaf-sage/40"
              onClick={() => setFormData((current) => ({ ...current, coverFile: null }))}
            >
              Remove
            </button>
          </div>
        )}
        <input
          type="file"
          name="image"
          accept="image/*"
          onChange={handleChange}
          className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-leaf-forest file:text-white hover:file:bg-leaf-forest/90"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-leaf-moss mb-2">More Photos (optional)</label>
        {defaultValues?.id && visibleExistingGallery.length > 0 && (
          <div className="mb-3">
            <p className="text-xs uppercase tracking-[0.22em] text-leaf-moss">
              Existing photos
            </p>
            <div className="mt-3 flex flex-wrap gap-3">
              {visibleExistingGallery.map((url) => (
                <div
                  key={url}
                  className="group relative h-16 w-16 overflow-hidden rounded-xl bg-white shadow-sm"
                >
                  <img alt="Plant" className="h-full w-full object-cover" src={resolveApiUrl(url)} />
                  <button
                    type="button"
                    className="absolute right-1 top-1 rounded-full bg-white/90 px-2 py-1 text-[10px] font-semibold text-leaf-forest opacity-0 transition group-hover:opacity-100"
                    onClick={() =>
                      setFormData((current) => ({
                        ...current,
                        removedGalleryUrls: Array.from(
                          new Set([...(current.removedGalleryUrls || []), url])
                        )
                      }))
                    }
                    title="Remove this image"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
        <input
          type="file"
          name="images"
          accept="image/*"
          multiple
          onChange={handleChange}
          className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-leaf-forest file:text-white hover:file:bg-leaf-forest/90"
        />

        {newGalleryPreviews.length > 0 && (
          <div className="mt-3">
            <p className="text-xs uppercase tracking-[0.22em] text-leaf-moss">
              New uploads (will be appended)
            </p>
            <div className="mt-3 flex flex-wrap gap-3">
              {newGalleryPreviews.map((preview, index) => (
                <div
                  key={preview.key}
                  className="group relative h-16 w-16 overflow-hidden rounded-xl bg-white shadow-sm"
                >
                  <img alt={preview.name} className="h-full w-full object-cover" src={preview.url} />
                  <button
                    type="button"
                    className="absolute right-1 top-1 rounded-full bg-white/90 px-2 py-1 text-[10px] font-semibold text-leaf-forest opacity-0 transition group-hover:opacity-100"
                    onClick={() =>
                      setFormData((current) => ({
                        ...current,
                        newGalleryFiles: (current.newGalleryFiles || []).filter(
                          (_, fileIndex) => fileIndex !== index
                        )
                      }))
                    }
                    title="Remove from upload list"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {defaultValues?.id && (formData.coverFile || formData.newGalleryFiles.length > 0) && (
          <label className="mt-3 flex items-center gap-2 text-xs text-leaf-moss">
            <input
              type="checkbox"
              checked={formData.replace_images}
              onChange={(event) =>
                setFormData((current) => ({
                  ...current,
                  replace_images: event.target.checked
                }))
              }
            />
            Replace all images
          </label>
        )}
      </div>
      <div className="flex gap-3 pt-4">
        <Button type="submit" disabled={isLoading} className="flex-1">
          {isLoading ? 'Saving...' : submitLabel}
        </Button>
        {onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel} className="flex-1">
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}
