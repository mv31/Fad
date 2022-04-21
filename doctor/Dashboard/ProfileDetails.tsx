import { Avatar, Typography } from "@mui/material";
import {
  useUser_GetQuery,
  useView_Doctor_Membership_InfoQuery,
  ViewDoctorIncludesEnum,
} from "@gogocode-package/graphql_code_generator";
import React from "react";
import { gql } from "@apollo/client";
import { formattedAddress } from "@src/utils";
import { UIPrimaryButton } from "@src/../../packages/ui/src";
import { useRouter } from "next/router";
import SearchIcon from "@mui/icons-material/Search";

const GET_USER = gql`
  query {
    user_get {
      name
      address_line1
      address_line2
      city
      state
      zip
      profile_picture
    }
  }
`;

const DOCTOR_INFO = gql`
  query view_doctor_membership_info($includes: [ViewDoctorIncludesEnum!]!) {
    view_doctor_membership_info(includes: $includes) {
      ProviderAddresses {
        address_line1
        address_line2
        city
        state
        postal_code
      }
    }
  }
`;

const ProfileDetails = () => {
  const router = useRouter();
  const { data, loading, error } = useUser_GetQuery(GET_USER);
  const DoctorInfoResponse = useView_Doctor_Membership_InfoQuery(DOCTOR_INFO, {
    variables: {
      includes: ViewDoctorIncludesEnum.Address,
    },
  });
  return (
    <div style={{ display: "flex", justifyContent: "space-between" }}>
      <div style={{ display: "flex", gap: "2%", marginBottom: "1%", flexBasis: "75%" }}>
        <Avatar sx={{ height: "70px", width: "70px" }} src={data?.user_get?.profile_picture} />
        <div>
          <Typography>{data?.user_get?.name}</Typography>
          <Typography>
            {formattedAddress({
              firstLineAddress:
                DoctorInfoResponse?.data?.view_doctor_membership_info?.ProviderAddresses[0]?.address_line1,
              city: DoctorInfoResponse?.data?.view_doctor_membership_info?.ProviderAddresses[0]?.city,
              state: DoctorInfoResponse?.data?.view_doctor_membership_info?.ProviderAddresses[0]?.state,
              postalCode: DoctorInfoResponse?.data?.view_doctor_membership_info?.ProviderAddresses[0]?.postal_code,
              secondLineAddress:
                DoctorInfoResponse?.data?.view_doctor_membership_info?.ProviderAddresses[0]?.address_line2,
            })}
          </Typography>
          {/* {DoctorInfoResponse?.data?.view_doctor_membership_info?.ProviderAddresses?.map((address) => {
          return (
          );
        })} */}
        </div>
      </div>
      {/* <div>
        <UIPrimaryButton
          onClick={() => {
            router.push("/");
          }}
        >
          <SearchIcon fontSize="medium"></SearchIcon>
          Search Doctor
        </UIPrimaryButton>
      </div> */}
    </div>
  );
};

export default ProfileDetails;
