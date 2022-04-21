import { Paper, Tooltip, Typography, Button, IconButton, Theme, useTheme } from "@mui/material";
import { makeStyles, createStyles } from "@mui/styles";
import { AppointmentRequest } from "@gogocode-package/graphql_code_generator";
import { useSnackbar } from "@gogocode-package/ui-web";
import React, { useEffect, useState } from "react";
import { DoctorImage } from "../../doctor/profile/DoctorImage";
import moment from "moment";
import * as GoGQL from "@gogocode-package/graphql_code_generator";
import { useRouter } from "next/router";
import { configURL } from "@src/../../Constants";
import StatusLabel from "../../StatusLabel";
import { colorMatcher } from "@src/utils";
import { Cancel, Edit, EmailOutlined, PhoneIphoneTwoTone } from "@mui/icons-material";
import VideoCallIcon from "@mui/icons-material/VideoCall";
import ConfirmationPrompt from "../../ConfirmationPrompt";
import RescheduleModel from "./RescheduleModel";
import ReferredButton from "./ReferredButton";
import { AppointmentTypeActionModel, UPDATE_APPOINTMENT_STATUS } from "./AppointmentsQuickView";

type Props = {
  appointment: AppointmentRequest;
  userType: string;
  onCardClick: () => void;
};
const AppointmentCard = (props: Props) => {
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();
  const [appointmentMobileNumberModel, setAppointmentMobileNumberModel] = useState<boolean>(false);
  const [appointmentMobile, setAppointmentMobile] = useState<string>("");
  const [deletePromptModel, setDeletePromptModel] = useState<boolean>(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [rescheduleModalOpen, setRescheduleModalOpen] = useState<boolean>(false);
  const styles = useStyles();
  const router = useRouter();
  const [updateAppointmentStatusRequest, updateAppointmentStatusResponse] =
    GoGQL.useUpdate_Status_Of_Appointment_RequestMutation(UPDATE_APPOINTMENT_STATUS);
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
      <Paper className={styles.card}>
        <div className={styles.upper} onClick={props.onCardClick}>
          <div className={styles.upperLeft}>
            <DoctorImage
              gender={props?.appointment?.Patient?.User?.gender}
              name={props?.appointment?.Patient?.User?.name}
            />
          </div>
          <div className={styles.upperRight}>
            <Tooltip title={props?.appointment?.Patient?.User?.name} placement="bottom">
              <Typography className={styles.textPrimary}>{props?.appointment?.Patient?.User?.name}</Typography>
            </Tooltip>
            <div style={{ display: "flex", justifyContent: "space-evenly" }}>
              <Typography className={styles.textPrimary}>
                {moment(props?.appointment?.from).format("MMM D, YYYY")}
              </Typography>
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <Typography style={{ fontStyle: "italic" }} color={"text.secondary"}>{`${moment(
                props?.appointment?.from
              ).format("hh:mm A")} - ${moment(props?.appointment?.to).format("hh:mm A")}`}</Typography>
              {props?.appointment?.referral_provider_id && (
                <p
                  style={{
                    fontSize: 15,
                    color: "#FF5F15",
                    margin: 0,
                  }}
                >
                  Referred To Dr. {props?.appointment?.ProviderReferral?.User?.name}
                </p>
              )}
            </div>

            <div style={{ display: "flex", justifyContent: "flex-start" }}>
              <Tooltip title={`Appointment ID : ${props?.appointment?.case_id}`} placement="bottom">
                <Typography>{props?.appointment?.case_id}</Typography>
              </Tooltip>
            </div>
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-evenly" }}>
          {(props.appointment.status == GoGQL.AppointmentRequestStatus.ReferredADoctor && (
            <ReferredButton {...props.appointment} />
          )) || (
            <StatusLabel
              text={
                props?.appointment?.status == GoGQL.AppointmentRequestStatus.Rescheduled
                  ? "To Be Rescheduled"
                  : props?.appointment?.status
              }
              color={colorMatcher(props?.appointment?.status)}
            />
          )}
          {props?.appointment?.status == GoGQL.AppointmentRequestStatus.Accepted && (
            <div>
              {/* {props?.appointment?.service == GoGQL.AppointmentServices.Email && (
                <IconButton
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(
                      `/mail_box?id=${props?.appointment?.Provider?.User?.id}&email=${props?.appointment?.Provider?.User?.email}&name=${props?.appointment?.Provider?.User?.name}`
                    );
                  }}
                >
                  <EmailOutlined />
                </IconButton>
              )} */}
              {props?.appointment?.service == GoGQL.AppointmentServices.Telehealth && (
                <IconButton
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open(
                      `${configURL.TELEHEALTH_URL_PREFIX}${props?.appointment?.telehealth_patient_id}&name=${props?.appointment?.Patient?.User?.name}`,
                      "_blank"
                    );
                  }}
                >
                  <VideoCallIcon />
                </IconButton>
              )}
              {props?.appointment?.service == GoGQL.AppointmentServices.Phone && (
                <IconButton
                  onClick={(e) => {
                    e.stopPropagation();
                    setAppointmentMobileNumberModel(true);
                    setAppointmentMobile(props?.appointment?.Provider?.User?.mobile);
                  }}
                >
                  <PhoneIphoneTwoTone htmlColor={theme.palette.primary.main} />
                </IconButton>
              )}
            </div>
          )}
          {moment(props?.appointment?.from).isAfter() &&
            ((props?.appointment?.status == GoGQL.AppointmentRequestStatus.Accepted &&
              moment(props?.appointment?.from).diff(moment(), "hours") > 24) ||
              [GoGQL.AppointmentRequestStatus.Pending, GoGQL.AppointmentRequestStatus.Rescheduled].includes(
                props?.appointment?.status
              )) && (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-evenly" }}>
                <Tooltip
                  title={
                    props?.appointment?.status === GoGQL.AppointmentRequestStatus.Pending
                      ? "Edit the Appointment"
                      : "Reschedule the Appointmnet"
                  }
                >
                  <IconButton
                    onClick={(e) => {
                      e.stopPropagation();
                      setRescheduleModalOpen(true);
                      setSelectedAppointment(props?.appointment);
                    }}
                  >
                    <Edit htmlColor={theme.palette.primary.main} />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Cancel this Appointment">
                  <IconButton
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedAppointment(props?.appointment);
                      setDeletePromptModel(true);
                    }}
                  >
                    <Cancel htmlColor={theme.palette.error.main} />
                  </IconButton>
                </Tooltip>
              </div>
            )}
        </div>
      </Paper>
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
      <RescheduleModel
        isOpen={rescheduleModalOpen}
        onClose={() => setRescheduleModalOpen(false)}
        selectedAppointment={selectedAppointment}
      />
    </>
  );
};

