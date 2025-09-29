import Card from '@/components/ui/Card';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';

function Venueview() {
  const [userData, setUserData] = useState(null);
  const urlParams = new URLSearchParams(window.location.search);
  const userId = urlParams.get('id');
  const user = useSelector((state) => state.auth.user);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_BASE_URL}/${user.type}/venue/get-venues/${userId}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setUserData(response.data);
      } catch (error) {
        console.error(error);
        toast.error("Failed to fetch venue details");
      }
    };

    fetchData();
  }, [userId]);

  if (!userData) return <p>Loading...</p>;

  return (
    <Card>
      <div className="container-xl px-4 mt-4">
        <div className="card mb-4">
          <div className="card-header">Venue Details</div>
          <div className="card-body">
            <div className="mb-3">
              <label className="small mb-1">Venue Name</label>
              <p className="form-control py-2">{userData?.name}</p>
            </div>

            <div className="row gx-3 mb-3">
              <div className="col-md-6">
                <label className="small mb-1">Location</label>
                <p className="form-control py-2">{userData?.location}</p>
              </div>
              <div className="col-md-6">
                <label className="small mb-1">Status</label>
                <p className="form-control py-2">{userData?.status}</p>
              </div>
            </div>

            <div className="mb-3">
              <label className="small mb-1">Address</label>
              <p className="form-control py-2">
                {userData?.address?.address}, {userData?.address?.city}
              </p>
            </div>

            <div className="row gx-3 mb-3">
              <div className="col-md-6">
                <label className="small mb-1">Capacity</label>
                <p className="form-control py-2">{userData?.capacity}</p>
              </div>
              <div className="col-md-6">
                <label className="small mb-1">Price</label>
                <p className="form-control py-2">{userData?.price}</p>
              </div>
            </div>

            <div className="mb-3">
              <label className="small mb-1">Sports</label>
              <p className="form-control py-2">
                {userData?.sports?.map((sport) => sport.name).join(", ")}
              </p>
            </div>

            <div className="mb-3">
              <label className="small mb-1">Timings</label>
              <p className="form-control py-2">{userData?.timings?.join(", ")}</p>
            </div>

            <div className="mb-3">
              <label className="small mb-1">Available Days</label>
              <p className="form-control py-2">{userData?.days?.join(", ")}</p>
            </div>

            <div className="mb-3">
              <label className="small mb-1">Amenities</label>
              <p className="form-control py-2">
                {userData?.amenities?.map((a) => a.name).join(", ")}
              </p>
            </div>

            <div className="mb-3">
              <label className="small mb-1">Number of Pitches</label>
              <p className="form-control py-2">{userData?.numberOfPitches}</p>
            </div>

            <div className="mb-3">
              <label className="small mb-1">Pitches</label>
              {userData?.pitches?.map((pitch, index) => (
                <div key={index} className="border rounded p-2 mb-2">
                  <strong>{pitch.pitchName}</strong><br />
                  <span>Price: {pitch.pitchprice}</span><br />
                  <span>Size: {pitch.size}</span><br />
                  <span>Sport Types: {pitch.sportType?.map((type) => type.name).join(", ")}</span>

                </div>
              ))}
            </div>

            <div className="mb-3">
              <label className="small mb-1">Images</label>
              <div className="d-flex gap-2 flex-wrap">
                {userData?.images?.map((img, index) => (
                  <img key={index} src={img} alt="Venue" style={{ width: "120px", height: "80px", objectFit: "cover" }} />
                ))}
              </div>
            </div>

            <div className="mb-3">
              <label className="small mb-1">Vendor Info</label>
              <p className="form-control py-2">
                {userData?.vendorId?.name} ({userData?.vendorId?.email})
              </p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
export default Venueview;
