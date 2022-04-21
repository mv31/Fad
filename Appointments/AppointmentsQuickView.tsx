import { gql } from "@apollo/client";
import * as GoGQL from "@gogocode-package/graphql_code_generator";
import { Cancel, Edit, EmailOutlined, Phone, PhoneIphoneTwoTone } from "@mui/icons-material";
import VideoCallIcon from "@mui/icons-material/VideoCall";
import {
  CircularProgress,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import { configURL, QUICK_VIEW_LIMIT } from "@src/../../Constants";
import { UIModel, UIPrimaryButton, useErrorNotification, useSnackbar } from "@gogocode-package/ui-web";
import BookAppointmentModel from "@src/components/consumer/Appointments/BookAppointmentModel";
import { StyledTableCell } from "@src/components/dashboard/StyledTableComponents";
import ConfirmationPrompt from "@src/components/ConfirmationPrompt";
import AppointmentDetailsModal from "@src/components/doctor/Appointments/AppointmentDetailsModal";
import StatusLabel from "@src/components/StatusLabel";
import { QuickViewStates } from "@src/DataPullState";
import { colorMatcher } from "@src/utils";
import moment from "moment";
import router from "next/router";
import React, { useEffect, useState } from "react";
import RescheduleModel from "../Appointments/RescheduleModel";
import { DataTable, HeaderProps } from "@src/../../packages/ui/src/DataTable";
import { AppointmentRequest } from "@gogocode-package/graphql_code_generator";

type AppointmentTypeActionModelProps = {
  isOpen: boolean;
  onClose: () => void;
  mobile: string;
};
export const AppointmentTypeActionModel = (props: AppointmentTypeActionModelProps) => {
  const theme = useTheme();
  return (
    <UIModel
      isOpen={props?.isOpen}
      onClose={props.onClose}
      title="Mobile Number"
      hideCancel
      action={
        <UIPrimaryButton
          onClick={() => {
            window.location.href = `tel:${props?.mobile}`;
          }}
        >
          Call
        </UIPrimaryButton>
      }
    >
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "2%" }}>
        <IconButton
          onClick={() => {
            window.location.href = `tel:${props?.mobile}`;
          }}
        >
          <Phone htmlColor={theme.palette.primary.main} />
        </IconButton>
        <Typography style={{ display: "flex", justifyContent: "center" }}>{props?.mobile}</Typography>
      </div>
    </UIModel>
  );
};

const GET_APPOINTMENT_REQUESTS = gql`
  query get_appointment_requests($page_no: Float!, $limit: Float!, $type: AppointmentListing!) {
    get_appointment_requests(page_no: $page_no, limit: $limit, type: $type) {
      rows {
        case_id
        id
        telehealth_patient_id
        telehealth_provider_id
        Patient {
          User {
            name
            last_name
          }
        }
        provider_id
        Provider {
          id
          User {
            name
            last_name
            email
            mobile
            first_name
          }
        }
        PatientMember {
          id
          member_full_name
          member_type
        }
        service
        notes
        from
        to
        status
        AppointmentMedicalRecords {
          MedicalRecord {
            record_name
            record_type
            record_date
            MedicalRecordUrls {
              record_url
              signed_url
            }
            PatientMember {
              member_full_name
              member_type
            }
          }
        }
      }
      count
    }
  }
`;

export const UPDATE_APPOINTMENT_STATUS = gql`
  mutation update_status_of_appointment_request($id: Float!, $status: AppointmentRequestStatus!) {
    update_status_of_appointment_request(id: $id, status: $status) {
      id
      status
    }
  }
`;

const header: HeaderProps[] = [
  { columnName: "Case ID", dataKey: "case_id", rowAlign: "left" },
  { columnName: "Doctor", dataKey: "doctor", rowAlign: "left" },
  { columnName: "Patient", dataKey: "patient", rowAlign: "left" },
  { columnName: "Date", dataKey: "date" },
  { columnName: "From", dataKey: "from" },
  { columnName: "To", dataKey: "to" },
  { columnName: "Type", dataKey: "type" },
  { columnName: "Status", dataKey: "status" },
  { columnName: "Action", dataKey: "action" },
];

