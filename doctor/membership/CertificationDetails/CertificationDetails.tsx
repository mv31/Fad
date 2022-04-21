import { Paper, Typography, useTheme } from "@mui/material";
import { makeStyles } from "@mui/styles";
import React from "react";
import { gql } from "@apollo/client";
import { Certifications } from "./Certifications";
import { Licenses1 } from "./Licenses";
import { GetUpdateStatus } from "../GetUpdateStatus";
import * as GoGQL from "@gogocode-package/graphql_code_generator";
import { PENDING_STATUS_TEXT } from "@src/../../Constants";

export const FETCH_CERTIFICATION_DETAILS = gql`
  query view_doctor_membership_info($includes: [ViewDoctorIncludesEnum!]!) {
    view_doctor_membership_info(includes: $includes) {
      ProviderCertifications {
        id
        name
        general
        general_year_certified
        sub_specialty
        sub_specialty_year_certified
      }
    }
  }
`;

export const CertificationDetails = () => {
  const theme = useTheme();
  const styles = useStyles();
  return (
    <div style={{ justifyContent: "center", width: "92%" }}>
      <Paper className={styles.paper}>
        <div style={{ display: "flex", alignItems: "center" }}>
          <Typography variant="h5" color={theme.palette.primary.main} style={{ margin: "1%" }}>
            Board Certification
          </Typography>
          <GetUpdateStatus
            pendingStatusText={PENDING_STATUS_TEXT}
            section={GoGQL.ViewDoctorIncludesEnum.Certifications}
          />
        </div>
        <Certifications />
      </Paper>
      <Paper className={styles.paper}>
        <div style={{ display: "flex", alignItems: "center" }}>
          <Typography variant="h5" color={theme.palette.primary.main} style={{ margin: "1%" }}>
            Medical Licenses
          </Typography>
          <GetUpdateStatus pendingStatusText={PENDING_STATUS_TEXT} section={GoGQL.ViewDoctorIncludesEnum.License} />
        </div>
        <Licenses1 />
      </Paper>
    </div>
  );
};

const useStyles = makeStyles({
  paper: {
    // elevation: 2,
    justifySelf: "center",
    margin: "5%",
    width: "100%",
    borderRadius: 5,
    border: "1px solid #E0E0E0",
  },
});

export default CertificationDetails;
