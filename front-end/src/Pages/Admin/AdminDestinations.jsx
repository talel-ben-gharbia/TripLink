import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';
import { Plus, Trash2, Edit, MapPin, Sparkles, Pin } from 'lucide-react';
import { useErrorToast } from '../../Component/ErrorToast';

const AdminDestinations = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({ name: '', country: '', city: '', category: 'city', priceMin: '', priceMax: '', image: '' });
  const [editingId, setEditingId] = useState(null);
  const { showToast, ToastContainer } = useErrorToast();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) return navigate('/');
    try {
      const user = JSON.parse(userData);
      if (!user.isAdmin) return navigate('/');
    } catch {
      return navigate('/');
    }
    load();
  }, [navigate]);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/admin/destinations');
      setItems(res.data || []);
      setError(null);
    } catch (e) {
      setError(e.message || 'Failed to load destinations');
    } finally {
      setLoading(false);
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: form.name,
        country: form.country,
        city: form.city || null,
        category: form.category || 'city',
        priceMin: form.priceMin ? Number(form.priceMin) : null,
        priceMax: form.priceMax ? Number(form.priceMax) : null,
        images: form.image ? [form.image] : [],
      };
      if (editingId) {
        await api.put(`/api/admin/destinations/${editingId}`, payload);
      } else {
        await api.post('/api/admin/destinations', payload);
      }
      setForm({ name: '', country: '', city: '', category: 'city', priceMin: '', priceMax: '', image: '' });
      setEditingId(null);
      showToast(editingId ? 'Destination updated successfully!' : 'Destination created successfully!', 'success', 3000);
      load();
    } catch (e) {
      showToast(e.response?.data?.error || e.message || 'Failed to save destination', 'error', 5000);
    }
  };

  const edit = (d) => {
    setEditingId(d.id);
    setForm({
      name: d.name || '',
      country: d.country || '',
      city: d.city || '',
      category: d.category || 'city',
      priceMin: d.priceMin || '',
      priceMax: d.priceMax || '',
      image: d.image || ''
    });
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this destination?')) return;
    try {
      await api.delete(`/api/admin/destinations/${id}`);
      showToast('Destination deleted successfully!', 'success', 3000);
      load();
    } catch (e) {
      showToast(e.response?.data?.error || e.message || 'Failed to delete destination', 'error', 5000);
    }
  };

  // Phase 1: Feature/unfeature destination
  const toggleFeature = async (id, currentState) => {
    try {
      if (currentState) {
        await api.post(`/api/admin/destinations/${id}/unfeature`);
      } else {
        await api.post(`/api/admin/destinations/${id}/feature`);
      }
      showToast('Featured status updated successfully!', 'success', 3000);
      load();
    } catch (e) {
      showToast(e.response?.data?.error || e.message || 'Failed to update featured status', 'error', 5000);
    }
  };

  // Phase 1: Pin/unpin destination
  const togglePin = async (id, currentState) => {
    try {
      if (currentState) {
        await api.post(`/api/admin/destinations/${id}/unpin`);
      } else {
        await api.post(`/api/admin/destinations/${id}/pin`);
      }
      showToast('Pinned status updated successfully!', 'success', 3000);
      load();
    } catch (e) {
      showToast(e.response?.data?.error || e.message || 'Failed to update pinned status', 'error', 5000);
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-white flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Destination Management</h1>
          <button onClick={() => navigate('/admin')} className="px-4 py-2 bg-gray-100 rounded">Back to Dashboard</button>
        </div>

        {error && <div className="mb-4 bg-red-50 border border-red-300 p-3 rounded">{error}</div>}

        <form onSubmit={submit} className="bg-white rounded-xl p-6 shadow border border-gray-200 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input value={form.name} onChange={(e)=>setForm({...form,name:e.target.value})} placeholder="Name" className="border rounded px-3 py-2" />
            <input value={form.country} onChange={(e)=>setForm({...form,country:e.target.value})} placeholder="Country" className="border rounded px-3 py-2" />
            <input value={form.city} onChange={(e)=>setForm({...form,city:e.target.value})} placeholder="City" className="border rounded px-3 py-2" />
            <select value={form.category} onChange={(e)=>setForm({...form,category:e.target.value})} className="border rounded px-3 py-2">
              <option value="city">City</option>
              <option value="beach">Beach</option>
              <option value="mountain">Mountain</option>
              <option value="cultural">Cultural</option>
              <option value="adventure">Adventure</option>
            </select>
            <input value={form.priceMin} onChange={(e)=>setForm({...form,priceMin:e.target.value})} placeholder="Price Min" type="number" className="border rounded px-3 py-2" />
            <input value={form.priceMax} onChange={(e)=>setForm({...form,priceMax:e.target.value})} placeholder="Price Max" type="number" className="border rounded px-3 py-2" />
            <input value={form.image} onChange={(e)=>setForm({...form,image:e.target.value})} placeholder="Image URL" className="border rounded px-3 py-2 md:col-span-3" />
          </div>
          <button type="submit" className="mt-4 px-5 py-2 bg-blue-600 text-white rounded flex items-center gap-2">
            {editingId ? <Edit size={16}/> : <Plus size={16}/>} {editingId ? 'Update Destination' : 'Add Destination'}
          </button>
        </form>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((d) => (
            <div key={d.id} className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
              <div className="h-40 bg-gray-100">
                {d.image ? <img src={d.image} alt={d.name} className="w-full h-full object-cover" /> : <div className="h-full w-full flex items-center justify-center text-gray-400">No Image</div>}
              </div>
              <div className="p-4">
                <div className="flex items-center text-gray-600 text-sm mb-1"><MapPin size={16} className="mr-1"/> {d.city ? `${d.city}, ${d.country}` : d.country}</div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-bold text-gray-900">{d.name}</div>
                    <div className="text-xs text-gray-600">{d.category}</div>
                  </div>
                  {(d.isFeatured || d.isPinned) && (
                    <div className="flex items-center gap-1">
                      {d.isFeatured && <span className="px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-700 border border-purple-200 flex items-center gap-1"><Sparkles size={10} />Featured</span>}
                      {d.isPinned && <span className="px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-700 border border-yellow-200 flex items-center gap-1"><Pin size={10} />Pinned</span>}
                    </div>
                  )}
                </div>
                {(d.priceMin || d.priceMax) && <div className="text-sm text-gray-700 mt-1">{d.priceMin ? `$${d.priceMin}` : ''}{d.priceMax ? ` - $${d.priceMax}` : ''}</div>}
                <div className="flex flex-wrap gap-2 mt-3">
                  <button onClick={()=>edit(d)} className="px-3 py-1 bg-gray-100 rounded flex items-center gap-1 text-sm"><Edit size={14}/> Edit</button>
                  <button 
                    onClick={()=>toggleFeature(d.id, d.isFeatured)} 
                    className={`px-3 py-1 rounded flex items-center gap-1 text-sm ${d.isFeatured ? 'bg-purple-600 text-white' : 'bg-purple-100 text-purple-700'}`}
                    title={d.isFeatured ? 'Unfeature' : 'Feature'}
                  >
                    <Sparkles size={14}/> {d.isFeatured ? 'Featured' : 'Feature'}
                  </button>
                  <button 
                    onClick={()=>togglePin(d.id, d.isPinned)} 
                    className={`px-3 py-1 rounded flex items-center gap-1 text-sm ${d.isPinned ? 'bg-yellow-600 text-white' : 'bg-yellow-100 text-yellow-700'}`}
                    title={d.isPinned ? 'Unpin' : 'Pin'}
                  >
                    <Pin size={14}/> {d.isPinned ? 'Pinned' : 'Pin'}
                  </button>
                  <button onClick={()=>remove(d.id)} className="px-3 py-1 bg-red-600 text-white rounded flex items-center gap-1 text-sm"><Trash2 size={14}/> Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDestinations;
