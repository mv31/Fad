import { Paper, Typography, IconButton, useTheme, Theme } from "@mui/material";
import { makeStyles } from "@mui/styles";
import { UIHeader } from "@src/../../packages/ui/src";
import { getGenderName } from "@src/utils";
import React from "react";
import * as GoGQL from "@gogocode-package/graphql_code_generator";
import { gql } from "@apollo/client";
import Info from "@src/components/Documentation/Info";
import { DashboardRoutes } from "@src/routes/DashboardRoutes";

const textColor = "rgba(115, 115, 115, 1)";

export const FETCH_DOCTOR_MEMBERSHIP_INFO = gql`
  query view_doctor_membership_info($includes: [ViewDoctorIncludesEnum!]!) {
    view_doctor_membership_info(includes: $includes) {
      User {
        first_name
        last_name
        middle_name
        gender
        email
      }
      npi
    }
  }
`;

export const ProfileDetails = () => {
  const styles = useStyles();
  const theme = useTheme();
  const response = GoGQL.useView_Doctor_Membership_InfoQuery(FETCH_DOCTOR_MEMBERSHIP_INFO, {
    variables: {
      includes: [GoGQL.ViewDoctorIncludesEnum.User],
    },
    fetchPolicy: "cache-and-network",
  });
  return (
    <Paper style={{ display: "flex", padding: "3% ", margin: "3% 0", borderRadius: 5, border: "1px solid #E0E0E0" }}>
      <div style={{ flexBasis: "100%" }}>
        <div style={{ display: "flex" }}>
          <UIHeader text={"Profile Details"} color={theme.palette.primary.main} />
          <Info link={DashboardRoutes.doctorProfile} />
        </div>
        <div style={{ display: "flex", flexWrap: "wrap" }}>
          <>
            <div style={{ flexBasis: "40%", padding: "10px 0", minWidth: "150px" }}>
              <Typography fontWeight="bold" color={textColor}>
                First Name
              </Typography>
              <Typography color={textColor}>{response?.data?.view_doctor_membership_info?.User?.first_name}</Typography>
            </div>
            <div style={{ flexBasis: "40%", padding: "10px 0", minWidth: "150px" }}>
              <Typography fontWeight="bold" color={textColor}>
                Middle Name
              </Typography>
              <Typography color={textColor}>
                {response?.data?.view_doctor_membership_info?.User?.middle_name}
              </Typography>
            </div>
            <div style={{ flexBasis: "40%", padding: "10px 0", minWidth: "150px" }}>
              <Typography fontWeight="bold" color={textColor}>
                Last Name
              </Typography>
              <Typography color={textColor}>{response?.data?.view_doctor_membership_info?.User?.last_name}</Typography>
            </div>
            <div style={{ flexBasis: "40%", padding: "10px 0", minWidth: "150px" }}>
              <Typography fontWeight="bold" color={textColor}>
                Gender
              </Typography>
              <Typography color={textColor}>
                {getGenderName(response?.data?.view_doctor_membership_info?.User?.gender)}
              </Typography>
            </div>
            <div style={{ flexBasis: "40%", padding: "10px 0", minWidth: "150px" }}>
              <Typography fontWeight="bold" color={textColor}>
                NPI
              </Typography>
              <Typography color={textColor}>{response?.data?.view_doctor_membership_info?.npi}</Typography>
            </div>
            <div style={{ flexBasis: "40%", padding: "10px 0", minWidth: "150px" }}>
              <Typography fontWeight="bold" color={textColor}>
                Email
              </Typography>
              <Typography color={textColor}>
                {response?.data?.view_doctor_membership_info?.User?.email || "-"}
              </Typography>
            </div>
          </>
        </div>
      </div>
    </Paper>
  );
};

const useStyles = makeStyles((theme: Theme) => ({
  iconDiv: {
    margin: "1%",
    display: "flex",
    justifyContent: "center",
    justifySelf: "center",
    alignSelf: "center",
    alignItems: "center",
    borderRadius: 50,
    width: 40,
    height: 40,
    cursor: "pointer",
    color: theme.palette.primary.main,
  },
  addIcon: {
    margin: "1%",
    width: 40,
    height: 40,
  },
}));
