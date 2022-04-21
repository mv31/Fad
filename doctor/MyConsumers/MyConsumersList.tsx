import { DataTable, useErrorNotification } from "@gogocode-package/ui-web";
import moment from "moment";
import React, { useEffect, useState } from "react";
import * as GoGQL from "@gogocode-package/graphql_code_generator";
import StatusLabel from "@src/components/StatusLabel";
import { DEFAULT_TABLE_LIMIT, QUICK_VIEW_LIMIT } from "@src/../../Constants";

import { HeaderProps } from "@gogocode-package/ui-web/src/DataTable";
import { FETCH_PATIENT_COMMUNICATION } from "@src/pages/doctor/communication_request";
import { QuickViewStates } from "@src/DataPullState";

type Props = {
  isQuickView?: boolean;
};

const header: HeaderProps[] = [
  { columnName: "Consumer", dataKey: "name", rowAlign: "left" },
  { columnName: "Patient", dataKey: "member_full_name", rowAlign: "left" },
  { columnName: "Insurance", dataKey: "insurance" },
];
const headerIfNotQuickView: HeaderProps[] = [
  { columnName: "Accepted Date", dataKey: "date" },
  { columnName: "Status", dataKey: "status" },
];
export const MyConsumersList = ({ isQuickView = false }: Props) => {
  const page = React.useState(0);
  const limit = React.useState(isQuickView ? QUICK_VIEW_LIMIT : DEFAULT_TABLE_LIMIT);
  const searchTextState = React.useState("");
  const [headerData] = useState<HeaderProps[]>(isQuickView ? header : header.concat(headerIfNotQuickView));
  const [bodyData, setBodyData] = useState<any[]>(null);

  const { data, loading, error } = GoGQL.useGet_Communication_RequestsQuery(FETCH_PATIENT_COMMUNICATION, {
    variables: {
      searchInput: {
        limit: limit[0],
        page_no: page[0],
        status: GoGQL.DoctorRequestStatus.Accepted,
        name: searchTextState[0],
      },
    },
    fetchPolicy: "cache-and-network",
  });

  useErrorNotification([error]);

  useEffect(() => {
    if (isQuickView) {
      QuickViewStates.update((s) => {
        s.isShowAll = data?.get_communication_requests?.count > QUICK_VIEW_LIMIT;
      });
    }
    if (data?.get_communication_requests) {
      setBodyData(
        data?.get_communication_requests?.rows?.map((request: GoGQL.DoctorRequests) => {
          let obj = {
            id: request?.id,
            name: request?.Patient?.User?.name,
            member_full_name: request?.PatientMember?.member_full_name,
            insurance: request?.Payer?.payer_name || "",
          };
          if (!isQuickView) {
            return {
              ...obj,
              date: moment(request?.updatedAt).format("MMM D, YYYY"),
              status: <StatusLabel text={request?.status} color="green" />,
            };
          }
          return obj;
        })
      );
    }
  }, [data]);

  return (
    <DataTable
      headerData={headerData}
      page={page}
      limit={limit}
      data={bodyData}
      rowCount={data?.get_communication_requests?.count}
      loading={loading}
      emptyText="You don't have any Consumers!"
      disablePagination={isQuickView}
      searchTextState={!isQuickView && searchTextState}
      searchPlaceHolder={"Search Consumers"}
    />
  );
};
