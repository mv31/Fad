import { AppointmentRequest } from "@gogocode-package/graphql_code_generator";
import { UIModel, UIPrimaryButton, useSnackbar } from "@gogocode-package/ui-web";
import React, { useEffect, useState } from "react";
import BookingCalendar from "./BookingCalendar";
import * as GoGQL from "@gogocode-package/graphql_code_generator";
import moment from "moment";
import { gql } from "@apollo/client";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  selectedAppointment: AppointmentRequest;
};

const MAKE_RESCHEDULE = gql`
  mutation reschedule_an_appointment($from: DateTime!, $id: Float!) {
    reschedule_an_appointment(from: $from, id: $id) {
      id
      from
      to
    }
  }
`;
const RescheduleModel = (props: Props) => {
  const { enqueueSnackbar } = useSnackbar();

  const [dateValue, setDateValue] = useState<Date | null>(null);
  const [timeSlots, setTimeSlots] = useState(null);

  const [makeRescheduleRequest, makeRescheduleResponse] = GoGQL.useReschedule_An_AppointmentMutation(MAKE_RESCHEDULE);

  const isValid = () => {
    if (timeSlots == null || timeSlots == undefined) {
      enqueueSnackbar("Please select time slots", { variant: "error" });
      return false;
    }
    return true;
  };

  const onSend = () => {
    if (isValid()) {
      makeRescheduleRequest({
        variables: {
          from: moment(
            moment(dateValue).format("YYYY-MM-DD") + " " + moment(timeSlots.split("-")[0], "hh:mm a").format("HH:mm")
          ).toDate(),
          id: Number(props?.selectedAppointment?.id),
        },
      });
    }
  };

  useEffect(() => {
    if (makeRescheduleResponse.data && makeRescheduleResponse.data?.reschedule_an_appointment) {
      enqueueSnackbar("Appointment Rescheduled", { variant: "success" });
      props?.onClose();
    }
  }, [makeRescheduleResponse.data]);

  return (
    <UIModel
      isOpen={props?.isOpen}
      onClose={props?.onClose}
      action={
        <UIPrimaryButton loading={makeRescheduleResponse?.loading} onClick={onSend}>
          {props?.selectedAppointment?.status == GoGQL.AppointmentRequestStatus.Pending ? "Edit" : "Reschedule"}
        </UIPrimaryButton>
      }
      maxWidth="lg"
      title={
        props?.selectedAppointment?.status == GoGQL.AppointmentRequestStatus.Pending
          ? "Edit Appointment"
          : "Reschedule Appointment"
      }
    >
      <BookingCalendar
        member_id={props?.selectedAppointment?.PatientMember?.id}
        provider_id={props?.selectedAppointment?.provider_id}
        setDate={setDateValue}
        setTimeSlots={setTimeSlots}
        selectedAppointment={props?.selectedAppointment}
      />
    </UIModel>
  );
};

export default RescheduleModel;
