// import React, { useState, useEffect, useRef } from "react";
// import "bootstrap/dist/css/bootstrap.min.css";
// import { BsEnvelope, BsTelephone, BsGeoAlt, BsStarFill } from "react-icons/bs";
// import { useNavigate, useParams } from "react-router-dom";
// import apiService from "../services/ApiService";

// const ClientProfile = () => {
//   const injected = useRef(false);
//   const navigate = useNavigate();
//   const { id } = useParams();
//   const [client, setClient] = useState(null);
//   const [activeTab, setActiveTab] = useState("overview");
//   const [errorMsg, setErrorMsg] = useState("");

  

//   useEffect(() => {
//     const fetchClientProfile = async () => {
//       try {
//         // لو id موجود في الرابط، استخدمه، لو لأ استخدم profile/ للملف الشخصي الحالي
//         const url = id 
//           ? `api/accounts/client/${id}/` 
//           : `api/accounts/client/profile/`;
//         const data = await apiService.get(url);
//         setClient(data);
//       } catch (err) {
//         console.error("❌ Error fetching client profile:", err);
//         setErrorMsg("فشل في تحميل بيانات البروفايل");
//       }
//     };
//     fetchClientProfile();
//   }, [id]);
  

//   // Inject CSS once
//   useEffect(() => {
//     if (injected.current) return;
//     const css = `
//       :root { --primary:#0077ff; --bg:#f9fbff; --muted:#6b7280; }
//       body { background:var(--bg); font-family:'Segoe UI', sans-serif; }
//       .profile-cover { background:linear-gradient(135deg, #0077ff, #22c55e); height:180px; border-radius:0 0 1.5rem 1.5rem; position:relative; }
//       .profile-avatar { position:absolute; bottom:-50px; left:2rem; width:100px; height:100px; border-radius:50%; background:#fff; display:flex; align-items:center; justify-content:center; font-size:2rem; font-weight:bold; color:var(--primary); box-shadow:0 4px 14px rgba(0,0,0,.1); }
//       .card-custom { background:#fff; border-radius:1rem; box-shadow:0 6px 18px rgba(0,0,0,.05); padding:1.5rem; }
//       .stat-box { background:#fff; border-radius:1rem; padding:1rem; text-align:center; box-shadow:0 4px 12px rgba(0,0,0,.05); }
//       .testimonial { background:#fff; border-radius:1rem; padding:1.5rem; box-shadow:0 4px 12px rgba(0,0,0,.05); text-align:center; transition:.3s; }
//       .testimonial:hover { transform:translateY(-5px); }
//       .nav-tabs .nav-link { cursor:pointer; }
//       .text-danger { color:#dc3545; }
//     `;
//     const style = document.createElement("style");
//     style.innerHTML = css;
//     document.head.appendChild(style);
//     injected.current = true;
//   }, []);

//   if (!client) return <div className="text-center mt-5">Loading client profile...</div>;

//   return (
//     <div className="pb-5">
//       <div className="profile-cover">
//         <div className="profile-avatar">{client.username ? client.username[0].toUpperCase() : "U"}</div>
//       </div>

//       <div className="container mt-5 position-relative">
//         <h3 className="fw-bold d-inline">{client.first_name} {client.last_name}</h3>
//         <p className="text-muted">@{client.username}</p>
//         <p>{client.bio || "No bio available."}</p>
//         <small className="text-muted">Joined {client.joined_date || "N/A"}</small>

//         {/* <div className="row text-center mt-4 g-3">
//           <div className="col-6 col-md-4"><div className="stat-box"><h5>{client.orders?.length || 0}</h5><p>Services</p></div></div>
//           <div className="col-6 col-md-4"><div className="stat-box"><h5>{client.orders?.filter(o => o.status==="completed").length || 0}</h5><p>Clients</p></div></div>
//           <div className="col-6 col-md-4"><div className="stat-box"><h5>{client.reviews?.length || 0}</h5><p>Reviews</p></div></div>
//         </div> */}

