import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Card from '@/components/ui/Card';
import Icon from "@/components/ui/Icon";
import Button from '@/components/ui/Button';
import { useSelector } from 'react-redux';
import { toast } from "react-toastify"; // Import toast
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCancel, faCheck, faEye } from '@fortawesome/free-solid-svg-icons';
import { set } from 'react-hook-form';


function BookingCard() {
  const [bookings, setBookings] = useState([]);
  const [deletingBookingId, setDeletingBookingId] = useState(null);
  const navigate = useNavigate();

  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, hasNextPage: false });
  const user = useSelector((state) => state.auth.user);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/${user.type}/booking/get-bookings`, {
          params: { page, limit: pagination.limit },
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        setBookings(response.data.bookings);
        setPagination(response.data.pagination);
      } catch (error) {
        console.error("Error fetching bookings:", error);
      }
    };

    fetchBookings();
  }, [page]);

  // Function to update booking status

  const handleChangeStatus = async (id, newStatus) => {
    try {
      const response = await axios.put(
        `${process.env.REACT_APP_BASE_URL}/${user.type}/booking/booking-status/${id}`,
        { status: newStatus },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.status === 200) {
        // Update the state immediately
        setBookings((prevBookings) =>
          prevBookings.map((booking) =>
            booking._id === id ? { ...booking, status: newStatus } : booking
          )
        );

        // Show success toast
        toast.success(`Booking status updated to ${newStatus}!`);
      } else {
        console.error("Failed to update booking status");
        toast.error("Failed to update booking status");
      }
    } catch (error) {
      console.error("Error updating booking status:", error);
      toast.error("Error updating booking status. Please try again.");
    }
  };
  const handleDelete = async (id) => {
    try {
      setDeletingBookingId(id); // Show loading spinner only on this button
  
      await axios.delete(`${process.env.REACT_APP_BASE_URL}/${user.type}/booking/delete-booking/${id}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
  
      toast.success("Booking rejected successfully");
  
      // ✨ Update bookings list locally
      setBookings((prev) => prev.filter((booking) => booking._id !== id));
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete booking");
    } finally {
      setDeletingBookingId(null);
      reactRefresh(); // Reset loading state

    }
  };
  
  


  return (
    <Card>
      <div className='flex justify-between mb-4 border p-4 bg-gradient-to-r from-[#304352] to-[#d7d2cc] dark:bg-slate-800 rounded-md'>
        <h6 className="flex-1 text-white">Booking Listing</h6>
      </div>

      <Card>
        <div className="container mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {bookings.map((booking) => (
              <div key={booking?._id} className="relative bg-white rounded-lg shadow-md overflow-hidden">
                {/* Status Badge (Updated Dynamically) */}
                <div className={`absolute top-2 left-2 text-white text-xs font-bold px-2 py-1 rounded flex items-center
                    ${booking.status === 'approved' ? 'bg-green-500' : booking.status === 'rejected' ? 'bg-red-500' : 'bg-yellow-500'}`}>
                  <Icon type="check-circle" className="h-4 w-4 mr-1" />
                  <span>{booking.status}</span>
                </div>

                {/* Venue Image */}
                <img
                  src={booking?.venue?.images?.[0] || "https://via.placeholder.com/150"}
                  alt="Venue"
                  className="w-full h-64 object-cover"
                />

                {/* Booking Details */}
                <div className="p-4">
                  <h3 className="text-lg font-semibold">{booking?.venue?.name || 'Venue Name Unavailable'}</h3>
                  <p className="text-sm text-blue-500">
                    {booking?.venue?.address?.address || 'Address Unavailable'}, {booking?.venue?.address?.city || ''}
                  </p>
                  <p className="text-sm text-gray-600"><b>Vendor:</b> {booking?.vendor?.name || 'Vendor Unavailable'}</p>
                  <p className="text-sm text-gray-600"><b>Phone:</b> {booking?.vendor?.phone || 'Phone Unavailable'}</p>
                  <p className="text-sm text-gray-600"><b>User:</b> {booking?.user?.email || 'N/A'}</p>
                  <p className="text-sm text-gray-600"><b>Booking Created:</b> {booking?.date ? new Date(booking.date).toLocaleDateString() : 'Date Unavailable'}</p>

                  {/* Approve & Reject Buttons */}
                  <div className="mt-4 flex space-x-2">
                    <button
                      onClick={() => handleChangeStatus(booking._id, "approved")}
                      className={`px-4 py-2 rounded text-white ${booking.status === "approved" ? "bg-green-300 cursor-not-allowed" : "bg-green-500 hover:bg-green-600"}`}
                      disabled={booking.status === "approved"}
                    >
                      <FontAwesomeIcon icon={faCheck} className="mr-2 text-white" />
                    </button>
                    <button
                      onClick={() => handleDelete(booking._id)}
                      className={`px-4 py-2 rounded text-white flex items-center justify-center ${booking.status === "rejected"
                          ? "bg-red-300 cursor-not-allowed"
                          : "bg-red-500 hover:bg-red-600"
                        }`}
                      disabled={booking.status !== "pending" || deletingBookingId === booking._id}
                    >
                      {deletingBookingId === booking._id ? (
                        <span className="animate-pulse">Deleting...</span>
                      ) : (
                        <>
                          <FontAwesomeIcon icon={faCancel} className="mr-2 text-white" />
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => navigate(`/booking-view?id=${booking._id}`)}
                      className="px-4 py-2  rounded text-white bg-blue-500 hover:bg-blue-600"
                    >
                      <FontAwesomeIcon icon={faEye} className="mr-2 text-white" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Controls */}
          <div className="flex justify-between items-center mt-6">
            <button
              onClick={() => setPage(prev => prev - 1)}
              disabled={page === 1}
              className={`px-4 py-2 rounded ${page === 1 ? 'bg-gray-300 cursor-not-allowed' : 'bg-black text-white hover:bg-blue-600'}`}
            >
              Previous
            </button>
            <span className="text-sm">
              Page {pagination?.page} of {Math.ceil(pagination?.total / pagination?.limit)}
            </span>
            <button
              onClick={() => setPage(prev => prev + 1)}
              disabled={!pagination?.hasNextPage}
              className={`px-4 py-2 rounded ${!pagination?.hasNextPage ? 'bg-gray-300 cursor-not-allowed' : 'bg-black text-white hover:bg-blue-600'}`}
            >
              Next
            </button>
          </div>
        </div>
      </Card>
    </Card>
  );
}

export default BookingCard;
