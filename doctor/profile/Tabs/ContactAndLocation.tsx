import { Grid, Paper, Typography, useTheme } from "@mui/material";
import { DoctorLocationMap } from "@src/components/DoctorLocationMap";
import React from "react";

interface DoctorProfileProps {
  npi: any;
}

const ContactAndLocation = ({ npi }: DoctorProfileProps) => {
  const theme = useTheme();
  return (
    <>
      <Paper
        elevation={0}
        style={{
          border: `2px solid ${theme.palette.primary.main}`,
          padding: 0,
          margin: 0,
          width: "100%",
        }}
      >
        <Typography ml={3} mt={3} mb={1} variant="h4" style={{ fontWeight: 500 }} color="primary">
          Contact
        </Typography>
        <Grid mb={2} style={{ paddingLeft: 25, fontSize: 18, justifyContent: "center" }}>
          <Typography mt={2} style={{ fontSize: 18 }}>
            <span style={{ color: theme.palette.primary.main }}> Website :</span> &nbsp;&nbsp;&nbsp;{" "}
            {npi?.website || "-"}
          </Typography>
          <Typography mt={2} mb={2} style={{ fontSize: 18 }}>
            <span style={{ color: theme.palette.primary.main }}> Phone No:</span> &nbsp;&nbsp; {npi?.phone_no || "-"}
          </Typography>
        </Grid>
      </Paper>
      <Paper
        elevation={0}
        style={{
          border: `2px solid ${theme.palette.primary.main}`,
          padding: 0,
          margin: 0,
          width: "100%",
        }}
      >
        <Typography ml={3} mt={3} mb={1} variant="h4" style={{ fontWeight: 500 }} color="primary">
          Address
        </Typography>
        <Grid mb={2} style={{ paddingLeft: 25, fontSize: 18, justifyContent: "center" }}>
          {npi?.addresses &&
            npi?.addresses?.map((address, i) => {
              return (
                <Typography mt={2} style={{ fontSize: 18 }} key={i}>
                  {address}
                </Typography>
              );
            })}
        </Grid>
      </Paper>
      <Paper
        elevation={0}
        style={{
          border: `2px solid ${theme.palette.primary.main}`,
          padding: 0,
          paddingLeft: 30,
          paddingRight: 30,
          margin: 0,
          width: "100%",
        }}
      >
        <Typography mt={3} mb={1} variant="h4" style={{ fontWeight: 500 }} color="primary">
          Map View
        </Typography>
        <DoctorLocationMap location={npi?.geoLocation} />
      </Paper>
    </>
  );
};

export default ContactAndLocation;
