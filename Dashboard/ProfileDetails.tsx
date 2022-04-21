import { Avatar, Typography } from "@mui/material";
import { useUser_GetQuery } from "@gogocode-package/graphql_code_generator";
import React from "react";
import { gql } from "@apollo/client";
import { formattedAddress } from "@src/utils";
import { UIPrimaryButton } from "@src/../../packages/ui/src";
import { useRouter } from "next/router";

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

const ProfileDetails = () => {
  const router = useRouter();
  const { data, loading, error } = useUser_GetQuery(GET_USER);
  const textColor = "rgba(115, 115, 115, 1)";
  return (
    <div style={{ display: "flex", justifyContent: "space-between" }}>
      <div style={{ display: "flex", gap: "2%", marginBottom: "1%", flexBasis: "75%" }}>
        <Avatar sx={{ height: "70px", width: "70px" }} src={data?.user_get?.profile_picture} />
        <div>
          <Typography fontSize={30}>{data?.user_get?.name}</Typography>
          <Typography color={textColor}>
            {formattedAddress({
              firstLineAddress: data?.user_get?.address_line1,
              city: data?.user_get?.city,
              state: data?.user_get?.state,
              postalCode: data?.user_get?.zip,
              secondLineAddress: data?.user_get?.address_line2,
            })}
          </Typography>
        </div>
      </div>
      {/* <div>
        <UIPrimaryButton
          onClick={() => {
            router.push("/");
          }}
        >
          <SearchIcon fontSize="small"></SearchIcon>
          Search Doctor
        </UIPrimaryButton>
      </div> */}
    </div>
  );
};

export default ProfileDetails;
