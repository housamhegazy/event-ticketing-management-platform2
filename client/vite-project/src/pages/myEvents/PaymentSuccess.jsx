import { useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useBookEventMutation } from "../../Redux/events/createEventApi";
import { useGetUserByNameQuery } from "../../Redux/user/userApi";
import Swal from "sweetalert2";

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  //payment id to send it to backend to use it whene cancel booking 
  const eventId = searchParams.get("eventId");
  const sessionId = searchParams.get("session_id"); // تأكد إنك عدلت success_url في الباك إند ليحتوي على {CHECKOUT_SESSION_ID}
  const navigate = useNavigate();
  const [bookEvent] = useBookEventMutation();
  const { refetch: refetchUser } = useGetUserByNameQuery(undefined);


  // useRef عشان نضمن إن الطلب ميبعتش مرتين ورا بعض بسبب الـ StrictMode
  const hasCalled = useRef(false);

  useEffect(() => {
    if (eventId && !hasCalled.current) {
      hasCalled.current = true; // علامة إننا بدأنا العملية

      const processBooking = async () => {
        try {
          // 1. تنفيذ الحجز
          await bookEvent({eventId,sessionId}).unwrap();
          console.log("payment id ",sessionId);
          
          // 2. تحديث بيانات المستخدم فوراً عشان الزرار يتغير
          await refetchUser();

          // 3. رسالة النجاح
          Swal.fire({
            title: "Success!",
            text: "Your ticket has been booked successfully!",
            icon: "success",
            confirmButtonText: "Go to My Ticket",
            confirmButtonColor: "#28a745",
          }).then(() => {
            navigate(`/ticket/${eventId}`);
          });

        } catch (err) {
          // لو الخطأ سببه إن الحجز موجود أصلاً (المستخدم عمل ريفريش)
          if (err.status === 400 || err.data?.message?.includes("already booked")) {
            navigate(`/ticket/${eventId}`);
          } else {
            console.error("Booking verification failed:", err);
            Swal.fire({
              title: "Note",
              text: "Booking is being processed. Please check your tickets page.",
              icon: "info",
              confirmButtonText: "Check My Bookings"
            }).then(() => {
              navigate("/my-booked-events");
            });
          }
        }
      };

      processBooking();
    }
  }, [eventId, bookEvent, navigate, refetchUser,sessionId]);

  return (
    <div className="container text-center" style={{ marginTop: "100px" }}>
      <div className="card shadow-sm p-5 border-0 rounded-4">
        <div className="spinner-border text-success mb-4" style={{ width: "3rem", height: "3rem" }}></div>
        <h2 className="fw-bold">Confirming Your Booking...</h2>
        <p className="text-muted">Please don't close this window, we are finalizing your ticket.</p>
      </div>
    </div>
  );
};

export default PaymentSuccess;