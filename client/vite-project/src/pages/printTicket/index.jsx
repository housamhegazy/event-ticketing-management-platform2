import React, { useRef } from "react";
import { useParams } from "react-router-dom";
import { useGetEventDetailsForTicketQuery } from "../../Redux/events/createEventApi.js";
import { useReactToPrint } from "react-to-print";
import { QRCodeSVG } from "qrcode.react"; // استيراد المكون

const Ticket = () => {
  const { id } = useParams();
  const { data: event, isLoading } = useGetEventDetailsForTicketQuery(id);
  const ticketRef = useRef(null);

  const handlePrint = useReactToPrint({
    contentRef: ticketRef,
    documentTitle: `Ticket-${event?.title || 'Event'}`,
  });

  if (isLoading) return <div className="text-center mt-5">Loading Ticket...</div>;
  if (!event) return <div className="text-center mt-5 text-danger">Event not found!</div>;

  // هنا بنحدد البيانات اللي الـ QR Code هيشيلها
  // يفضل يكون رابط لصفحة التأكيد أو الـ ID الخاص بالتذكرة
  const qrValue = event._id;
  // const qrValue = `https://yourdomain.com/verify-ticket/${event._id}`;

  return (
    <div className="container mt-5 text-center">
      <div ref={ticketRef} className="p-4 mx-auto" style={{ maxWidth: "700px" }}>
        <div className="card border-0 shadow-lg rounded-4 overflow-hidden" 
             style={{ background: "#ffffff", borderLeft: "10px solid #198754", textAlign: "left" }}>
          <div className="row g-0">
            <div className="col-8 p-4">
              <h2 className="fw-bold text-success mb-1">EVENT TICKET</h2>
              <p className="text-muted small">Official Entry Pass</p>
              
              <h3 className="mt-4 fw-bold">{event?.title}</h3>
              <div className="mt-3">
                <p className="mb-1"><strong>Date:</strong> {new Date(event?.date).toLocaleDateString()}</p>
                <p className="mb-1"><strong>Location:</strong> {event?.location}</p>
                <p className="mb-1"><strong>Category:</strong> {event?.category}</p>
                <p className="mb-1"><strong>Organizer:</strong> {event?.organizer?.username || 'N/A'}</p>
                <p className="mb-1"><strong>Price:</strong> {event?.price > 0 ? `$${event.price}` : "Free"}</p>
              </div>
            </div>

            <div className="col-4 bg-light d-flex flex-column align-items-center justify-content-center border-start border-2 border-dashed">
              {event?.image && (
                <img 
                  src={event.image} 
                  alt="Event" 
                  className="img-fluid rounded-3 mb-3" 
                  style={{ width: "120px", height: "120px", objectFit: "cover" }}
                />
              )}

              {/* توليد الـ QR Code هنا */}
              <div className="p-2 bg-white border rounded-3">
                <QRCodeSVG 
                  value={qrValue} 
                  size={120} // التحكم في الحجم
                  level={"H"} // درجة الدقة (عشان لو الورقة اتكرمشت يفضل يقرأ)
                  includeMargin={true}
                />
              </div>
              
              <p className="small text-muted mt-2 mb-0" style={{ fontSize: "10px" }}>
                SCAN TO VERIFY
              </p>
              <p className="fw-bold text-dark" style={{ fontSize: "12px" }}>
                ID: {event?._id?.slice(-6).toUpperCase()}
              </p>
            </div>
          </div>
          <div className="w-100 border-top border-dashed py-2" style={{ borderColor: "#ccc" }}></div>
        </div>
      </div>

      <div className="mt-4 no-print">
        <button 
          onClick={() => handlePrint()} 
          className="btn btn-success px-5 py-2 rounded-pill fw-bold shadow"
        >
          <i className="bi bi-printer me-2"></i> Print or Save as PDF
        </button>
        {/* back button */}
        <button 
          onClick={() => window.history.back()} 
          className="btn btn-secondary px-4 py-2 rounded-pill fw-bold shadow ms-3"
        >
          <i className="bi bi-arrow-left me-2"></i> Back
        </button>
      </div>
    </div>
  );
};

export default Ticket;