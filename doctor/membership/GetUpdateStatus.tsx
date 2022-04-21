import { gql } from "@apollo/client";
import React, { useEffect, useState } from "react";
import * as GoGQL from "@gogocode-package/graphql_code_generator";
import { Typography } from "@mui/material";

export const GET_UPDATE_STATUS = gql`
  query get_update_status($section: ViewDoctorIncludesEnum!) {
    get_update_status(section: $section)
  }
`;

type Props = {
  section: GoGQL.ViewDoctorIncludesEnum;
  pendingStatusText: string;
};

export const GetUpdateStatus = (props: Props) => {
  const [isPending, setIsPending] = useState<boolean>(false);
  const getUpdateStatus = GoGQL.useGet_Update_StatusQuery(GET_UPDATE_STATUS, {
    variables: {
      section: props?.section,
    },
    fetchPolicy: "network-only",
  });
  useEffect(() => {
    if (getUpdateStatus?.data) {
      if (getUpdateStatus?.data?.get_update_status) {
        setIsPending(true);
      } else {
        setIsPending(false);
      }
    }
  }, [getUpdateStatus?.data]);
  return (
    isPending && (
      <Typography style={{ fontWeight: "bold" }} fontStyle="italic" color={"maroon"}>
        {props?.pendingStatusText}
      </Typography>
    )
  );
};
