import { useState } from 'react';
import { Button } from './Button';

export function PlantForm({ onSubmit, onCancel, defaultValues = {}, submitLabel = 'Add Plant', isLoading = false }) {
  const [formData, setFormData] = useState({
    name: defaultValues.name || '',
    price: defaultValues.price || '',
    category: defaultValues.category || '',
    description: defaultValues.description || defaultValues.short_description || '',
    request_title: defaultValues.request_title || '',
    request_message: defaultValues.request_message || '',
    image: null,
    images: [],
    replace_images: false
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = new FormData();
    payload.append('name', formData.name.trim());
    payload.append('price', parseFloat(formData.price));
    payload.append('category', formData.category.trim());
    if (formData.image) payload.append('image', formData.image);
    for (const file of formData.images) payload.append('images', file);
    if (formData.description?.trim()) payload.append('description', formData.description.trim());
    if (formData.request_title?.trim()) payload.append('request_title', formData.request_title.trim());
    if (formData.request_message?.trim()) {
      payload.append('request_message', formData.request_message.trim());
    }
    if (formData.replace_images) payload.append('replace_images', 'true');
    onSubmit(payload);
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'image') {
      setFormData({ ...formData, image: files[0] || null });
    } else if (name === 'images') {
      setFormData({ ...formData, images: Array.from(files || []) });
    } else {
      setFormData({ ...formData, [name]: value });
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
        <input
          type="file"
          name="image"
          accept="image/*"
          onChange={handleChange}
          className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-leaf-forest file:text-white hover:file:bg-leaf-forest/90"
        />
        {formData.image && <p className="mt-1 text-xs text-leaf-moss">Selected: {formData.image.name}</p>}
      </div>
      <div>
        <label className="block text-sm font-medium text-leaf-moss mb-2">More Photos (optional)</label>
        <input
          type="file"
          name="images"
          accept="image/*"
          multiple
          onChange={handleChange}
          className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-leaf-forest file:text-white hover:file:bg-leaf-forest/90"
        />
        {formData.images.length > 0 && (
          <p className="mt-1 text-xs text-leaf-moss">
            Selected: {formData.images.length} file{formData.images.length === 1 ? '' : 's'}
          </p>
        )}
        {defaultValues?.id && (formData.image || formData.images.length > 0) && (
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
            Replace existing photos
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
