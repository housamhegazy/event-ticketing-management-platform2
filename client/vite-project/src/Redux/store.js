import { configureStore } from "@reduxjs/toolkit";
// Or from '@reduxjs/toolkit/query/react'
import { setupListeners } from "@reduxjs/toolkit/query";
import authReducer from "./user/authSlice"; // <--- استيراد authReducer
import { userApi } from "./user/userApi";
import { createEventApi } from "./events/createEventApi";
import {createPaymentApi} from "./events/payment"
export const store = configureStore({
  reducer: {
    // Add the generated reducer as a specific top-level slice
    [userApi.reducerPath]: userApi.reducer,
    [createEventApi.reducerPath]: createEventApi.reducer,
    [createPaymentApi.reducerPath]:createPaymentApi.reducer,
    auth: authReducer, //خاصه بحالة المستخدم
    // theme: themeReducer, // theme
  },
  // Adding the api middleware enables caching, invalidation, polling,
  // and other useful features of `rtk-query`.
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(userApi.middleware)
      .concat(createEventApi.middleware)
      .concat(createPaymentApi.middleware),
});

// optional, but required for refetchOnFocus/refetchOnReconnect behaviors
// see `setupListeners` docs - takes an optional callback as the 2nd arg for customization
setupListeners(store.dispatch);