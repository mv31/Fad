import { gql } from "@apollo/client";
import * as GoGQL from "@gogocode-package/graphql_code_generator";
import { Cancel, PhoneIphoneTwoTone } from "@mui/icons-material";
import { Badge, FormControl, IconButton, InputLabel, MenuItem, Select, Tooltip, useTheme } from "@mui/material";
import { configURL, DEFAULT_TABLE_LIMIT, QUICK_VIEW_LIMIT } from "@src/../../Constants";
import {
  DataTable,
  UIModel,
  UIPrimaryButton,
  useErrorNotification,
  useSnackbar,
  useSuccessNotification,
} from "@src/../../packages/ui/src";
import StatusLabel from "@src/components/StatusLabel";
import moment from "moment";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import EmailOutlined from "@mui/icons-material/EmailOutlined";
import VideoCallIcon from "@mui/icons-material/VideoCall";
import { colorMatcher, getStatusLabel } from "@src/utils";
import { QuickViewStates } from "@src/DataPullState";
import MobileNumberPromptModel from "@src/components/MobileNumberPromptModel";
import ConfirmationPrompt from "@src/components/ConfirmationPrompt";
import { HeaderProps } from "@src/../../packages/ui/src/DataTable";
import { UPDATE_DOCTOR_GENERAL_INFORMATION } from "../membership/PersonalDetails/EditGeneralDetailsModel";
import AppointmentDetailsModal from "./AppointmentDetailsModal";
import ReferAppointmentModal from "@src/components/consumer/Appointments/ReferAppointmentModal";
import {
  AppointmentTypeActionModel,
  UPDATE_APPOINTMENT_STATUS,
} from "@src/components/consumer/Appointments/AppointmentsQuickView";
import { getUserType } from "@src/api/api";
import { AppointmentRequest } from "@gogocode-package/graphql_code_generator";
import { makeStyles } from "@mui/styles";
import { DoctorRoutes } from "@src/routes/DashboardRoutes";

export const FETCH_APPOINTMENT_REQUESTS = gql`
  query get_appointment_requests(
    $page_no: Float!
    $limit: Float!
    $type: AppointmentListing!
    $todayAppointment: Boolean
    $searchName: String
  ) {
    get_appointment_requests(
      page_no: $page_no
      limit: $limit
      type: $type
      todayAppointment: $todayAppointment
      searchName: $searchName
    ) {
      rows {
        case_id
        id
        patient_id
        member_id
        provider_id
        status
        notes
        telehealth_patient_id
        telehealth_provider_id
        referral_provider_id
        Patient {
          id
          User {
            name
            last_name
            email
            gender
            profile_picture
            id
          }
        }
        Provider {
          id
          User {
            name
            last_name
            gender
            profile_picture
            mobile
            id
            email
          }
          ProviderSpecialties {
            Taxonomy {
              specialty
            }
          }
        }
        ProviderReferral {
          id
          degrees
          User {
            name
            first_name
            last_name
            gender
            profile_picture
            mobile
            address_line1
            address_line2
            city
            state
            zip
          }
          ProviderSpecialties {
            Taxonomy {
              specialty
            }
          }
        }
        service
        from
        to
        PatientMember {
          id
          member_full_name
          member_type
          mobile
        }
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
        is_eligible
      }
      count
    }
  }
`;

export const VERIFY_ELIGIBILITY = gql`
  query verify_eligibility_for_appointment($appointment_id: Float!) {
    verify_eligibility_for_appointment(appointment_id: $appointment_id)
  }
`;

export const FETCH_APPOINTMENT_REQUESTS_PER_DATE = gql`
  query get_appointments_per_date($date: DateTime!, $status: AppointmentRequestStatus!) {
    get_appointments_per_date(date: $date, status: $status) {
      case_id
      id
      patient_id
      member_id
      provider_id
      status
      notes
      telehealth_patient_id
      telehealth_provider_id
      referral_provider_id
      Patient {
        id
        User {
          name
          last_name
          email
          gender
          profile_picture
          id
        }
      }
      Provider {
        id
        User {
          name
          last_name
          gender
          profile_picture
          mobile
          id
        }
        ProviderSpecialties {
          Taxonomy {
            specialty
          }
        }
      }
      ProviderReferral {
        id
        degrees
        User {
          name
          first_name
          last_name
          gender
          profile_picture
          mobile
          address_line1
          address_line2
          city
          state
          zip
        }
        ProviderSpecialties {
          Taxonomy {
            specialty
          }
        }
      }
      service
      from
      to
      PatientMember {
        member_full_name
        member_type
        mobile
      }
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
      is_eligible
    }
  }
`;
export const UPDATE_STATUS = gql`
  mutation update_status_of_appointment_request(
    $id: Float!
    $status: AppointmentRequestStatus!
    $referred_provider_id: Float
  ) {
    update_status_of_appointment_request(id: $id, status: $status, referred_provider_id: $referred_provider_id) {
      id
      status
    }
  }
`;

