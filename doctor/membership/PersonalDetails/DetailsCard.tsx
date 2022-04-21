import { gql } from "@apollo/client";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import { Paper, Theme, Typography, useTheme } from "@mui/material";
import { makeStyles } from "@mui/styles";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import IconButton from "@mui/material/IconButton";
import {
  useUpdate_Doctor_Membership_Info_Provider_AddressMutation,
  useView_Doctor_Membership_InfoQuery,
  ViewDoctorIncludesEnum,
} from "@gogocode-package/graphql_code_generator";
import { UIHeader } from "@src/../../packages/ui/src";
import React, { useState } from "react";
import EditGeneralDetailsModel from "./EditGeneralDetailsModel";
import AddLocationDetailsModel, { UPDATE_DOCTOR_ADDRESS } from "./AddLocationDetailsModel";
import _ from "lodash";
import { getGenderName } from "@src/utils";
import { CircleButton } from "@src/components/membership/AddCircleButton";
import { DeleteOutlineRounded } from "@mui/icons-material";

export interface CardContent {
  field: string;
  value: string;
}

export const FETCH_DOCTOR_MEMBERSHIP_INFO = gql`
  query view_doctor_membership_info($includes: [ViewDoctorIncludesEnum!]!) {
    view_doctor_membership_info(includes: $includes) {
      User {
        profile_picture
        first_name
        last_name
        middle_name
        email
        gender
        mobile
      }
      npi
      degrees
      practice_name
      website
      tax_id
      practice_type
      summary
      ProviderAddresses {
        id
        address_line1
        address_line2
        city
        state
        fax
        type
        postal_code
      }
    }
  }
`;
const textColor = "rgba(115, 115, 115, 1)";

interface AddressCardProps {
  address_line1: string;
  address_line2: string;
  city: string;
  state: string;
  postal_code: string;
}

export const AddressCard = (props: AddressCardProps) => {
  return (
    <div>
      <Typography>{props.address_line1 ? `${props.address_line1}, ` : ""}</Typography>
      <Typography>{props.address_line2 ? `${props.address_line2}, ` : ""}</Typography>
      <Typography>
        {props.city ? `${props.city}, ` : ""}
        {props.state ? `${props.state}` : ""}
        {props.postal_code ? `, ${props.postal_code}` : ""}
      </Typography>
    </div>
  );
};

const LocationDetailsCard = (props) => {
  const styles = useStyles();
  const theme = useTheme();
  const { providerAddressData, onEdit, onDelete, response, idx } = props;

  return (
    <>
      <div
        style={{
          display: "flex",
          border: `1px solid ${theme.palette.primary.main}`,
          justifyContent: "space-between",
          borderRadius: 10,
          padding: 10,
        }}
      >
        <AddressCard {...providerAddressData} />
        <div style={{ display: "flex", alignItems: "center" }}>
          <IconButton
            className={styles.iconDiv}
            color="primary"
            onClick={() => {
              onEdit(response?.[idx]);
            }}
          >
            <EditRoundedIcon />
          </IconButton>

          <IconButton
            className={styles.iconDiv}
            color="primary"
            onClick={() => {
              onDelete(providerAddressData?.id);
            }}
          >
            <DeleteOutlineRounded />
          </IconButton>
        </div>
      </div>
    </>
  );
};

