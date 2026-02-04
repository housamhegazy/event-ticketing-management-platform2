// Need to use the React-specific entry point to import createApi
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// @ts-ignore
const allowedBaseUrls = import.meta.env.VITE_API_URL;
// Define a service using a base URL and expected endpoints
export const userApi = createApi({
  reducerPath: "userApi",
  tagTypes: ["User"],
  baseQuery: fetchBaseQuery({
    baseUrl: allowedBaseUrls,
    credentials: "include",
  }),
  endpoints: (builder) => ({
    getUserByName: builder.query({
      query: () => `/api/users/profile`,
      providesTags: ["User"],
    }),
    // ✅ Sign up new user
    signup: builder.mutation({
      query: (body) => ({
        url: "/api/users/register",
        method: "POST",
        body,
      }),
      invalidatesTags: ["User"],
    }),

    // ✅ Sign in existing user
    signin: builder.mutation({
      query: (body) => ({
        url: "/api/users/login",
        method: "POST",
        body,
      }),
      invalidatesTags: ["User"],
    }),
    //signout
    signOut: builder.mutation({
      query: () => ({
        url: "/api/users/logout",
        method: "POST",
      }),
      invalidatesTags: ["User"],
    }),
    //get all organizers and users who registered in the platform for admin
    getAllUsers: builder.query({
      query: () => ({
        url: "/api/users/all-users",
        method: "GET",
      }),
      providesTags: ["User"],
    }),
    //delete user by id (for admin)
    deleteUser: builder.mutation({
      query: (id) => ({
        url: `/api/users/delete-user/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["User"],
    }),
    //update user role by id (for admin)
    updateUser: builder.mutation({
      query: ({ id, role }) => ({
        url: `/api/users/update-user/${id}`,
        method: "PUT",
        body: { role },
      }),
      invalidatesTags: ["User"],
    }),
    //edit user profile
    editProfile: builder.mutation({
      query: (body) => ({
        url: "/api/users/edit-profile",
        method: "PUT",
        body,
      }),
      invalidatesTags: ["User"],
    }),
    //delete user profile
    deleteUserProfile: builder.mutation({
      query: () => ({
        url: `/api/users/delete-profile`,
        method: "DELETE",
      }),
      invalidatesTags: ["User"],
    }),
  }),
});
// Export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints
export const {
  useGetUserByNameQuery,
  useSignOutMutation,
  useSignupMutation,
  useSigninMutation,
  useGetAllUsersQuery,
  useDeleteUserMutation,
  useUpdateUserMutation,
  useEditProfileMutation,
  useDeleteUserProfileMutation,
} = userApi;