export default AppointmentCard;

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    card: {
      background: theme.palette.secondary.main,
      height: 230,
      border: `1px solid ${theme.palette.primary.main}`,
      borderRadius: 10,
      width: 400,
      padding: 10,
      display: "flex",
      flexDirection: "column",
      cursor: "pointer",
    },
    upper: {
      display: "flex",
      gap: 5,
      flex: 2,
    },
    upperLeft: {
      flexBasis: "30%",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      flexDirection: "column",
    },
    upperRight: {
      justifySelf: "flex-start",
      height: 100,
    },
    icons: {
      height: 30,
      width: 30,
      display: "block",
      marginLeft: "auto",
      marginRight: "auto",
    },
    status: {
      marginTop: 5,
    },
    textPrimary: {
      fontWeight: 600,
      fontSize: 22,
      marginBottom: 10,
      marginTop: 2,
      overflow: "hidden",
      textOverflow: "ellipsis",
      width: "250px",
      whiteSpace: "nowrap",
    },
    textSecondary: {
      color: theme.palette.primary.main,
      marginBottom: 10,
      overflow: "hidden",
      textOverflow: "ellipsis",
      width: "250px",
      whiteSpace: "nowrap",
    },
    textTertiary: {
      marginTop: 10,
      marginBottom: 10,
    },
  })
);