export const AppointmentsQuickView = () => {
  const theme = useTheme();
  const page = React.useState(0);
  const limit = React.useState(QUICK_VIEW_LIMIT);
  const [bodyData, setBodyData] = useState<any[]>(null);
  const { enqueueSnackbar } = useSnackbar();
  const [rescheduleModalOpen, setRescheduleModalOpen] = useState<boolean>(false);
  const [appointmentMobileNumberModel, setAppointmentMobileNumberModel] = useState<boolean>(false);
  const [appointmentMobile, setAppointmentMobile] = useState<string>("");
  const [deletePromptModel, setDeletePromptModel] = useState<boolean>(false);
  const AppointmentResponse = GoGQL.useGet_Appointment_RequestsQuery(GET_APPOINTMENT_REQUESTS, {
    variables: {
      page_no: 0,
      limit: 5,
      type: GoGQL.AppointmentListing.All,
    },
    fetchPolicy: "cache-and-network",
  });
  const [appointmentDetailsModel, setAppointmentDetailsModel] = useState<boolean>(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [updateAppointmentStatusRequest, updateAppointmentStatusResponse] =
    GoGQL.useUpdate_Status_Of_Appointment_RequestMutation(UPDATE_APPOINTMENT_STATUS);
  const renderAction = (request: AppointmentRequest) => (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "left" }}>
      {request?.status == GoGQL.AppointmentRequestStatus.Accepted && (
        <div style={{ display: "flex", alignItems: "center" }}>
          {/* {request?.service == GoGQL.AppointmentServices.Email && (
            <IconButton
              onClick={(e) => {
                e.stopPropagation();
                router.push(
                  `/mail_box?id=${request.Provider?.User?.id}&email=${request?.Provider?.User?.email}&name=${request?.Provider?.User?.name}`
                );
              }}
            >
              <EmailOutlined htmlColor={theme.palette.primary.main} />
            </IconButton>
          )} */}
          {request?.service == GoGQL.AppointmentServices.Telehealth && (
            <IconButton
              onClick={(e) => {
                e.stopPropagation();
                window.open(
                  `${configURL.TELEHEALTH_URL_PREFIX}${request?.telehealth_patient_id}&name=${request?.Patient?.User?.name}`,
                  "_blank"
                );
              }}
            >
              <VideoCallIcon htmlColor={theme.palette.primary.main} />
            </IconButton>
          )}
          {request?.service == GoGQL.AppointmentServices.Phone && (
            <IconButton
              onClick={(e) => {
                e.stopPropagation();
                setAppointmentMobileNumberModel(true);
                setAppointmentMobile(request?.Provider?.User?.mobile);
              }}
            >
              <PhoneIphoneTwoTone htmlColor={theme.palette.primary.main} />
            </IconButton>
          )}
        </div>
      )}
      {moment(request?.from).isAfter() &&
        ((request?.status == GoGQL.AppointmentRequestStatus.Accepted &&
          moment(request?.from).diff(moment(), "hours") > 24) ||
          [GoGQL.AppointmentRequestStatus.Pending, GoGQL.AppointmentRequestStatus.Rescheduled].includes(
            request?.status
          )) && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-evenly" }}>
            <Tooltip
              title={
                request?.status === GoGQL.AppointmentRequestStatus.Pending
                  ? "Edit the Appointment"
                  : "Reschedule the Appointmnet"
              }
            >
              <IconButton
                onClick={(e) => {
                  e.stopPropagation();
                  setRescheduleModalOpen(true);
                  setSelectedAppointment(request);
                }}
              >
                <Edit htmlColor={theme.palette.primary.main} />
              </IconButton>
            </Tooltip>
            <Tooltip title="Cancel this Appointment">
              <IconButton
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedAppointment(request);
                  setDeletePromptModel(true);
                }}
              >
                <Cancel htmlColor={theme.palette.error.main} />
              </IconButton>
            </Tooltip>
          </div>
        )}
    </div>
  );
  useEffect(() => {
    QuickViewStates.update((s) => {
      s.isShowAll = AppointmentResponse?.data?.get_appointment_requests?.count > QUICK_VIEW_LIMIT;
    });
    setBodyData(
      AppointmentResponse?.data?.get_appointment_requests?.rows?.map((request: AppointmentRequest) => {
        return {
          id: request?.id,
          case_id: request?.case_id,
          doctor: `Dr. ${request?.Provider?.User?.last_name} ${request?.Provider?.User?.first_name}`,
          patient: request?.PatientMember?.member_full_name,
          date: `${moment(request?.from).format("MMM D, YYYY")}`,
          from: `${moment(request?.from).format("hh:mm A")}`,
          to: `${moment(request?.to).format("hh:mm A")}`,
          type: request?.service,
          status: (
            <StatusLabel
              text={
                request?.status == GoGQL.AppointmentRequestStatus.Rescheduled ? "To Be Rescheduled" : request?.status
              }
              color={colorMatcher(request?.status)}
            />
          ),
          action: renderAction(request),
        };
      })
    );
  }, [AppointmentResponse?.data]);

  const onCancel = () => {
    updateAppointmentStatusRequest({
      variables: {
        id: Number(selectedAppointment?.id),
        status: GoGQL.AppointmentRequestStatus.Cancelled,
      },
    });
  };

  const onConformDelete = () => {
    onCancel();
  };

  useEffect(() => {
    setDeletePromptModel(false);
    if (updateAppointmentStatusResponse?.data) {
      enqueueSnackbar("Appointment Cancelled", {
        variant: "success",
      });
    }
    if (updateAppointmentStatusResponse?.error) {
      enqueueSnackbar(updateAppointmentStatusResponse?.error?.message, {
        variant: "error",
      });
    }
  }, [updateAppointmentStatusResponse?.data, updateAppointmentStatusResponse?.error]);

  return (
    <div>
      <DataTable
        headerData={header}
        page={page}
        limit={limit}
        data={bodyData}
        rowCount={AppointmentResponse?.data?.get_appointment_requests?.count}
        loading={AppointmentResponse?.loading}
        emptyText="No Appointments Found"
        disablePagination
        rawData={AppointmentResponse?.data?.get_appointment_requests?.rows}
        onRowClick={(request) => {
          setAppointmentDetailsModel(true);
          setSelectedAppointment(request);
        }}
      />
      <AppointmentDetailsModal
        isOpen={appointmentDetailsModel}
        onClose={() => {
          setAppointmentDetailsModel(false);
        }}
        appointment={selectedAppointment}
      />
      <RescheduleModel
        isOpen={rescheduleModalOpen}
        onClose={() => setRescheduleModalOpen(false)}
        selectedAppointment={selectedAppointment}
      />
      <AppointmentTypeActionModel
        isOpen={appointmentMobileNumberModel}
        onClose={() => setAppointmentMobileNumberModel(false)}
        mobile={appointmentMobile}
      />
      <ConfirmationPrompt
        isOpen={deletePromptModel}
        onClose={() => setDeletePromptModel(false)}
        message="Are you sure to cancel this appointment?"
        title="Cancel Appointment"
        actionText="Yes"
        cancelText="No"
        action={onConformDelete}
        actionLoading={updateAppointmentStatusResponse?.loading}
      />
    </div>
  );
};
