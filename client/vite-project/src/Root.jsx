import { Box, Grid } from "@mui/material";
import { Outlet } from "react-router";
import Navebar from "./components/navebar";
import { useSelector } from "react-redux";
import LoadingPage from "./pages/loadingPage";
import { useGetUserByNameQuery } from "./Redux/user/userApi";
const Root = () => {
  // =================== loading state from redux ===================
  const { isLoadingAuth } = useSelector((state) => state.auth);
  const { isLoading: userLoading } = useGetUserByNameQuery();
  // loading whene userloading
  if (isLoadingAuth || userLoading) {
    return <LoadingPage />;
  }
  // ================================================================================================================

  return (
    <Box
      className="root"
      sx={{
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#e9f0e8",
      }}
    >
      {/* <ScrollToTop /> */}
      <Box
        sx={{
          width: "100%",
          maxWidth: `${1500}px`,
          // height: "64px",
          margin: "0 auto",
          position: "sticky",
          top: "0",
          zIndex: "1000",
        }}
      >
        <Navebar />
      </Box>
      {/* عشان خاصية ال ستيكي تشتغل لازم يكون ارتفاع الكونتينر اكبر من ارتفاع البوكس الداخلي */}
      <Grid
        container
        spacing={0}
        sx={{
          width: "100%",
          maxWidth: `${1500}px`,
          margin: "0 auto",
          minHeight: `calc(100vh - 64px)`,
          flexWrap: "nowrap",
          alignItems: "stretch",
        }}
      >
        {/* <Grid
          size={{ xs: 0, sm: 2, md: 3 }}
          sx={{
            // border: "1px solid",
            // borderColor: "divider",
            flexShrink: 0,
            position: "sticky",
            top: "64px",
            height: "100vh",
            // backgroundColor: theme.palette.background.default,
          }}
        >
          
        </Grid> */}

        <Grid
          size={{ xs: 12, sm: 12, md: 12 }}
          sx={{
            display: "flex",
            flexDirection: "column",
            // backgroundColor: theme.palette.background.default,
            borderRight: "1px solid",
            borderLeft: "1px solid",
            borderColor: "divider",
            flexGrow: 1,
            minHeight: "calc(100vh - 64px)",
          }}
        >
          <Outlet />
        </Grid>
        {/* <Grid
          size={{ xs: 0, sm: 0, md: 3 }}
          sx={{
            position: "sticky",
            top: "64px",
            height: "100vh",
            // backgroundColor: theme.palette.background.default,
          }}
        >
          sidebar
        </Grid> */}
      </Grid>
      {/* <Footer /> */}
    </Box>
  );
};

export default Root;
