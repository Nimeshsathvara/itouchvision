import Image from "next/image";
import React, { useState, useEffect } from "react";

const Index = () => {
  const [postcode, setPostcode] = useState("");
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState("");
  const [error, setError] = useState("");
  const [collectionDays, setCollectionDays] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const validPostcodes = ["NP18 2LE", "NP20 3BQ", "NP19 9QQ", "NP19 8NR"];

  const fetchAddresses = async (postcode) => {
    if (!validPostcodes.includes(postcode.trim().toUpperCase())) {
      setAddresses([]);
      setError("Please enter a valid postcode.");
      setCollectionDays([]);
      return;
    }

    setError("");
    setLoading(true);

    try {
      const response = await fetch(
        "https://iweb.itouchvision.com/portal/itouchvision/kmbd_demo/address",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            P_GUID: "FF93E12280E5471FE053A000A8C08BEB",
            P_POSTCODE: postcode.trim().toUpperCase(),
          }),
        }
      );

      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      const data = await response.json();

      if (data?.ADDRESS?.length > 0) {
        setAddresses(data.ADDRESS);
        setCollectionDays([]);
      } else {
        setAddresses([]);
        setError("No addresses found for this postcode.");
        setCollectionDays([]);
      }
    } catch (err) {
      setError("Failed to fetch addresses. Please try again later.");
      setAddresses([]);
      setCollectionDays([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCollectionDays = async (uprn) => {
    setLoading(true);
    setError("");
    setCollectionDays([]);
    
    try {
      const response = await fetch(
        "https://iweb.itouchvision.com/portal/itouchvision/kmbd_demo/collectionDay",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            P_GUID: "FF93E12280E5471FE053A000A8C08BEB",
            P_UPRN: uprn,
            P_CLIENT_ID: 130,
            P_COUNCIL_ID: 260,
          }),
        }
      );

      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      const data = await response.json();

      if (data?.collectionDay?.length > 0) {
        const uniqueCollectionDays = [];
        const seenTypes = new Set();

        data.collectionDay.forEach((collection) => {
          if (!seenTypes.has(collection.binType)) {
            seenTypes.add(collection.binType);
            uniqueCollectionDays.push(collection);
          }
        });

        setCollectionDays(uniqueCollectionDays);
      } else {
        setCollectionDays([]);
        setError("No collection available for your address.");
      }
    } catch (err) {
      setError("Failed to fetch collection days. Please try again later.");
      setCollectionDays([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (postcode.trim().length > 6) {
      fetchAddresses(postcode);
    } else {
      setAddresses([]);
      setError("");
      setCollectionDays([]);
    }
  }, [postcode]);

  const handlePostcodeChange = (e) => {
    setPostcode(e.target.value);
    setSelectedAddress("");
  };

  const handleAddressInputChange = (e) => {
    const value = e.target.value;
    setSelectedAddress(value);
    setShowDropdown(true);
  };

  const handleAddressSelect = (address) => {
    setSelectedAddress(address.FULL_ADDRESS);
    setShowDropdown(false);
    fetchCollectionDays(address.UPRN);
  };

  const clearAddress = () => {
    setPostcode("");
    setAddresses([]);
    setSelectedAddress("");
    setCollectionDays([]);
    setError("");
  };

  return (
    <div className="p-5">
      <div className="border-t-4 border-r-2">
        <h1 className="text-3xl font-bold">
          Find out your rubbish <br /> collection day
        </h1>
        <p>Check when your rubbish collection</p>

        <div className="flex flex-col md:flex-row gap-[20px]">
          <div className="w-full md:w-[70%]">
            <div className="bg-gray-200 py-5 px-3">
              <h1 className="text-[14px] font-semibold">Enter your postcode</h1>
              <h1 className="text-[12px] text-gray-600 mt-2">For example SWA1A 2AA</h1>

              <input
                type="text"
                className="border border-black bg-white p-1 mt-2 w-full md:w-auto"
                value={postcode}
                onChange={handlePostcodeChange}
              />
              {error && <p className="text-red-500 mt-2">{error}</p>}

              <label htmlFor="addresses" className="block mt-3 mb-2 text-[14px] font-semibold">
                Select an address or type
              </label>

              <input
                type="text"
                id="addressInput"
                className="border border-gray-300 bg-white p-2 w-full"
                placeholder="Start typing your address..."
                value={selectedAddress}
                onChange={handleAddressInputChange}
                onFocus={() => setShowDropdown(true)}
              />

              {showDropdown && addresses.length > 0 && (
                <ul className="bg-white border border-gray-300 mt-2 max-h-40 overflow-y-auto">
                  {addresses
                    .filter((address) =>
                      address.FULL_ADDRESS.toLowerCase().includes(selectedAddress.toLowerCase())
                    )
                    .map((address, index) => (
                      <li
                        key={index}
                        className="p-2 hover:bg-gray-100 cursor-pointer"
                        onClick={() => handleAddressSelect(address)}
                      >
                        {address.FULL_ADDRESS}
                      </li>
                    ))}
                </ul>
              )}

              <p className="text-blue-500 underline mt-3 text-[13px] cursor-pointer" onClick={clearAddress}>
                Clear Address and Start Again
              </p>
            </div>

            {collectionDays.length > 0 && (
              <div className="mt-5">
                <p className="text-lg font-semibold">Your Next Collection</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {collectionDays.map((collection, index) => (
                    <div key={index} className="p-3 text-white text-[14px]" style={{ backgroundColor: collection.binColor }}>
                      <p className="font-bold">{collection.binType}</p>
                      <p className="text-sm text-gray-200">{collection.followingDay}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
