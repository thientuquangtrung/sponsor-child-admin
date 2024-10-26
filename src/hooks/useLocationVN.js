import { useState, useEffect } from 'react';

function useLocationVN() {
    const [provinces, setProvinces] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [wards, setWards] = useState([]);
    const [selectedProvince, setSelectedProvince] = useState(null);
    const [selectedDistrict, setSelectedDistrict] = useState(null);
    const [selectedWard, setSelectedWard] = useState(null);

    useEffect(() => {
        // Fetch provinces
        fetch('https://open.oapi.vn/location/provinces?size=100')
            .then((response) => response.json())
            .then((data) => setProvinces(data.data || []))
            .catch((error) => console.error('Error fetching provinces:', error));
    }, []);

    useEffect(() => {
        if (selectedProvince) {
            // Fetch districts based on selected province
            fetch(`https://open.oapi.vn/location/districts?provinceId=${selectedProvince.id}&size=100`)
                .then((response) => response.json())
                .then((data) => setDistricts(data.data || []))
                .catch((error) => console.error('Error fetching districts:', error));
        }
    }, [selectedProvince]);

    useEffect(() => {
        if (selectedDistrict) {
            // Fetch wards based on selected district
            fetch(`https://open.oapi.vn/location/wards?districtId=${selectedDistrict.id}&size=100`)
                .then((response) => response.json())
                .then((data) => setWards(data.data || []))
                .catch((error) => console.error('Error fetching wards:', error));
        }
    }, [selectedDistrict]);

    return {
        provinces,
        districts,
        wards,
        selectedProvince,
        selectedDistrict,
        selectedWard,
        setSelectedProvince,
        setSelectedDistrict,
        setSelectedWard,
    };
}

export default useLocationVN;