export const DetailsCard = (props) => {
  const theme = useTheme();
  const [editModelOpen, setEditModelOpen] = useState<boolean>(false);
  const [locationType, setLocationType] = useState<"Mailing" | "Practice">(null);
  const [locationModalType, setLocationModalType] = useState<"Add" | "Edit">(null);
  const [addModelOpen, setAddModelOpen] = useState<boolean>(false);
  const response = useView_Doctor_Membership_InfoQuery(FETCH_DOCTOR_MEMBERSHIP_INFO, {
    variables: {
      includes: [ViewDoctorIncludesEnum.Address, ViewDoctorIncludesEnum.User],
    },
    fetchPolicy: "cache-and-network",
  });
  const styles = useStyles();
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [selectedGeneralDetails, setSelectedGeneralDetails] = useState(null);
  const [updateAddressRequest] = useUpdate_Doctor_Membership_Info_Provider_AddressMutation(UPDATE_DOCTOR_ADDRESS, {
    refetchQueries: [
      {
        query: FETCH_DOCTOR_MEMBERSHIP_INFO,
        variables: {
          includes: [ViewDoctorIncludesEnum.Address, ViewDoctorIncludesEnum.User],
        },
      },
    ],
  });

  const onLocationEdit = (selectedData) => {
    setLocationType(selectedData?.type);
    setSelectedAddress(selectedData), setLocationModalType("Edit");
  };

  const onDelete = (id) => {
    let addresses = response?.data?.view_doctor_membership_info?.ProviderAddresses;
    let updatedAddress = addresses
      ?.filter((address) => address?.id != id)
      .map((address) => {
        return _.omit(address, ["__typename", "id"]);
      });
    // updateAddressRequest({
    //   variables: {
    //     input: updatedAddress,
    //   },
    // });
  };

  return (
    <Paper style={{ display: "flex", padding: "3% ", margin: "3% 0", borderRadius: 5, border: "1px solid #E0E0E0" }}>
      <div style={{ flexBasis: "100%" }}>
        <UIHeader text={props.title} color={theme.palette.primary.main} />
        <div style={{ display: "flex", flexWrap: "wrap" }}>
          {props.title === "Profile Details" && (
            <>
              <div style={{ flexBasis: "40%", padding: "10px 0", minWidth: "150px" }}>
                <Typography fontWeight="bold" color={textColor}>
                  First Name
                </Typography>
                <Typography color={textColor}>
                  {response?.data?.view_doctor_membership_info?.User?.first_name}
                </Typography>
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
                <Typography color={textColor}>
                  {response?.data?.view_doctor_membership_info?.User?.last_name}
                </Typography>
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
            </>
          )}

          {props.title === "General Details" && (
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
                  Email
                </Typography>
                <Typography color={textColor}>
                  {response?.data?.view_doctor_membership_info?.User?.email || "-"}
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
          )}

          {props.title === "Location Details" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 20, marginTop: 20, width: "100%" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Typography variant="subtitle1" fontSize={25} color={theme.palette.primary.main}>
                  Mailing
                </Typography>
                <CircleButton
                  onClick={() => {
                    setLocationType("Mailing");
                    setLocationModalType("Add");
                  }}
                />
              </div>
              {response?.data?.view_doctor_membership_info?.ProviderAddresses?.map((providerAddressData, idx) => {
                return (
                  providerAddressData?.type == "Mailing" && (
                    <LocationDetailsCard
                      key={`key ${idx}`}
                      providerAddressData={providerAddressData}
                      onEdit={onLocationEdit}
                      onDelete={onDelete}
                      response={response?.data?.view_doctor_membership_info?.ProviderAddresses}
                      idx={idx}
                    />
                  )
                );
              })}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Typography variant="subtitle1" fontSize={25} color={theme.palette.primary.main}>
                  Practice
                </Typography>
                <CircleButton
                  onClick={() => {
                    setLocationType("Practice");
                    setLocationModalType("Add");
                  }}
                />
              </div>
              {response?.data?.view_doctor_membership_info?.ProviderAddresses?.map((providerAddressData, idx) => {
                return (
                  providerAddressData?.type == "Practice" && (
                    <LocationDetailsCard
                      key={`key ${idx}`}
                      providerAddressData={providerAddressData}
                      onEdit={onLocationEdit}
                      onDelete={onDelete}
                      response={response?.data?.view_doctor_membership_info?.ProviderAddresses}
                      idx={idx}
                    />
                  )
                );
              })}
              <>
                <div style={{ display: "flex", alignItems: "center" }}></div>
                <AddLocationDetailsModel
                  isOpen={locationModalType == "Add" || locationModalType == "Edit"}
                  onClose={() => setLocationModalType(null)}
                  selectedLocationType={locationType}
                  type={locationModalType}
                  selectedAddress={selectedAddress}
                  addresses={response?.data?.view_doctor_membership_info?.ProviderAddresses}
                />
              </>
            </div>
          )}

          {props.title === "General Details" && (
            <EditGeneralDetailsModel
              isOpen={editModelOpen}
              onClose={() => {
                setEditModelOpen(false);
              }}
              selectedGeneralDetails={selectedGeneralDetails}
            />
          )}
        </div>
      </div>
      {props.title === "General Details" && (
        <IconButton
          color="primary"
          className={styles.iconDiv}
          onClick={() => {
            setSelectedGeneralDetails(response?.data?.view_doctor_membership_info);
            setEditModelOpen(true);
          }}
        >
          <EditRoundedIcon />
        </IconButton>
      )}
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
