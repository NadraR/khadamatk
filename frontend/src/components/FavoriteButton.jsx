
import { useState } from "react";
import { addFavorite, removeFavorite } from "../api/services";

export default function FavoriteButton({ serviceId, initiallyFav=false }) {
  const [fav, setFav] = useState(initiallyFav);
  const toggle = async () => {
    if (fav) {
      await removeFavorite(serviceId);
      setFav(false);
    } else {
      await addFavorite(serviceId);
      setFav(true);
    }
  };
  return (
    <button onClick={toggle} className={"btn " + (fav ? "btn-danger" : "btn-outline")}>
      {fav ? "♥ Remove Favorite" : "♡ Add to Favorites"}
    </button>
  );
}
