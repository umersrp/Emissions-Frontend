import Card from '@/components/ui/Card';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';

function BookingView() {
  const [userData, setUserData] = useState(null);
  const urlParams = new URLSearchParams(window.location.search);
  const userId = urlParams.get('id');
  const user = useSelector((state) => state.auth.user);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/${user.type}/booking/get-bookings/${userId}`, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        console.log(response.data); // Check the response structure
        setUserData(response.data);
      } catch (error) {
        console.error(error);
        toast.error('Failed to fetch booking data');
      }
    };

    fetchData();
  }, [userId, user.type]);

  if (!userData) return <div className="p-6">Loading...</div>;

  const { venue, vendor, user: bookingUser, slots } = userData;

  // const totalPitchesPrice = venue?.numberOfPitches > 1 
  // ? venue.pitches.reduce((total, pitch) => total + pitch.pitchprice, 0)
  // : venue?.pitches[0]?.pitchprice || 0;

  return (
    <Card className="p-8 bg-white shadow-lg rounded-lg space-y-8">
      {/* Venue Info */}
      <div className="text-center flex flex-col items-center"> 
        <h2 className="text-3xl font-bold text-blue-600">{venue?.name}</h2>
        <img src={venue?.images?.[0]} alt="Venue" className="w-full rounded-lg mt-6 shadow-md hover:scale-105 transition-transform duration-300" />
        <p className="mt-3 text-lg text-gray-700">{venue?.address?.address}, {venue?.address?.city}</p>
      </div>

      {/* Number of Pitches */}
      <div className="mb-4">
  <h3 className="text-2xl font-semibold text-gray-800 mb-4">Number of Pitches</h3>
  <p className="text-lg text-gray-700">Total Pitches: {userData.pitchNames?.length || 0}</p>


  <ul className="list-disc list-inside text-lg text-gray-700 mt-2">
    {userData.pitchNames?.map((name, index) => (
      <li key={index}>{name}</li>
    ))}
  </ul>
</div>
<p className="text-lg text-gray-700 mb-3">Total Price: <b>Rs </b>{userData.totalPitchPrice}</p>
<p className="text-lg text-gray-700 mb-3">
  Booking Days: {userData?.slotDays?.map(date => new Date(date).toLocaleDateString()).join(', ')}
</p>





      {/* Slots Info */}
      <div className='mb-4'>
        <h3 className="text-2xl font-semibold text-gray-800 mb-4">Booked Slots</h3>
        {slots && slots.length > 0 ? (
          <ul className="list-disc list-inside space-y-3 text-lg text-gray-700">
            {slots.map((slot, index) => (
              <li key={index} className="flex items-center">
                <span className="text-xl text-gray-600 mr-2">⏰</span>
                <span>{slot.time}</span>
                {slot.isBooked && (
                  <span className="text-green-500 ml-2">(Booked)</span>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-red-500 text-lg">No slots available.</p>
        )}
      </div>

      {/* Total Price */}
      {/* <div>
    <h3 className="text-2xl font-semibold text-gray-800 mb-4">Total Price for Pitches</h3>
    <p className="text-lg text-gray-700">
      Total Pitches Price: Rs {totalPitchesPrice}
    </p>
  </div> */}
      {/* Vendor Info */}
      <div className="border-t pt-6 mt-6">
        <h3 className="text-2xl font-semibold text-gray-800 mb-2">Vendor Details</h3>
        <div className="space-y-2 text-lg text-gray-700">
          <p><strong>Name:</strong> {vendor?.name}</p>
          <p><strong>Email:</strong> {vendor?.email}</p>
          <p><strong>Phone:</strong> {vendor?.phone}</p>
        </div>
      </div>

      {/* User Info */}
      <div className="border-t pt-6 mt-6">
        <h3 className="text-2xl font-semibold text-gray-800 mb-2">Booked By</h3>
        <div className="space-y-2 text-lg text-gray-700">
          <p><strong>Name:</strong> {bookingUser?.name}</p>
          <p><strong>Email:</strong> {bookingUser?.email}</p>
          <p><strong>Phone:</strong> {bookingUser?.phone}</p>
        </div>
      </div>
    </Card>
  );
}

export default BookingView;
