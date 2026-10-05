import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { ImagePlus, Link2, Loader2, Star, X } from 'lucide-react';
import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import { FormField } from '@/components/common/FormField';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Modal } from '@/components/ui/modal';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { getErrorMessage } from '@/lib/api/client';
import { adminVenuesApi } from '@/lib/api/venues';
import { handleFormError } from '@/lib/errors';
import { VENUE_TYPE_LABEL } from '@/lib/format';
import { resolveImage } from '@/lib/image';
import type { Venue, VenueType } from '@/types/venue';

const schema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(150),
  description: z.string().trim().min(1, 'Description is required').max(5000),
  location: z.string().trim().min(1, 'City / location is required').max(100),
  address: z.string().trim().min(1, 'Address is required').max(255),
  capacity: z
    .number({ invalid_type_error: 'Enter capacity' })
    .int('Whole numbers only')
    .min(1, 'At least 1')
    .max(100000),
  price: z.number({ invalid_type_error: 'Enter price' }).min(1, 'At least ₹1'),
});
type Values = z.infer<typeof schema>;

const SUGGESTED_AMENITIES: Record<VenueType, string[]> = {
  hall: [
    'AC',
    'Parking',
    'Stage',
    'Catering',
    'Sound System',
    'Decoration',
    'Power Backup',
    'Bridal Room',
  ],
  pool: [
    'Poolside Seating',
    'Shower',
    'Changing Rooms',
    'Lifeguard',
    'Music System',
    'Snacks Counter',
  ],
  room: ['AC', 'WiFi', 'TV', 'Balcony', 'Room Service', 'Breakfast', 'Mini Bar'],
};

const FIELDS = ['name', 'description', 'location', 'address', 'capacity', 'price'] as const;

interface VenueFormModalProps {
  open: boolean;
  onClose: () => void;
  type: VenueType;
  venue?: Venue | null;
}

