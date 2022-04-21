import { AppointmentRequest, AppointmentRequestStatus } from "@gogocode-package/graphql_code_generator";
import { Typography } from "@mui/material";
import { UIHeading, UIModel } from "@src/../../packages/ui/src";
import { getUserType } from "@src/api/api";
import { ConsumerCard, DoctorCard } from "@src/components/consumer/Appointments/BookAppointmentModel";
import ViewMedicalRecords from "@src/components/medical_records/ViewMedicalRecords";
import StatusLabel from "@src/components/StatusLabel";
import { colorMatcher, getStatusLabel, UserType } from "@src/utils";
import moment from "moment";
import React from "react";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  appointment: AppointmentRequest;
};
const AppointmentDetailsModal = (props: Props) => {
  const userType = getUserType();

  return (
    <UIModel isOpen={props?.isOpen} onClose={props?.onClose} title="Appointment Details" cancelText="Close">
      <div>
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 30 }}>
            <Typography
              style={{
                textAlign: "center",
                display: "flex",
                alignItems: "center",
                gap: "3%",
                width: "100%",
              }}
            >
              Appointment ID: <Typography style={{ fontSize: 32 }}>{props.appointment?.case_id}</Typography>
            </Typography>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 30 }}>
            <Typography style={{ alignSelf: "center" }}>{props?.appointment?.service} Appointment</Typography>
            <StatusLabel
              text={getStatusLabel(props.appointment?.status, userType)}
              color={colorMatcher(getStatusLabel(props.appointment?.status, userType))}
            />
          </div>
          <div style={{ display: "flex", marginTop: 30 }}>
            <Typography>
              On {moment(props.appointment?.from, "YYYY-MM-DDThh:mm:ssZ").format("MMMM DD, YYYY")}
            </Typography>
            <Typography>
              &nbsp;
              {`at ${moment(props?.appointment?.from, "YYYY-MM-DDThh:mm:ssZ").format("hh:mm A")} - ${moment(
                props?.appointment?.to,
                "YYYY-MM-DDThh:mm:ssZ"
              ).format("hh:mm A")}`}
            </Typography>
          </div>
        </div>
        <div style={{ marginTop: 30 }}>
          {/* <div style={{ width: "100%" }}> */}
          <DoctorCard doctor={props?.appointment?.Provider} containerStyle={{ height: 100 }} />
          {props?.appointment?.referral_provider_id && (
            <>
              <UIHeading style={{ fontSize: 25 }} text={"Referred To"} />
              <DoctorCard doctor={props?.appointment?.ProviderReferral} containerStyle={{ height: 100 }} />
            </>
          )}

          {/* </div>
          <div style={{ width: "100%" }}> */}
          <br />
          <ConsumerCard
            patient={{
              patient_id: props?.appointment?.patient_id,
              patient_name: props?.appointment?.Patient?.User?.name,
              patient_profile: props?.appointment?.Patient?.User?.profile_picture,
            }}
            member={{
              member_id: props?.appointment?.PatientMember?.id,
              member_name: props?.appointment?.PatientMember?.member_full_name,
              patient_id: props?.appointment?.patient_id,
              type: props?.appointment?.PatientMember?.member_type,
            }}
            containerStyle={{ height: 100 }}
          />
          {/* </div> */}
        </div>
        {props.appointment?.AppointmentMedicalRecords?.length > 0 && (
          <div style={{ marginTop: "5%" }}>
            <Typography variant={"h6"}>Medical Records: </Typography>
            <ViewMedicalRecords
              medicalRecords={props?.appointment?.AppointmentMedicalRecords}
              hideId
              hideMember
              hideViewButton
            />
          </div>
        )}
      </div>
    </UIModel>
  );
};

export default AppointmentDetailsModal;
