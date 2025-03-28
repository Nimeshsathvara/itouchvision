import React, { useState, useEffect } from "react";

const Index = () => {
  const [postcode, setPostcode] = useState("");
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState("");
  const [error, setError] = useState("");
  const [collectionDays, setCollectionDays] = useState([]);
  const [loading, setLoading] = useState(false);

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
      console.log("Address API Response:", data);

      if (data?.ADDRESS?.length > 0) {
        setAddresses(data.ADDRESS);
        setCollectionDays([]);
      } else {
        setAddresses([]);
        setError("No addresses found for this postcode.");
        setCollectionDays([]);
      }
    } catch (err) {
      console.error("Error fetching addresses:", err);
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
      console.log("Fetching collection days for UPRN:", uprn);

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
      console.log("Collection Days API Response:", data);

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
        setError("");
      } else {
        setCollectionDays([]);
        setError("No collection available for your address.");
      }
    } catch (err) {
      console.error("Error fetching collection days:", err);
      setError("Failed to fetch collection days. Please try again later.");
      setCollectionDays([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (postcode.trim()) {
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

  const handleAddressSelect = (e) => {
    const selected = e.target.value;
    setSelectedAddress(selected);
    const selectedAddressObject = addresses.find(
      (address) => address.FULL_ADDRESS === selected
    );
    if (selectedAddressObject) {
      fetchCollectionDays(selectedAddressObject.UPRN);
    } else {
      setCollectionDays([]);
    }
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
        <h1 className="text-3xl font-bold">Find out your rubbish <br /> collection day </h1>
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
                Select an address
              </label>
              <select
                id="addresses"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm w-full md:w-1/4 p-2"
                value={selectedAddress}
                onChange={handleAddressSelect}
              >
                <option value="">Select an address</option>
                {addresses.map((address, index) => (
                  <option key={index} value={address.FULL_ADDRESS}>
                    {address.FULL_ADDRESS}
                  </option>
                ))}
              </select>

              <p
                className="text-blue-500 underline decoration-blue-500 mt-3 text-[13px] cursor-pointer"
                onClick={clearAddress}
              >
                Clear Address and Start Again
              </p>
            </div>

            {collectionDays.length > 0 && (
              <div className="mt-5">
                <p className="text-lg font-semibold">Your Next Collection</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {collectionDays.map((collection, index) => (
                    <div
                      key={index}
                      className="p-3 text-white text-[14px]"
                      style={{ backgroundColor: collection.binColor }}
                    >
                      <p className="font-bold">{collection.binType}</p>
                      <p className="text-sm text-gray-200">{collection.followingDay}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="border-t-2 border-t-blue-600 w-full md:w-[30%] mt-5 md:mt-0">
            <h1 className="text-black font-semibold text-[14px] mt-3">Related content</h1>
            <p className="text-[13px] underline decoration-blue-500 text-blue-500 mt-3">Add to your calendar</p>
            <p className="text-[13px] underline decoration-blue-500 text-blue-500 mt-3">Download printable schedule</p>
            <p className="text-[13px] underline decoration-blue-500 text-blue-500 mt-3">
              Join our rubbish collection notification list
            </p>

            <h1 className="text-black font-semibold text-[14px] mt-3">More Services</h1>
            <p className="text-[13px] underline decoration-blue-500 text-blue-500 mt-3">Request a replacement container</p>
            <p className="text-[13px] underline decoration-blue-500 text-blue-500 mt-3">Report a missed collection</p>
            <p className="text-[13px] underline decoration-blue-500 text-blue-500 mt-3">Book a bulky collection</p>
            <p className="text-[13px] underline decoration-blue-500 text-blue-500 mt-3">
              Request an assisted collection
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