export function VenueFormModal({ open, onClose, type, venue }: VenueFormModalProps) {
  const queryClient = useQueryClient();
  const fileInput = useRef<HTMLInputElement>(null);
  const [amenities, setAmenities] = useState<string[]>([]);
  const [amenityInput, setAmenityInput] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [imageUrl, setImageUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [isFeatured, setIsFeatured] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [imageError, setImageError] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<Values>({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (!open) return;
    reset(
      venue
        ? {
            name: venue.name,
            description: venue.description,
            location: venue.location,
            address: venue.address,
            capacity: venue.capacity,
            price: venue.price,
          }
        : {
            name: '',
            description: '',
            location: '',
            address: '',
            capacity: undefined,
            price: undefined,
          },
    );
    setAmenities(venue?.amenities ?? []);
    setImages(venue?.images ?? []);
    setIsFeatured(venue?.isFeatured ?? false);
    setIsActive(venue?.isActive ?? true);
    setAmenityInput('');
    setImageUrl('');
    setImageError('');
  }, [open, venue, reset]);

  const addAmenity = (value: string) => {
    const clean = value.trim().slice(0, 60);
    if (
      !clean ||
      amenities.some(a => a.toLowerCase() === clean.toLowerCase()) ||
      amenities.length >= 30
    )
      return;
    setAmenities(list => [...list, clean]);
  };

  const onAmenityKey = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault();
      addAmenity(amenityInput);
      setAmenityInput('');
    }
  };

  const onFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    const room = 12 - images.length;
    const selected = Array.from(files).slice(0, room);
    setUploading(true);
    try {
      for (const file of selected) {
        if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
          toast.error(`${file.name}: only JPG, PNG or WEBP images are allowed`);
          continue;
        }
        if (file.size > 5 * 1024 * 1024) {
          toast.error(`${file.name}: image must be under 5 MB`);
          continue;
        }
        const { url } = await adminVenuesApi.uploadImage(file);
        setImages(list => [...list, url]);
        setImageError('');
      }
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setUploading(false);
      if (fileInput.current) fileInput.current.value = '';
    }
  };

  const addImageUrl = () => {
    const url = imageUrl.trim();
    if (!/^https?:\/\/.+/i.test(url))
      return setImageError('Enter a valid image URL starting with http(s)://');
    if (images.length >= 12) return setImageError('Up to 12 images');
    setImages(list => [...list, url]);
    setImageUrl('');
    setImageError('');
  };

  const makeCover = (index: number) =>
    setImages(list => [list[index], ...list.filter((_, i) => i !== index)]);

  const onSubmit = async (values: Values) => {
    if (!images.length) return setImageError('Add at least one image');
    const payload = {
      ...values,
      type,
      priceUnit: type === 'room' ? ('night' as const) : ('day' as const),
      amenities,
      images,
      isFeatured,
      isActive,
    };
    try {
      if (venue) {
        await adminVenuesApi.update(venue.id, payload);
        toast.success(`${values.name} updated`);
      } else {
        await adminVenuesApi.create(payload);
        toast.success(`${values.name} created`);
      }
      void queryClient.invalidateQueries({ queryKey: ['admin'] });
      void queryClient.invalidateQueries({ queryKey: ['venues'] });
      onClose();
    } catch (error) {
      handleFormError(error, setError, FIELDS);
    }
  };

  const label = VENUE_TYPE_LABEL[type];

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="xl"
      title={venue ? `Edit ${venue.name}` : `Add ${label.toLowerCase()}`}
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="venue-form" disabled={isSubmitting || uploading}>
            {isSubmitting ? 'Saving…' : venue ? 'Save changes' : `Create ${label.toLowerCase()}`}
          </Button>
        </>
      }
    >
      <form id="venue-form" onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            label="Name"
            htmlFor="name"
            error={errors.name?.message}
            required
            className="md:col-span-2"
          >
            <Input id="name" {...register('name')} />
          </FormField>
          <FormField
            label="City / location"
            htmlFor="location"
            error={errors.location?.message}
            required
          >
            <Input id="location" placeholder="Bengaluru" {...register('location')} />
          </FormField>
          <FormField
            label="Full address"
            htmlFor="address"
            error={errors.address?.message}
            required
          >
            <Input id="address" {...register('address')} />
          </FormField>
          <FormField
            label="Capacity (guests)"
            htmlFor="capacity"
            error={errors.capacity?.message}
            required
          >
            <Input
              id="capacity"
              type="number"
              min={1}
              {...register('capacity', { valueAsNumber: true })}
            />
          </FormField>
          <FormField
            label={`Price per ${type === 'room' ? 'night' : 'day'} (₹, excl. GST)`}
            htmlFor="price"
            error={errors.price?.message}
            required
          >
            <Input
              id="price"
              type="number"
              min={1}
              step="0.01"
              {...register('price', { valueAsNumber: true })}
            />
          </FormField>
          <FormField
            label="Description"
            htmlFor="description"
            error={errors.description?.message}
            required
            className="md:col-span-2"
          >
            <Textarea id="description" rows={4} {...register('description')} />
          </FormField>
        </div>

        <FormField label="Amenities" htmlFor="amenity" hint="Press Enter to add">
          <div className="flex flex-wrap gap-2 rounded-lg border p-2">
            {amenities.map(item => (
              <span
                key={item}
                className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1 text-xs font-semibold text-primary"
              >
                {item}
                <button
                  type="button"
                  aria-label={`Remove ${item}`}
                  onClick={() => setAmenities(list => list.filter(a => a !== item))}
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
            <input
              id="amenity"
              value={amenityInput}
              onChange={event => setAmenityInput(event.target.value)}
              onKeyDown={onAmenityKey}
              onBlur={() => {
                addAmenity(amenityInput);
                setAmenityInput('');
              }}
              placeholder="Add amenity"
              className="min-w-[120px] flex-1 bg-transparent px-1 text-sm outline-none"
            />
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {SUGGESTED_AMENITIES[type]
              .filter(s => !amenities.includes(s))
              .map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => addAmenity(s)}
                  className="rounded-full border border-dashed px-2.5 py-0.5 text-xs text-muted-foreground hover:border-primary hover:text-primary"
                >
                  + {s}
                </button>
              ))}
          </div>
        </FormField>

        <FormField
          label="Images"
          htmlFor="imageUrl"
          error={imageError}
          hint="The first image is the cover. Up to 12 images."
          required
        >
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
            {images.map((image, index) => (
              <div
                key={`${image}-${index}`}
                className="group relative aspect-square overflow-hidden rounded-xl border"
              >
                <img src={resolveImage(image)} alt="" className="h-full w-full object-cover" />
                {index === 0 && (
                  <span className="absolute left-1 top-1 rounded bg-primary px-1.5 py-0.5 text-[10px] font-bold text-white">
                    Cover
                  </span>
                )}
                <div className="absolute inset-0 flex items-end justify-between gap-1 bg-black/0 p-1 opacity-0 transition group-hover:bg-black/30 group-hover:opacity-100">
                  {index > 0 ? (
                    <button
                      type="button"
                      onClick={() => makeCover(index)}
                      className="rounded bg-white/90 p-1"
                      aria-label="Make cover"
                      title="Make cover"
                    >
                      <Star className="h-3.5 w-3.5" />
                    </button>
                  ) : (
                    <span />
                  )}
                  <button
                    type="button"
                    onClick={() => setImages(list => list.filter((_, i) => i !== index))}
                    className="rounded bg-white/90 p-1 text-destructive"
                    aria-label="Remove image"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
            {images.length < 12 && (
              <button
                type="button"
                onClick={() => fileInput.current?.click()}
                disabled={uploading}
                className="flex aspect-square flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed text-xs text-muted-foreground hover:border-primary hover:text-primary"
              >
                {uploading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <ImagePlus className="h-5 w-5" />
                )}
                {uploading ? 'Uploading' : 'Upload'}
              </button>
            )}
          </div>
          <input
            ref={fileInput}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            hidden
            onChange={event => onFiles(event.target.files)}
          />
          <div className="mt-2 flex gap-2">
            <div className="relative flex-1">
              <Link2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="imageUrl"
                value={imageUrl}
                onChange={event => setImageUrl(event.target.value)}
                onKeyDown={event => {
                  if (event.key === 'Enter') {
                    event.preventDefault();
                    addImageUrl();
                  }
                }}
                placeholder="…or paste an image URL"
                className="pl-9"
              />
            </div>
            <Button type="button" variant="outline" onClick={addImageUrl}>
              Add URL
            </Button>
          </div>
        </FormField>

        <div className="flex flex-wrap gap-6 rounded-xl bg-muted/50 p-4">
          <label className="flex items-center gap-3 text-sm font-medium">
            <Switch checked={isActive} onCheckedChange={setIsActive} label="Active" />
            Active (visible & bookable)
          </label>
          <label className="flex items-center gap-3 text-sm font-medium">
            <Switch checked={isFeatured} onCheckedChange={setIsFeatured} label="Featured" />
            Featured on home page
          </label>
        </div>
      </form>
    </Modal>
  );
}
