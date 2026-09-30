'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createDraft, submitListing, uploadPhoto } from '../../../lib/properties';

// Owner guided submit: Basic + Financial + Location. Media after create.
export default function NewListing() {
  const router = useRouter();
  const [msg, setMsg] = useState('');
  const [files, setFiles] = useState<FileList | null>(null);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMsg('Creating draft…');
    try {
      const fd = new FormData(e.currentTarget);
      const id = await createDraft({
        title: String(fd.get('title')),
        description: String(fd.get('description')),
        property_type: String(fd.get('property_type')),
        bedrooms: Number(fd.get('bedrooms')),
        bathrooms: Number(fd.get('bathrooms')),
        toilets: Number(fd.get('toilets')),
        furnished: fd.get('furnished') === 'on',
        price: Number(fd.get('price')),
        payment_frequency: String(fd.get('payment_frequency')),
        deposit: Number(fd.get('deposit') || 0),
        service_charge: Number(fd.get('service_charge') || 0),
        agency_fee: Number(fd.get('agency_fee') || 0),
        agreement_fee: Number(fd.get('agreement_fee') || 0),
        location_id: String(fd.get('location_id')),
        lister_kind: 'owner',
      });
      if (files?.length) {
        setMsg(`Uploading ${files.length} photo(s)… (min 5 for publish)`);
        await Promise.all([...files].slice(0, 10).map((f, i) => uploadPhoto(id, f, i)));
      }
      setMsg('Submitting for review…');
      await submitListing(id);
      router.push(`/listings/${id}`);
    } catch (err: any) {
      setMsg(err.message ?? 'Failed.');
    }
  };

  return (
    <main style={{ maxWidth: 640, margin: '40px auto', padding: 20 }}>
      <h1>List your property</h1>
      <p>Draft → review → verify → publish. Nothing goes public on upload alone.</p>
      <form onSubmit={onSubmit} style={{ display: 'grid', gap: 10 }}>
        <input name="title" placeholder="Title e.g. 3 Bedroom Apartment" required style={{ padding: 12 }} />
        <textarea name="description" placeholder="Description" required style={{ padding: 12 }} />
        <select name="property_type" defaultValue="apartment" style={{ padding: 12 }}>
          <option value="apartment">Apartment</option>
          <option value="self_contained">Self-contained</option>
          <option value="room">Room</option>
          <option value="duplex">Duplex</option>
          <option value="house">House</option>
          <option value="serviced">Serviced</option>
          <option value="short_let">Short-let</option>
        </select>
        <div style={{ display: 'flex', gap: 8 }}>
          <input name="bedrooms" type="number" defaultValue={3} placeholder="Beds" style={{ flex: 1, padding: 12 }} />
          <input name="bathrooms" type="number" defaultValue={3} placeholder="Baths" style={{ flex: 1, padding: 12 }} />
          <input name="toilets" type="number" defaultValue={3} placeholder="Toilets" style={{ flex: 1, padding: 12 }} />
        </div>
        <label><input name="furnished" type="checkbox" /> Furnished</label>
        <input name="price" type="number" placeholder="Rent e.g. 3500000" required style={{ padding: 12 }} />
        <select name="payment_frequency" defaultValue="yearly" style={{ padding: 12 }}>
          <option value="nightly">Nightly</option>
          <option value="monthly">Monthly</option>
          <option value="yearly">Yearly</option>
        </select>
        <div style={{ display: 'flex', gap: 8 }}>
          <input name="deposit" type="number" defaultValue={0} placeholder="Deposit" style={{ flex: 1, padding: 12 }} />
          <input name="service_charge" type="number" defaultValue={0} placeholder="Service charge" style={{ flex: 1, padding: 12 }} />
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <input name="agency_fee" type="number" defaultValue={0} placeholder="Agency fee" style={{ flex: 1, padding: 12 }} />
          <input name="agreement_fee" type="number" defaultValue={0} placeholder="Agreement fee" style={{ flex: 1, padding: 12 }} />
        </div>
        <input name="location_id" placeholder="Location UUID (see seed)" required style={{ padding: 12 }} />
        <input type="file" accept="image/*" multiple onChange={(e) => setFiles(e.target.files)} />
        <button className="ca-btn ca-btn--primary" type="submit">Submit for review</button>
      </form>
      <p>{msg}</p>
    </main>
  );
}
