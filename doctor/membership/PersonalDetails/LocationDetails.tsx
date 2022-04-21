import { IconButton, Typography, useTheme } from "@mui/material";
import { CircleButton } from "@src/components/membership/AddCircleButton";
import { response } from "msw";
import React, { useEffect, useState } from "react";
import AddLocationDetailsModel, { UPDATE_DOCTOR_ADDRESS } from "./AddLocationDetailsModel";
import * as GoGQL from "@gogocode-package/graphql_code_generator";
import { gql } from "@apollo/client";
import _ from "lodash";
import { DeleteOutlineRounded } from "@mui/icons-material";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import { GetUpdateStatus, GET_UPDATE_STATUS } from "../GetUpdateStatus";
import ConfirmationPrompt from "@src/components/ConfirmationPrompt";

export const FETCH_DOCTOR_MEMBERSHIP_INFO = gql`
  query view_doctor_membership_info($includes: [ViewDoctorIncludesEnum!]!) {
    view_doctor_membership_info(includes: $includes) {
      ProviderAddresses {
        id
        address_line1
        address_line2
        city
        state
        fax
        type
        postal_code
        phone
      }
    }
  }
`;

interface AddressCardProps {
  address_line1: string;
  address_line2: string;
  city: string;
  state: string;
  postal_code: string;
  phone: string;
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
      <Typography>{props.phone ? `${props.phone}` : ""}</Typography>
    </div>
  );
};

const LocationDetailsCard = (props) => {
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
            // className={styles.iconDiv}
            color="primary"
            onClick={() => {
              onEdit(response?.[idx]);
            }}
          >
            <EditRoundedIcon />
          </IconButton>

          <IconButton
            // className={styles.iconDiv}
            color="primary"
            onClick={() => {
              onDelete(response?.[idx]);
            }}
          >
            <DeleteOutlineRounded />
          </IconButton>
        </div>
      </div>
    </>
  );
};

export const LocationDetails = () => {
  const theme = useTheme();

  const [locationType, setLocationType] = useState<"Mailing" | "Practice">(null);
  const [locationModalType, setLocationModalType] = useState<"Add" | "Edit">(null);
  const [selectedAddress, setSelectedAddress] = useState<GoGQL.ProviderAddress>(null);
  const [conformPromptOpen, setConformPromptOpen] = useState<boolean>(false);
  const [updateAddressRequest, updateAddressResponse] = GoGQL.useUpdate_Doctor_Membership_Info_Provider_AddressMutation(
    UPDATE_DOCTOR_ADDRESS,
    {
      refetchQueries: [
        {
          query: FETCH_DOCTOR_MEMBERSHIP_INFO,
          variables: {
            includes: [GoGQL.ViewDoctorIncludesEnum.Address],
          },
        },
        {
          query: GET_UPDATE_STATUS,
          variables: {
            section: GoGQL.ViewDoctorIncludesEnum.Address,
          },
        },
      ],
    }
  );

  const response = GoGQL.useView_Doctor_Membership_InfoQuery(FETCH_DOCTOR_MEMBERSHIP_INFO, {
    variables: {
      includes: [GoGQL.ViewDoctorIncludesEnum.Address],
    },
    fetchPolicy: "cache-and-network",
  });

  const onLocationEdit = (selectedData) => {
    setLocationType(selectedData?.type);
    setSelectedAddress(selectedData), setLocationModalType("Edit");
  };

  const onDelete = () => {
    // let addresses = response?.data?.view_doctor_membership_info?.ProviderAddresses;
    // let updatedAddress = addresses
    //   ?.filter((address) => address?.id != id)
    //   .map((address) => {
    //     return _.omit(address, ["id", "__typename"]);
    //   });
    // console.log(updatedAddress);
    setConformPromptOpen(false);
    const data: GoGQL.ProviderAddress = selectedAddress;
    updateAddressRequest({
      variables: {
        input: _.omit(data, ["id", "__typename", "createdAt", "updatedAt", "deletedAt"]),
        operation: GoGQL.DbOperation.Delete,
        row_id: Number(data?.id),
      },
    });
  };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, marginTop: 20, width: "100%" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Typography variant="subtitle1" fontSize={25} color={theme.palette.primary.main}>
          Mailing
        </Typography>
        {
          <GetUpdateStatus
            pendingStatusText="Pending with Admin Approval"
            section={GoGQL.ViewDoctorIncludesEnum.Address}
          />
        }
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
              onDelete={() => {
                setConformPromptOpen(true);
                setSelectedAddress(providerAddressData);
              }}
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
      {(locationModalType == "Add" || locationModalType == "Edit") && (
        <>
          <div style={{ display: "flex", alignItems: "center" }}></div>
          <AddLocationDetailsModel
            isOpen={locationModalType == "Add" || locationModalType == "Edit"}
            onClose={() => {
              setLocationModalType(null);
              setSelectedAddress(null);
            }}
            selectedLocationType={locationType}
            type={locationModalType}
            selectedAddress={selectedAddress}
            addresses={response?.data?.view_doctor_membership_info?.ProviderAddresses}
          />
        </>
      )}
      <ConfirmationPrompt
        action={onDelete}
        isOpen={conformPromptOpen}
        onClose={() => {
          setConformPromptOpen(false);
          setSelectedAddress(null);
        }}
        message="Are You sure to delete this Address"
        title={"Conformation Prompt"}
        actionLoading={updateAddressResponse?.loading}
      />
    </div>
  );
};
