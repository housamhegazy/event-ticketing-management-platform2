// Need to use the React-specific entry point to import createApi
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// @ts-ignore
const allowedBaseUrls = import.meta.env.VITE_API_URL;
// Define a service using a base URL and expected endpoints
export const createEventApi = createApi({
  reducerPath: "createEventApi",
  tagTypes: ["Event"],
  baseQuery: fetchBaseQuery({
    baseUrl: allowedBaseUrls,
    credentials: "include",
  }),

  endpoints: (builder) => ({
    // ✅ create new event
    createEvent: builder.mutation({
      query: (body) => ({
        url: "/api/events/create-event",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Event"],
    }),
    // get organizer events
    getOrganizerEvents: builder.query({
      query: () => ({
        url: "/api/events/my-events",
        method: "GET",
      }),
      providesTags: ["Event"],
    }),
    //get event by id
    getEventById: builder.query({
      query: (id) => ({
        url: `/api/events/event/${id}`,
        method: "GET",
      }),
        providesTags: (result, error, id) => [{ type: "Event", id }],
    }),
    //delete event
    deleteEvent: builder.mutation({
      query: (id) => ({
        url: `/api/events/delete-event/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Event"],
    }),
    //get all events
    getAllEvents: builder.query({
      query: () => ({
        url: "/api/events/all-events",
        method: "GET",
      }),
      providesTags: ["Event"],
    }),
    //search events by title and category
    searchEvents: builder.query({
      query: ({ title, category }) => ({
        url: `/api/events/search?title=${title}&category=${category}`,
        method: "GET",
      }),
      providesTags: ["Event"],
    }),
    updateEvent: builder.mutation({
      query: ({ id, data }) => ({
        url: `/api/events/update-event/${id}`, // تأكد من المسار في الباك إند
        method: "PUT",
        body: data,
        formData: true,
      }),
      invalidatesTags: ["Event"],
    }),
    //book event
    bookEvent: builder.mutation({
      query: ({eventId,sessionId}) => ({
        url: `/api/events/book-event/${eventId}`,
        method: "POST",
        body:{sessionId}
      }),
        invalidatesTags: (result, error, eventId) => [{ type: "Event", eventId }],
    }),
    //cancel booking
    cancelBooking: builder.mutation({
      query: (id) => ({
        url: `/api/events/cancel-booking/${id}`,
        method: "POST",
      }),
        invalidatesTags: (result, error, id) => [{ type: "Event", id }],

    }),
    //get booked events for user
    getBookedEvents: builder.query({
      query: () => ({
        url: "/api/events/my-booked-events",
        method: "GET",
      }),
      providesTags: ["Event"],
    }),
    //get event details by id to create ticket
    getEventDetailsForTicket: builder.query({
      query: (id) => ({
        url: `/api/events/booked-event/${id}`,
        method: "GET",
      }),
      providesTags: ["Event"],
    }),
    //view members who booked the event (for admin and organizer)
    getEventAttendees: builder.query({
      query: (id) => ({
        url: `/api/events/event-bookings/${id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: "Event", id }],
    }),
    //delete attendee from event (for admin)
    deleteAttendee: builder.mutation({
      query: ({ eventId, userId }) => ({
        url: `/api/events/delete-attendee/${userId}/${eventId}`,
        method: "DELETE",
        body: { eventId, userId },
      }),
      invalidatesTags: (result, error, { eventId }) => [{ type: "Event", id: eventId }],
    }),
  }),
});
export const {
  useCreateEventMutation,
  useGetOrganizerEventsQuery,
  useDeleteEventMutation,
  useGetEventByIdQuery,
  useGetAllEventsQuery,
  useSearchEventsQuery,
  useUpdateEventMutation,
  useBookEventMutation,
  useCancelBookingMutation,
  useGetBookedEventsQuery,
  useGetEventDetailsForTicketQuery,
  useGetEventAttendeesQuery,
  useDeleteAttendeeMutation,
} = createEventApi;