type Props = {
  isQuickView?: boolean;
  isTodayAppointment?: boolean;
  conflictedAppointment?: boolean;
  from?: Date | null | string;
};

const Header: HeaderProps[] = [
  { columnName: "Case ID", dataKey: "case_id", rowAlign: "left" },
  { columnName: "Consumer", dataKey: "consumer", rowAlign: "left" },
  { columnName: "Patient", dataKey: "patient", rowAlign: "left" },
  { columnName: "Date", dataKey: "date" },
  { columnName: "From", dataKey: "from" },
  { columnName: "To", dataKey: "to" },
  { columnName: "Verification", dataKey: "verification" },
  { columnName: "Service", dataKey: "service" },
  { columnName: "Status", dataKey: "status" },
  { columnName: "Action", dataKey: "action" },
];

const QuickViewHeader: HeaderProps[] = Header;

export const AppointmentRequests = ({
  isQuickView = false,
  isTodayAppointment = false,
  conflictedAppointment = false,
  from,
}: Props) => {
  const userType = getUserType();
  const router = useRouter();
  const theme = useTheme();
  const styles = useStyles();
  const page = React.useState(0);
  const limit = React.useState(isTodayAppointment || !isQuickView ? DEFAULT_TABLE_LIMIT : QUICK_VIEW_LIMIT);
  const searchTextState = React.useState("");
  const [headerData] = useState<HeaderProps[]>(isQuickView ? QuickViewHeader : Header);
  const [bodyData, setBodyData] = useState<any[]>(null);
  const [referModal, setReferModal] = useState<boolean>(false);
  const { enqueueSnackbar } = useSnackbar();
  const [appointmentDetailsModalOpen, setAppointmentDetailsModalOpen] = useState<boolean>(false);
  const [acceptId, setAcceptId] = useState<string>("");
  const [deniedId, setDeniedId] = useState<string>("");
  const [referBtnId, setReferBtnId] = useState<string>("");
  const [selectedAppointment, setSelectedAppoinment] = useState<GoGQL.AppointmentRequest>(null);
  const [mobilePromptModalOpen, setMobilePromptModalOpen] = useState<boolean>(false);
  const [appointmentMobileNumberModel, setAppointmentMobileNumberModel] = useState<boolean>(false);
  const [conflictAppointmentModelOpen, setConflictAppointmentModelOpen] = useState<boolean>(false);
  const [appointmentMobile, setAppointmentMobile] = useState<string>("");
  const [deletePromptModel, setDeletePromptModel] = useState<boolean>(false);
  const [status, setStatus] = useState<GoGQL.AppointmentListing>(GoGQL.AppointmentListing.All);

  const AppointmentRequestsResponse = GoGQL.useGet_Appointment_RequestsQuery(FETCH_APPOINTMENT_REQUESTS, {
    variables: {
      page_no: page[0],
      limit: limit[0],
      type: isTodayAppointment ? GoGQL.AppointmentListing.Pending : status,
      todayAppointment: isTodayAppointment,
    },
    fetchPolicy: "cache-and-network",
  });

  const [AppointmentRequestsPerDateRequest, AppointmentRequestsPerDateResponse] =
    GoGQL.useGet_Appointments_Per_DateLazyQuery(FETCH_APPOINTMENT_REQUESTS_PER_DATE);

  const [verifyeligibilityRequest, verifyeligibilityResponse] =
    GoGQL.useVerify_Eligibility_For_AppointmentLazyQuery(VERIFY_ELIGIBILITY);
  useEffect(() => {
    if (conflictedAppointment) {
      AppointmentRequestsPerDateRequest({
        variables: {
          date: from || new Date(),
          status: GoGQL.AppointmentRequestStatus.Pending,
        },
      });
    }
  }, [from]);

  const [UpdateRequestOfStatus, UpdateRequestResponse] = GoGQL.useUpdate_Status_Of_Appointment_RequestMutation(
    UPDATE_STATUS
    // {
    //   refetchQueries: [
    //     {
    //       query: FETCH_APPOINTMENT_REQUESTS,
    //       variables: {
    //         page_no: page[0],
    //         limit: limit[0],
    //         type: GoGQL.AppointmentListing.Pending,
    //         isTodayAppointment,
    //       },
    //       fetchPolicy: "cache-and-network",
    //     },
    //   ],
    // }
  );

  const [updateDocGeneralDataRequest, updateDocGeneralDataResponse] =
    GoGQL.useUpdate_Doctor_Membership_Info_General_InformationMutation(UPDATE_DOCTOR_GENERAL_INFORMATION);

  const [updateAppointmentStatusRequest, updateAppointmentStatusResponse] =
    GoGQL.useUpdate_Status_Of_Appointment_RequestMutation(UPDATE_APPOINTMENT_STATUS);

  const onAccept = (event, row: AppointmentRequest, count) => {
    event.stopPropagation();
    setAcceptId(row?.id);
    if (!conflictedAppointment && count > 1) {
      setSelectedAppoinment(row);
      setConflictAppointmentModelOpen(true);
      return;
    }
    handleStatusUpdate(row?.id, GoGQL.AppointmentRequestStatus.Accepted, row?.service, row?.Provider?.User?.mobile);
  };

  useSuccessNotification([verifyeligibilityResponse?.data?.verify_eligibility_for_appointment]);
  useErrorNotification([verifyeligibilityResponse?.error]);

  const renderStatus = (row: AppointmentRequest) => {
    const count = AppointmentRequestsResponse?.data?.get_appointment_requests?.rows
      ?.filter((request) => request.status == GoGQL.AppointmentRequestStatus.Pending)
      .reduce((a, v) => (v.from === row?.from ? a + 1 : a), 0);
    return (
      <>
        {row.status === GoGQL.AppointmentRequestStatus.Pending ? (
          <>
            <div
              style={{
                display: "flex",
                gap: 5,
                justifyContent: "space-between",
                width: "100%",
                margin: "0 auto",
              }}
            >
              {/* <Badge
                badgeContent={count}
                color="error"
                classes={{ badge: styles.badge }}
                invisible={count < 2 || conflictedAppointment}
              > */}
              <UIPrimaryButton
                variant="contained"
                style={{ width: "100%" }}
                loading={acceptId == row?.id && UpdateRequestResponse?.loading}
                onClick={(event) => {
                  onAccept(event, row, count);
                }}
              >
                Accept
              </UIPrimaryButton>
              {/* </Badge> */}
              <UIPrimaryButton
                variant="outlined"
                style={{ width: "45%" }}
                loading={deniedId == row?.id && UpdateRequestResponse?.loading}
                color="error"
                onClick={(event) => {
                  event.stopPropagation();
                  setDeniedId(row?.id);
                  handleStatusUpdate(
                    row?.id,
                    GoGQL.AppointmentRequestStatus.Rejected,
                    row?.service,
                    row?.Provider?.User?.mobile
                  );
                }}
              >
                Reject
              </UIPrimaryButton>
              <UIPrimaryButton
                variant="outlined"
                style={{ width: "45%" }}
                color="warning"
                loading={referBtnId == row?.id && UpdateRequestResponse?.loading}
                onClick={(e) => {
                  e.stopPropagation();
                  setReferModal(true);
                  setReferBtnId(row?.id);
                  setSelectedAppoinment(row);
                }}
              >
                Refer
              </UIPrimaryButton>
            </div>
            {/* <div>
              <a
                onClick={(e) => {
                  e.stopPropagation();
                }}
                href=""
              >
                Verify Eligibility
              </a>
            </div> */}
          </>
        ) : (
          <StatusLabel
            text={getStatusLabel(row?.status, userType)}
            color={colorMatcher(getStatusLabel(row?.status, userType))}
          />
        )}
      </>
    );
  };
  function verify(id: string) {
    verifyeligibilityRequest({
      variables: {
        appointment_id: Number(id),
      },
    });
    enqueueSnackbar("Request sent", { variant: "success" });
  }

  const renderVerification = (row: AppointmentRequest) => (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "left" }}>
      {(row?.is_eligible && (
        <div>
          <UIPrimaryButton
            variant="outlined"
            style={{ width: "100%" }}
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            view eligibility
          </UIPrimaryButton>
        </div>
      )) || (
        <div>
          <UIPrimaryButton
            variant="contained"
            style={{ width: "100%" }}
            loading={acceptId == row?.id && UpdateRequestResponse?.loading}
            onClick={(e) => {
              e.stopPropagation();
              verify(row?.id);
            }}
          >
            verify Eligibility
          </UIPrimaryButton>
        </div>
      )}
    </div>
  );

  const renderAction = (row: AppointmentRequest) => (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "left" }}>
      {row?.status == GoGQL.AppointmentRequestStatus.Accepted && (
        <div>
          {/* {row?.service == GoGQL.AppointmentServices.Email && (
            <IconButton
              onClick={(e) => {
                e.stopPropagation();
                router.push(
                  `/mail_box?id=${row.Patient?.User?.id}&email=${row?.Patient?.User?.email}&member_id=${null}&name=${
                    row?.Patient?.User?.name
                  }`
                );
              }}
            >
              <EmailOutlined />
            </IconButton>
          )} */}
          {row?.service == GoGQL.AppointmentServices.Telehealth && (
            <IconButton
              onClick={(e) => {
                e.stopPropagation();
                window.open(
                  `${configURL.TELEHEALTH_URL_PREFIX}${row?.telehealth_provider_id}&name=${row?.Provider?.User?.name}&d=1`,
                  "_blank"
                );
              }}
            >
              <VideoCallIcon />
            </IconButton>
          )}
          {row?.service == GoGQL.AppointmentServices.Phone && (
            <IconButton
              onClick={(e) => {
                e.stopPropagation();
                setAppointmentMobileNumberModel(true);
                setAppointmentMobile(row?.PatientMember?.mobile);
              }}
            >
              <PhoneIphoneTwoTone htmlColor={theme.palette.primary.main} />
            </IconButton>
          )}
        </div>
      )}
      {moment(row?.from).isAfter() &&
        ((row?.status == GoGQL.AppointmentRequestStatus.Accepted && moment(row?.from).diff(moment(), "hours") > 12) ||
          [GoGQL.AppointmentRequestStatus.Pending, GoGQL.AppointmentRequestStatus.Rescheduled].includes(
            row?.status
          )) && (
          <Tooltip title="Cancel this Appointment">
            <IconButton
              onClick={(e) => {
                e.stopPropagation();
                setSelectedAppoinment(row);
                setDeletePromptModel(true);
              }}
            >
              <Cancel htmlColor={theme.palette.error.main} />
            </IconButton>
          </Tooltip>
        )}
    </div>
  );

  const handleStatusChange = (evt) => {
    setStatus(evt.target.value);
  };

  const renderStatusFilter = (
    <FormControl variant="standard" sx={{ minWidth: "10%", alignSelf: "center" }}>
      <InputLabel id="demo-simple-select-standard-label">Status</InputLabel>
      <Select
        labelId="demo-simple-select-standard-label"
        id="demo-simple-select-standard"
        value={status}
        onChange={handleStatusChange}
        label="Status"
      >
        <MenuItem value={GoGQL.AppointmentListing.All}>{GoGQL.AppointmentListing.All}</MenuItem>
        <MenuItem value={GoGQL.AppointmentListing.Pending}>{GoGQL.AppointmentListing.Pending}</MenuItem>
        <MenuItem value={GoGQL.AppointmentListing.Completed}>{GoGQL.AppointmentListing.Completed}</MenuItem>
        <MenuItem value={GoGQL.AppointmentListing.Upcoming}>{GoGQL.AppointmentListing.Upcoming}</MenuItem>
      </Select>
    </FormControl>
  );

  useEffect(() => {
    if (isTodayAppointment) {
      QuickViewStates.update((s) => {
        s.isShowAll = false;
      });
    } else {
      QuickViewStates.update((s) => {
        s.isShowAll = AppointmentRequestsResponse?.data?.get_appointment_requests?.count > QUICK_VIEW_LIMIT;
      });
    }
    if (AppointmentRequestsResponse?.data && !conflictedAppointment) {
      setBodyData(
        AppointmentRequestsResponse?.data?.get_appointment_requests?.rows?.map((request: AppointmentRequest) => {
          return {
            id: request?.id,
            case_id: request?.case_id,
            consumer: request?.Patient?.User?.name,
            patient: `${request?.PatientMember?.member_full_name}(${request?.PatientMember?.member_type})`,
            date: moment(request?.from, "YYYY-MM-DDThh:mm:ssZ").format("MMM DD, YYYY"),
            from: moment(request?.from, "YYYY-MM-DDThh:mm:ssZ").format("hh:mm A"),
            to: moment(request?.to, "YYYY-MM-DDThh:mm:ssZ").format("hh:mm A"),
            verification: renderVerification(request),
            service: request?.service,
            status: renderStatus(request),
            action: renderAction(request),
          };
        })
      );
    }
  }, [AppointmentRequestsResponse?.data]);

  useEffect(() => {
    if (conflictedAppointment && AppointmentRequestsPerDateResponse?.data) {
      setBodyData(
        AppointmentRequestsPerDateResponse?.data?.get_appointments_per_date?.map((request: AppointmentRequest) => {
          return {
            id: request?.id,
            case_id: request?.case_id,
            consumer: request?.Patient?.User?.name,
            patient: `${request?.PatientMember?.member_full_name}(${request?.PatientMember?.member_type})`,
            date: moment(request?.from, "YYYY-MM-DDThh:mm:ssZ").format("MMM DD, YYYY"),
            from: moment(request?.from, "YYYY-MM-DDThh:mm:ssZ").format("hh:mm A"),
            to: moment(request?.to, "YYYY-MM-DDThh:mm:ssZ").format("hh:mm A"),
            service: request?.service,
            verification: renderVerification(request),
            status: renderStatus(request),
            action: renderAction(request),
          };
        })
      );
    }
  }, [AppointmentRequestsPerDateResponse?.data]);

  useEffect(() => {
    if (UpdateRequestResponse?.data) {
      enqueueSnackbar("Updated ", { variant: "success" });
      setConflictAppointmentModelOpen(false);
      setSelectedAppoinment(null);
    }
  }, [UpdateRequestResponse?.data]);

  useErrorNotification([UpdateRequestResponse?.error]);

  const onMobileSave = (mobile: string) => {
    updateDocGeneralDataRequest({
      variables: {
        input: {
          user: {
            mobile,
          },
        },
      },
    });
  };

  useEffect(() => {
    if (updateDocGeneralDataResponse?.data) {
      enqueueSnackbar("Mobile Number Updated", { variant: "success" });
      setMobilePromptModalOpen(false);
    }
  }, [updateDocGeneralDataResponse?.data]);

  const handleStatusUpdate = (
    id,
    status: GoGQL.AppointmentRequestStatus,
    service: string,
    mobile: string,
    referred_provider_id: number = null
  ) => {
    if (service == GoGQL.AppointmentServices.Phone) {
      if (
        !mobile &&
        !updateDocGeneralDataResponse?.data?.update_doctor_membership_info_general_information?.user?.mobile
      ) {
        enqueueSnackbar("Please update mobile number", { variant: "error" });
        setMobilePromptModalOpen(true);
        return;
      }
    }
    UpdateRequestOfStatus({
      variables: {
        id: Number(id),
        status,
        referred_provider_id: Number(referred_provider_id),
      },
    });
  };

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
    <>
      <DataTable
        headerData={headerData}
        page={page}
        limit={limit}
        data={bodyData}
        rowCount={AppointmentRequestsResponse?.data?.get_appointment_requests?.count}
        loading={AppointmentRequestsResponse?.loading || UpdateRequestResponse?.loading}
        emptyText={!isTodayAppointment ? "You don't have any Appointments!" : "You don't have any Appointments Today!"}
        disablePagination={isQuickView}
        searchTextState={!isQuickView && searchTextState}
        searchPlaceHolder={"Search Appointments"}
        showNotes
        onRowClick={(row) => {
          setAppointmentDetailsModalOpen(true);
          setSelectedAppoinment(row);
        }}
        rawData={AppointmentRequestsResponse?.data?.get_appointment_requests?.rows}
        renderStatusFilter={!isQuickView && renderStatusFilter}
      />
      <AppointmentDetailsModal
        isOpen={appointmentDetailsModalOpen}
        onClose={() => {
          setAppointmentDetailsModalOpen(false);
        }}
        appointment={selectedAppointment}
      />
      <MobileNumberPromptModel
        isOpen={mobilePromptModalOpen}
        onClose={() => setMobilePromptModalOpen(false)}
        onSave={onMobileSave}
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
      <ReferAppointmentModal
        isOpen={referModal}
        onClose={() => setReferModal(false)}
        onSubmit={(referred_provider_id: number) => {
          handleStatusUpdate(
            selectedAppointment?.id,
            GoGQL.AppointmentRequestStatus.ReferredADoctor,
            selectedAppointment.service,
            selectedAppointment.Provider.User.mobile,
            referred_provider_id
          );
          setReferModal(false);
        }}
      />
      <UIModel
        isOpen={conflictAppointmentModelOpen}
        onClose={() => {
          setConflictAppointmentModelOpen(false);
          setSelectedAppoinment(null);
        }}
        title="Conflict Appointment Model"
        maxWidth="xl"
      >
        <AppointmentRequests isQuickView conflictedAppointment from={selectedAppointment?.from} />
      </UIModel>
    </>
  );
};

const useStyles = makeStyles(() => ({
  badge: {
    fontSize: 18,
    height: 25,
    width: 25,
    borderRadius: 50,
  },
}));
