export const reverseGeocodeFunction = async (lat, lng, setLocation, onSelect) => {
    if (!window.google) return;
    try {
        const geocoder = new window.google.maps.Geocoder();
        const latlng = new window.google.maps.LatLng(lat, lng);

        geocoder.geocode({ location: latlng }, (results, status) => {
            if (status === 'OK' && results[0]) {
                const address = results[0].formatted_address;
                const updatedLocation = { lat, lng, address };
                setLocation(updatedLocation);
                onSelect?.(updatedLocation);
            }
        });
    } catch (error) {
        console.error('Error in reverse geocoding:', error);
    }
};
