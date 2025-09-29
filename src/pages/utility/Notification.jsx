import React, { useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import Card from "@/components/ui/Card";
import { useNavigate } from "react-router-dom";
import Button from "@/components/ui/Button";

const SendNotificationForm = () => {
    const [title, setTitle] = useState("");
    const navigate = useNavigate();

    const user = useSelector((state) => state.auth.user);

    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSend = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await axios.post(
                `${process.env.REACT_APP_BASE_URL}/${user.type}/notification/send-notification`,
                {
                    title,
                    message,
                },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                }
            );

            alert("✅ Notification sent!");
            setTitle("");
            setMessage("");
        } catch (err) {
            console.error("Notification error:", err?.response?.data || err.message);
            alert("❌ Failed to send notification");
        } finally {
            setLoading(false);
        }
    };
    const handleCancel = () => {
        navigate("/Notification-table");
    };



    return (
        <Card title="Send Push Notification">
            <form onSubmit={handleSend} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Title
                        </label>
                        <input
                            id="title"
                            type="text"
                            placeholder="Enter notification title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Message
                        </label>
                        <textarea
                            id="message"
                            placeholder="Enter notification message"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-4 py-2 h-[120px] resize-none focus:outline-none focus:ring-2 focus:ring-primary-500"
                            required
                        />
                    </div>
                </div>

                <div className="flex justify-end space-x-3">
                    <Button
                        variant="outline"
                        type="button"
                        onClick={handleCancel}
                        className="btn btn-light text-center"
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        className="btn-dark min-w-[160px]"
                        disabled={loading}
                    >
                        {loading ? "Sending..." : "Send Notification"}
                    </Button>
                </div>
            </form>
        </Card>

    );
};

export default SendNotificationForm;
