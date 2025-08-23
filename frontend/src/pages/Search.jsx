
import { useEffect, useMemo, useState } from "react";
import { listCategories, searchServices } from "../api/services";
import MapLeaflet from "../components/MapLeaflet";
import { Link } from "react-router-dom";

export default function Search() {
  const [lat, setLat] = useState(null);
  const [lng, setLng] = useState(null);
  const [radius, setRadius] = useState(10);
  const [category, setCategory] = useState("");
  const [q, setQ] = useState("");
  const [categories, setCategories] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    listCategories().then(res => setCategories(res.data));
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setLat(pos.coords.latitude);
        setLng(pos.coords.longitude);
      });
    }
  }, []);

  const runSearch = async () => {
    if (lat == null || lng == null) return;
    setLoading(true);
    try {
      const res = await searchServices({ lat, lng, radius_km: radius, category_id: category || undefined, q: q || undefined });
      setResults(res.data);
    } finally {
      setLoading(false);
    }
  };

  const markers = useMemo(() => {
    return results.map(r => ({
      id: r.id,
      title: r.title || r.name,
      lat: r.provider_location?.lat || r.location_lat || lat,
      lng: r.provider_location?.lng || r.location_lng || lng,
      distance_km: r.distance_km
    })).filter(m => m.lat != null && m.lng != null);
  }, [results, lat, lng]);

  return (
    <div className="container">
      <h2>Search Services Near You</h2>
      <div className="card" style={{ padding: 16, marginBottom: 16 }}>
        <div className="grid" style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12 }}>
          <input placeholder="Latitude" value={lat ?? ""} onChange={e=>setLat(parseFloat(e.target.value)||0)} />
          <input placeholder="Longitude" value={lng ?? ""} onChange={e=>setLng(parseFloat(e.target.value)||0)} />
          <input placeholder="Radius (km)" type="number" value={radius} onChange={e=>setRadius(Number(e.target.value))} />
          <select value={category} onChange={e=>setCategory(e.target.value)}>
            <option value="">All categories</option>
            {categories.map(c => <option value={c.id} key={c.id}>{c.name}</option>)}
          </select>
          <input placeholder="Search..." value={q} onChange={e=>setQ(e.target.value)} />
        </div>
        <div style={{ marginTop: 12 }}>
          <button className="btn btn-primary" onClick={runSearch} disabled={lat==null || lng==null || loading}>
            {loading ? "Searching..." : "Search"}
          </button>
        </div>
      </div>
      <MapLeaflet center={lat && lng ? [lat, lng] : [30.0444, 31.2357]} markers={markers} />
      <div style={{ marginTop: 16 }}>
        <h3>Results ({results.length})</h3>
        <ul>
          {results.map(s => (
            <li key={s.id} style={{ marginBottom: 8 }}>
              <Link to={`/services/${s.id}`}>{s.title}</Link>
              {s.distance_km != null && <span> — {s.distance_km.toFixed(2)} km</span>}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
