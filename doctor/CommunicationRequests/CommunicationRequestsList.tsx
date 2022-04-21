import { gql } from "@apollo/client";
import { DoctorRequestStatus, useUpdate_Doctor_RequestMutation } from "@gogocode-package/graphql_code_generator";
import { Button, FormControl, InputLabel, MenuItem, Select, styled, TableRow } from "@mui/material";
import { DEFAULT_TABLE_LIMIT, QUICK_VIEW_LIMIT } from "@src/../../Constants";
import { DataTable, UIPrimaryButton, useErrorNotification, useSuccessNotification } from "@src/../../packages/ui/src";
import PagePanel from "@src/components/PagePanel";
import StatusLabel from "@src/components/StatusLabel";
import moment from "moment";
import React, { useEffect, useState } from "react";
import * as GoGQL from "@gogocode-package/graphql_code_generator";
import { HeaderProps } from "@src/../../packages/ui/src/DataTable";
import { QuickViewStates } from "@src/DataPullState";

export const FETCH_PATIENT_COMMUNICATION = gql`
  query get_communication_requests($searchInput: FilterCommunicationRequestsInput!) {
    get_communication_requests(searchInput: $searchInput) {
      rows {
        id
        Patient {
          id
          User {
            first_name
            last_name
            email
            name
          }
        }
        PatientMember {
          id
          member_full_name
          member_type
        }
        Provider {
          User {
            last_name
          }
        }
        Payer {
          id
          payer_name
        }
        request_date
        updatedAt
        status
        notes
      }
      count
    }
  }
`;

const UPDATE_STATUS = gql`
  mutation update_doctor_request($request_id: Float!, $status: DoctorRequestStatus!) {
    update_doctor_request(request_id: $request_id, status: $status)
  }
`;

export const StyledTableRow = styled(TableRow)(({ theme }) => ({
  "&:nth-of-type(even)": {
    backgroundColor: theme.palette.action.hover,
  },
  // hide last border
  "&:last-child td, &:last-child th": {
    border: 0,
  },
}));

type Props = {
  isQuickView?: boolean;
};

const QuickViewHeader: HeaderProps[] = [
  { columnName: "Consumer", dataKey: "consumer", rowAlign: "left" },
  { columnName: "Patient", dataKey: "patient", rowAlign: "left" },
  { columnName: "Insurance", dataKey: "insurance" },
  { columnName: "Status", dataKey: "status" },
];