// <div className="row text-center mt-4 g-3">
//   <div className="col-6 col-md-4">
//     <div className="stat-box">
//       <h5>{client.orders?.length || 0}</h5>
//       <p>Total Orders</p>
//     </div>
//   </div>
//   <div className="col-6 col-md-4">
//     <div className="stat-box">
//       <h5>{client.orders?.filter(o => o.status === "completed").length || 0}</h5>
//       <p>Completed Orders</p>
//     </div>
//   </div>
//   <div className="col-6 col-md-4">
//     <div className="stat-box">
//       <h5>
//         {client.orders?.reduce((sum, o) => sum + (o.price || 0), 0) || 0} EGP
//       </h5>
//       <p>Total Spent</p>
//     </div>
//   </div>
// </div>


//         <div className="row g-4 mt-4">
//           <div className="col-md-6">
//             <div className="card-custom">
//               <h5 className="fw-bold mb-3">Contact</h5>
//               <p><BsEnvelope /> {client.email}</p>
//               <p><BsTelephone /> {client.phone || "N/A"}</p>
//               <p><BsGeoAlt /> {client.address || "N/A"}</p>
//             </div>
//           </div>
//           <div className="col-md-6">
//             <div className="card-custom">
//               <h5 className="fw-bold mb-3">About</h5>
//               <p>{client.bio || "No bio available."}</p>
//             </div>
//           </div>
//         </div>

//         {/* <ul className="nav nav-tabs mt-5">
//           {["overview", "orders", "reviews", "contact"].map(tab => (
//             <li className="nav-item" key={tab}>
//               <button
//                 className={`nav-link ${activeTab === tab ? "active" : ""}`}
//                 onClick={() => setActiveTab(tab)}
//               >
//                 {tab.charAt(0).toUpperCase() + tab.slice(1)}
//               </button>
//             </li>
//           ))}
//         </ul> */}

// <ul className="nav nav-tabs mt-5">
//   {["overview", "orders", "history", "contact"].map(tab => (
//     <li className="nav-item" key={tab}>
//       <button
//         className={`nav-link ${activeTab === tab ? "active" : ""}`}
//         onClick={() => setActiveTab(tab)}
//       >
//         {tab.charAt(0).toUpperCase() + tab.slice(1)}
//       </button>
//     </li>
//   ))}
// </ul>


//         <div className="mt-3">
//           {activeTab === "overview" && (
//             <div className="row g-4">
//               <div className="col-md-6">
//                 <div className="card-custom">
//                   <h5>About</h5>
//                   <p>{client.bio || "No bio available."}</p>
//                   <p><strong>Joined:</strong> {client.joined_date || "N/A"}</p>
//                 </div>
//               </div>
//               <div className="col-md-6">
//                 <div className="card-custom">
//                   <h5>Contact Info</h5>
//                   <p><BsEnvelope /> {client.email}</p>
//                   <p><BsTelephone /> {client.phone || "N/A"}</p>
//                   <p><BsGeoAlt /> {client.address || "N/A"}</p>
//                 </div>
//               </div>
//             </div>
//           )}
//           {activeTab === "orders" && (
//             <div className="mt-3">
//               {client.orders?.length ? client.orders.map(o => (
//                 <div key={o.id} className="card-custom mb-3">
//                   <h6>{o.title || `Order #${o.id}`}</h6>
//                   <p className="text-muted small">Status: {o.status} • Date: {o.date}</p>
//                 </div>
//               )) : <p>No orders yet.</p>}
//             </div>
//           )}
//           {/* {activeTab === "reviews" && (
//             <div className="mt-3">
//               {client.reviews?.length ? client.reviews.map((r, idx) => (
//                 <div key={idx} className="testimonial">
//                   <div className="mb-2">
//                     {[...Array(5)].map((_, j) => <BsStarFill key={j} className="text-warning" />)}
//                   </div>
//                   <p className="text-muted">“{r.comment}”</p>
//                   <div className="fw-bold">{r.client_name || "Anonymous"}</div>
//                 </div>
//               )) : <p>No reviews yet.</p>}
//             </div>
//           )} */}

