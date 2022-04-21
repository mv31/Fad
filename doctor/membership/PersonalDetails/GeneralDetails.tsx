import { Paper, Typography, IconButton, useTheme } from "@mui/material";
import { UIHeader } from "@src/../../packages/ui/src";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import React, { useState } from "react";
import * as GoGQL from "@gogocode-package/graphql_code_generator";
import { gql } from "@apollo/client";
import EditGeneralDetailsModel from "./EditGeneralDetailsModel";
import { TableChartRounded } from "@mui/icons-material";
import { GetUpdateStatus } from "../GetUpdateStatus";

const textColor = "rgba(115, 115, 115, 1)";

export const FETCH_DOCTOR_MEMBERSHIP_INFO = gql`
  query view_doctor_membership_info($includes: [ViewDoctorIncludesEnum!]!) {
    view_doctor_membership_info(includes: $includes) {
      User {
        email
        mobile
      }
      degrees
      practice_name
      website
      tax_id
      practice_type
    }
  }
`;
export const GeneralDetails = () => {
  const theme = useTheme();
  const [editModelOpen, setEditModelOpen] = useState<boolean>(false);
  const [selectedGeneralDetails, setSelectedGeneralDetails] = useState(null);
  const response = GoGQL.useView_Doctor_Membership_InfoQuery(FETCH_DOCTOR_MEMBERSHIP_INFO, {
    variables: {
      includes: [GoGQL.ViewDoctorIncludesEnum.User],
    },
    // fetchPolicy: "cache-and-network",
  });

  return (
    <>
      <Paper style={{ display: "flex", padding: "3% ", margin: "3% 0", borderRadius: 5, border: "1px solid #E0E0E0" }}>
        <div style={{ flexBasis: "100%" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "2%" }}>
            <UIHeader text={"General Details"} color={theme.palette.primary.main} />
            <IconButton
              color="primary"
              style={{ backgroundColor: theme.palette.primary.main }}
              //   className={styles.iconDiv}
              onClick={() => {
                console.log("editmOdel");
                setSelectedGeneralDetails(response?.data?.view_doctor_membership_info);
                setEditModelOpen(true);
              }}
            >
              <EditRoundedIcon style={{ color: "white" }} />
            </IconButton>
            {
              <GetUpdateStatus
                pendingStatusText="Pending with Admin Approval"
                section={GoGQL.ViewDoctorIncludesEnum.Provider}
              />
            }
          </div>
          <div style={{ display: "flex", flexWrap: "wrap" }}>
            <>
              <div style={{ flexBasis: "40%", padding: "10px 0", minWidth: "150px" }}>
                <Typography fontWeight="bold" color={textColor}>
                  Mobile
                </Typography>
                <Typography color={textColor}>
                  {response?.data?.view_doctor_membership_info?.User?.mobile || "-"}
                </Typography>
              </div>
              <div style={{ flexBasis: "40%", padding: "10px 0", minWidth: "150px" }}>
                <Typography fontWeight="bold" color={textColor}>
                  Degrees
                </Typography>
                <Typography color={textColor}>{response?.data?.view_doctor_membership_info?.degrees || "-"}</Typography>
              </div>
              <div style={{ flexBasis: "40%", padding: "10px 0", minWidth: "150px" }}>
                <Typography fontWeight="bold" color={textColor}>
                  Tax ID
                </Typography>
                <Typography color={textColor}>{response?.data?.view_doctor_membership_info?.tax_id || "-"}</Typography>
              </div>
              <div style={{ flexBasis: "40%", padding: "10px 0", minWidth: "150px" }}>
                <Typography fontWeight="bold" color={textColor}>
                  Website
                </Typography>
                <Typography color={textColor}>{response?.data?.view_doctor_membership_info?.website || "-"}</Typography>
              </div>
              <div style={{ flexBasis: "40%", padding: "10px 0", minWidth: "150px" }}>
                <Typography fontWeight="bold" color={textColor}>
                  Practice Name
                </Typography>
                <Typography color={textColor}>
                  {response?.data?.view_doctor_membership_info?.practice_name || "-"}
                </Typography>
              </div>
              <div style={{ flexBasis: "40%", padding: "10px 0", minWidth: "150px" }}>
                <Typography fontWeight="bold" color={textColor}>
                  Practice Type
                </Typography>
                <Typography color={textColor}>
                  {response?.data?.view_doctor_membership_info?.practice_type || "-"}
                </Typography>
              </div>
            </>
          </div>
        </div>
      </Paper>
      <EditGeneralDetailsModel
        isOpen={editModelOpen}
        onClose={() => {
          setEditModelOpen(false);
        }}
        selectedGeneralDetails={selectedGeneralDetails}
      />
    </>
  );
};
