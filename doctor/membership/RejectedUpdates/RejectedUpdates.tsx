import { gql } from "@apollo/client";
import { Paper, Table, Typography, useTheme } from "@mui/material";
import { DEFAULT_TABLE_LIMIT } from "@src/../../Constants";
import { DataTable, EllipsisText, HeaderProps, UIHeading, UIModel, UIPrimaryButton } from "@gogocode-package/ui-web";
import React, { useEffect, useState } from "react";
import * as GoGQL from "@gogocode-package/graphql_code_generator";
import { globalDateFormat } from "@src/utils";
import { Compare } from "@src/components/admin/DoctorProfileUpdate/Compare/Compare";
const headerData: HeaderProps[] = [
  { columnName: "S.No", dataKey: "s_no", rowAlign: "center" },
  { columnName: "Changed Date", dataKey: "changed_date", rowAlign: "center" },
  { columnName: "Rejected Date", dataKey: "rejected_date", rowAlign: "center" },
  { columnName: "View Changes", dataKey: "view_changes", rowAlign: "center" },
  { columnName: "Reason", dataKey: "reason", rowAlign: "center" },
];

const GET_PROVIDER_UPDATE_REQUESTS = gql`
  query get_profile_update_requests($input: GetRequestsInput!) {
    get_profile_update_requests(input: $input) {
      rows {
        id
        update_data
        update_type
        status
        rejection_reason
        createdAt
        updatedAt
      }
      count
    }
  }
`;

export const RejectedUpdates = () => {
  const theme = useTheme();
  const page = React.useState(0);
  const limit = React.useState(DEFAULT_TABLE_LIMIT);
  const [bodyData, setBodyData] = useState(null);
  const [compareModalOpen, setCompareModalOpen] = useState<boolean>(false);
  const [selectedChange, setSelectedChange] = useState<GoGQL.ProviderProfileUpdateRequest>(null);
  const getProfileUpdateRequests = GoGQL.useGet_Profile_Update_RequestsQuery(GET_PROVIDER_UPDATE_REQUESTS, {
    variables: {
      input: {
        limit: limit[0],
        page_no: page[0],
        status: GoGQL.AdminProviderProfileUpdateStatus.Rejected,
        search_text: "",
      },
    },
  });

  const renderViewChanges = (updates: GoGQL.ProviderProfileUpdateRequest) => {
    return (
      <UIPrimaryButton
        onClick={() => {
          setCompareModalOpen(true);
          setSelectedChange(updates);
        }}
        variant="text"
      >
        View Changes
      </UIPrimaryButton>
    );
  };

  const renderRejectionReason = (reason: string) => {
    return (
      <EllipsisText length={200} style={{ wordBreak: "break-word" }}>
        {reason}
      </EllipsisText>
    );
  };

  useEffect(() => {
    if (getProfileUpdateRequests?.data && getProfileUpdateRequests?.data?.get_profile_update_requests) {
      setBodyData(
        getProfileUpdateRequests?.data?.get_profile_update_requests?.rows?.map((updates, i) => {
          return {
            s_no: i + 1,
            view_changes: renderViewChanges(updates),
            reason: updates?.rejection_reason ? renderRejectionReason(updates?.rejection_reason) : "-",
            changed_date: globalDateFormat(updates?.createdAt),
            rejected_date: globalDateFormat(updates?.updatedAt),
          };
        })
      );
    }
  }, [getProfileUpdateRequests?.data]);

  return (
    <div style={{ flexBasis: "80%" }}>
      <Paper
        style={{
          margin: "5%",
          padding: "5% 5%",
          border: "1px solid #E0E0E0",
        }}
      >
        <UIHeading text="Rejected Updates" color={theme.palette.primary.main} />
        <DataTable
          containerStyle={{ width: "100%" }}
          headerData={headerData}
          page={page}
          limit={limit}
          data={bodyData}
          rowCount={getProfileUpdateRequests?.data?.get_profile_update_requests?.count}
          loading={getProfileUpdateRequests?.loading}
          emptyText={"There are no Rejected Updates!"}
          rawData={getProfileUpdateRequests?.data?.get_profile_update_requests?.rows}
        />
        <UIModel
          isOpen={compareModalOpen}
          onClose={() => setCompareModalOpen(false)}
          title="View Changes"
          maxWidth="xl"
        >
          <Compare data={selectedChange} />
        </UIModel>
      </Paper>
    </div>
  );
};
