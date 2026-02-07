// Need to use the React-specific entry point to import createApi
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// @ts-ignore
const allowedBaseUrls = import.meta.env.VITE_API_URL;
// Define a service using a base URL and expected endpoints
export const createPaymentApi = createApi({
  reducerPath: "createPaymentApi",
  tagTypes: ["Payment"],
  baseQuery: fetchBaseQuery({
    baseUrl: allowedBaseUrls,
    credentials: "include",
  }),

  endpoints: (builder) => ({
    // start payment 
    createCheckoutSession: builder.mutation({
      query: (eventData) => ({
        url: "/api/payment/create-checkout-session",
        method: "POST",
        body: {event:eventData}
      }),
      invalidatesTags: ["Payment"],
    }),
  }),
});
export const {
  useCreateCheckoutSessionMutation,
} = createPaymentApi;