const Header: HeaderProps[] = [
  { columnName: "Consumer", dataKey: "consumer", rowAlign: "left" },
  { columnName: "Patient", dataKey: "patient", rowAlign: "left" },
  { columnName: "Insurance", dataKey: "insurance" },
  { columnName: "Requested Date", dataKey: "date" },
  { columnName: "Status", dataKey: "status" },
];
export const CommunicationRequestsList = ({ isQuickView = false }: Props) => {
  const page = React.useState(0);
  const limit = React.useState(isQuickView ? QUICK_VIEW_LIMIT : DEFAULT_TABLE_LIMIT);
  const searchTextState = React.useState("");
  const [headerData] = useState<HeaderProps[]>(isQuickView ? QuickViewHeader : Header);
  const [bodyData, setBodyData] = useState<any[]>(null);
  const [status, setStatus] = useState<DoctorRequestStatus | "All">("All");
  const [acceptId, setAcceptId] = useState();
  const [deniedId, setDeniedId] = useState();

  const { data, loading, error } = GoGQL.useGet_Communication_RequestsQuery(FETCH_PATIENT_COMMUNICATION, {
    variables: {
      searchInput: {
        name: searchTextState[0],
        page_no: page[0],
        limit: limit[0],
        status: status == "All" ? null : status,
      },
    },
    fetchPolicy: "cache-and-network",
  });

  const [UpdateRequest, UpdateResponse] = useUpdate_Doctor_RequestMutation(UPDATE_STATUS, {
    refetchQueries: [
      {
        query: FETCH_PATIENT_COMMUNICATION,
        variables: {
          searchInput: {
            name: searchTextState[0],
            page_no: page[0],
            limit: limit[0],
          },
          fetchPolicy: "cache-and-network",
        },
      },
    ],
  });

  useErrorNotification([error, UpdateResponse?.error]);

  useEffect(() => {
    if (isQuickView) {
      QuickViewStates.update((s) => {
        s.isShowAll = data?.get_communication_requests?.count > QUICK_VIEW_LIMIT;
      });
    }
  }, [isQuickView, data]);

  const StatusRender = (row) => (
    <>
      {row.status === "Pending" && (
        <div
          style={{
            display: "flex",
            gap: 5,
            justifyContent: "space-between",
            width: "100%",
            margin: "0 auto",
          }}
        >
          <UIPrimaryButton
            variant="contained"
            style={{ width: "45%" }}
            loading={acceptId == row?.id && UpdateResponse?.loading}
            onClick={() => {
              setAcceptId(row?.id);
              handleStatusUpdate(row?.id, DoctorRequestStatus.Accepted);
            }}
          >
            Accept
          </UIPrimaryButton>
          <UIPrimaryButton
            variant="outlined"
            style={{ width: "45%" }}
            loading={deniedId == row?.id && UpdateResponse?.loading}
            color="error"
            onClick={() => {
              setDeniedId(row?.id);
              handleStatusUpdate(row?.id, DoctorRequestStatus.Denied);
            }}
          >
            Deny
          </UIPrimaryButton>
        </div>
      )}
      {row?.status === "Accepted" && <StatusLabel text={row.status} color={"green"} />}
      {row?.status === "Denied" && <StatusLabel text={row.status} color={"red"} />}
    </>
  );

  useEffect(() => {
    if (data?.get_communication_requests) {
      console.log("status", data?.get_communication_requests?.rows);
      setBodyData(
        data?.get_communication_requests?.rows?.map((request: GoGQL.DoctorRequests) => {
          let obj = {
            id: request?.id,
            consumer: request?.Patient?.User?.name,
            patient: `${request?.PatientMember?.member_full_name}(${request?.PatientMember?.member_type})`,
            insurance: request?.Payer?.payer_name || "",
            status: StatusRender(request),
          };
          if (!isQuickView) {
            return {
              ...obj,
              date: moment(request?.updatedAt).format("MMM D, YYYY"),
            };
          }
          return obj;
        })
      );
    }
  }, [data]);

  useSuccessNotification([UpdateResponse?.data?.update_doctor_request]);
  useErrorNotification([UpdateResponse?.error]);

  const handleStatusChange = (evt) => {
    setStatus(evt.target.value);
  };

  const handleStatusUpdate = (id, status: DoctorRequestStatus) => {
    UpdateRequest({
      variables: {
        request_id: Number(id),
        status,
      },
    });
  };

  const StatusFilter: React.ReactElement = (
    <FormControl variant="standard" sx={{ minWidth: "10%", alignSelf: "center" }}>
      <InputLabel id="demo-simple-select-standard-label">Status</InputLabel>
      <Select
        labelId="demo-simple-select-standard-label"
        id="demo-simple-select-standard"
        value={status}
        onChange={handleStatusChange}
        label="Status"
      >
        <MenuItem value={"All"}>All</MenuItem>
        <MenuItem value={DoctorRequestStatus.Pending}>Pending</MenuItem>
        <MenuItem value={DoctorRequestStatus.Accepted}>Accepted</MenuItem>
        <MenuItem value={DoctorRequestStatus.Denied}>Denied</MenuItem>
      </Select>
    </FormControl>
  );

  return (
    <DataTable
      headerData={headerData}
      page={page}
      limit={limit}
      data={bodyData}
      rowCount={data?.get_communication_requests?.count}
      loading={loading || UpdateResponse?.loading}
      emptyText="You don't have any Eligibility Requests!"
      disablePagination={isQuickView}
      searchTextState={!isQuickView && searchTextState}
      searchPlaceHolder={"Search Eligibility Request"}
      showNotes
      renderStatusFilter={!isQuickView && StatusFilter}
    />
  );
};

export default CommunicationRequestsList;