// {activeTab === "history" && (
//   <div className="mt-3">
//     {client.orders?.length ? client.orders.map((o) => (
//       <div key={o.id} className="card-custom mb-3">
//         <h6>{o.title || `Order #${o.id}`}</h6>
//         <p className="text-muted small">
//           Status: {o.status} • Date: {o.date} • Price: {o.price || 0} EGP
//         </p>
//       </div>
//     )) : <p>No order history yet.</p>}
//   </div>
// )}


//           {activeTab === "contact" && (
//             <div className="card-custom mt-3">
//               <h5>Contact</h5>
//               <p><BsEnvelope /> {client.email}</p>
//               <p><BsTelephone /> {client.phone || "N/A"}</p>
//               <p><BsGeoAlt /> {client.address || "N/A"}</p>
//             </div>
//           )}
//         </div>

//         {/* Edit Profile Form */}
//         {String(client.id) === String(JSON.parse(localStorage.getItem("user"))?.id) && (
//             <div style={{ position: "absolute", top: 0, right: 0 }}>
//               <EditProfileForm client={client} setClient={setClient} />
//            </div>
//         )}

//         {errorMsg && <p className="text-danger mt-3">{errorMsg}</p>}
//       </div>
      
//     </div>
//   );
// };

// export default ClientProfile;

// // ------------------ EditProfileForm Component ------------------
// const EditProfileForm = ({ client, setClient }) => {
//   const [editing, setEditing] = useState(false);
//   const [formData, setFormData] = useState({
//     username: client.username || "",
//     first_name: client.first_name || "",
//     last_name: client.last_name || "",
//     email: client.email || "",
//     phone: client.phone || "",
//     bio: client.bio || "",
//     password: "", 
//   });
//   const [errorMsg, setErrorMsg] = useState("");

//   const handleChange = (e) => setFormData({...formData, [e.target.name]: e.target.value});

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setErrorMsg("");
//     try {
//       const dataToSend = {...formData};
//       if (!dataToSend.password) delete dataToSend.password;

//       await apiService.put(`api/accounts/client/profile/full-update/`, dataToSend);


//       // تحديث محليًا بدون إعادة تحميل الصفحة
//       setClient({...client, ...dataToSend, password: undefined});
//       setEditing(false);
//     } catch (err) {
//       console.error(err);
//       setErrorMsg("فشل في تحديث البروفايل");
//     }
//   };

//   return (
//     <div className="text-center mt-3">
//       {!editing ? (
//         <button className="btn btn-outline-primary" onClick={() => setEditing(true)}>Edit Profile</button>
//       ) : (
//         <form className="card p-3 mt-3 shadow-sm" style={{maxWidth:"500px", margin:"auto"}} onSubmit={handleSubmit}>
//           {errorMsg && <p className="text-danger">{errorMsg}</p>}
//           <div className="mb-2">
//             <label>Username</label>
//             <input type="text" name="username" className="form-control" value={formData.username} onChange={handleChange} required/>
//           </div>
//           <div className="mb-2">
//             <label>First Name</label>
//             <input type="text" name="first_name" className="form-control" value={formData.first_name} onChange={handleChange}/>
//           </div>
//           <div className="mb-2">
//             <label>Last Name</label>
//             <input type="text" name="last_name" className="form-control" value={formData.last_name} onChange={handleChange}/>
//           </div>
//           <div className="mb-2">
//             <label>Email</label>
//             <input type="email" name="email" className="form-control" value={formData.email} onChange={handleChange} required/>
//           </div>
//           <div className="mb-2">
//             <label>Phone</label>
//             <input type="text" name="phone" className="form-control" value={formData.phone} onChange={handleChange}/>
//           </div>
//           <div className="mb-2">
//             <label>Bio</label>
//             <textarea name="bio" className="form-control" value={formData.bio} onChange={handleChange}/>
//           </div>
//           <div className="mb-2">
//             <label>Password (leave blank to keep current)</label>
//             <input type="password" name="password" className="form-control" value={formData.password} onChange={handleChange}/>
//           </div>
//           <div className="d-flex justify-content-between mt-3">
//             <button type="submit" className="btn btn-primary">Save</button>
//             <button type="button" className="btn btn-secondary" onClick={() => setEditing(false)}>Cancel</button>
//           </div>
//         </form>
//       )}
//     </div>
//   );
// };




