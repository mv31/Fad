import { Button, CircularProgress } from "@mui/material";
import React, { useState } from "react";
import * as GoGQL from "@gogocode-package/graphql_code_generator";
import { gql } from "@apollo/client";
import { UIModel } from "@src/../../packages/ui/src";
import * as PullState from "@src/DataPullState";
import { AppointmentRequest } from "@gogocode-package/graphql_code_generator";
import StatusLabel from "@src/components/StatusLabel";
import CreateRequests from "../CommunicationRequests/CreateRequests";
import BookAppointmentModel from "./BookAppointmentModel";

interface Props {
  member_id: number;
  provider_id: number;
}

const GET_DOCTOR_REQUEST = gql`
  query get_communication_request($provider_id: Float!, $member_id: Float!) {
    get_communication_request(provider_id: $provider_id, member_id: $member_id) {
      id
      Provider {
        id
        services
        ProviderAppointmentServices {
          id
          service_type
        }
        User {
          first_name
          last_name
          middle_name
          gender
          email
          name
          profile_picture
        }
        ProviderAddresses {
          address_line1
          address_line2
          city
          state
          postal_code
          type
        }
        ProviderSpecialties {
          Taxonomy {
            specialty
          }
        }
      }
      PatientMember {
        id
        member_full_name
        member_type
        mobile
      }
      request_date
      status
      insurance
      Patient {
        User {
          last_name
          name
          profile_picture
        }
      }
    }
  }
`;

function ReferredButton({ member_id, referral_provider_id, ProviderReferral, PatientMember }: AppointmentRequest) {
  const Response = GoGQL.useGet_Communication_RequestQuery(GET_DOCTOR_REQUEST, {
    variables: {
      member_id: Number(member_id),
      provider_id: Number(referral_provider_id),
    },
    fetchPolicy: "no-cache",
  });
  const extractSpecialty = (data) => {
    let specialty: string[] = [];
    data?.map((tax) => {
      specialty.push(tax?.Taxonomy?.specialty);
    });
    return specialty;
  };

  const getAddress = (item) => {
    return `${item?.address_line1}, ${item?.address_line2}, ${item?.city}, ${item?.state}`;
  };
  const [selectedDoctor] = useState<PullState.SelectedDoctor>({
    firstName: ProviderReferral?.User?.first_name,
    lastName: ProviderReferral?.User?.last_name,
    address: getAddress(ProviderReferral?.User),
    city: ProviderReferral?.User?.city || "",
    state: ProviderReferral?.User?.state || "",
    zip: ProviderReferral?.User?.zip || "",
    mobile: ProviderReferral?.User?.mobile,
    gender: ProviderReferral?.User?.gender,
    credentials: ProviderReferral?.degrees,
    addressLine1: ProviderReferral?.User?.address_line1,
    addressLine2: ProviderReferral?.User?.address_line2,
    specialties: extractSpecialty(ProviderReferral?.ProviderSpecialties),
    providerId: Number(ProviderReferral?.id),
  });

  const [openBookAppointmentModal, setOpenBookAppointmentModal] = useState<boolean>(false);
  const [openCreateCommunicationRequestModal, setOpenCreateCommunicationRequestModal] = useState<boolean>(false);
  if (Response.loading) {
    return (
      <div style={{ flex: 1, display: "flex", justifyContent: "center", margin: 20, marginTop: 40 }}>
        <CircularProgress color="success" />
      </div>
    );
  } else {
    return (
      <>
        {Response?.data?.get_communication_request && (
          <>
            {Response?.data?.get_communication_request?.status === GoGQL.DoctorRequestStatus.Accepted && (
              <Button
                onClick={() => {
                  setOpenBookAppointmentModal(true);
                }}
              >
                Book Appointment
              </Button>
            )}
            {Response?.data?.get_communication_request?.status === GoGQL.DoctorRequestStatus.Pending && (
              <StatusLabel text="Eligibility Request Pending" color="yellow" />
            )}
          </>
        )}
        {(!Response?.data?.get_communication_request ||
          Response?.data?.get_communication_request?.status == GoGQL.DoctorRequestStatus.Denied) && (
          <Button
            onClick={() => {
              setOpenCreateCommunicationRequestModal(true);
              PullState.CommunicationRequestStates.update((s) => {
                s.selectedDoctor = selectedDoctor;
              });
            }}
          >
            Create Eligibility Request
          </Button>
        )}
        <UIModel
          maxWidth={"lg"}
          isOpen={openCreateCommunicationRequestModal}
          onClose={() => {
            setOpenCreateCommunicationRequestModal(false);
            Response.refetch();
          }}
        >
          <CreateRequests
            modalClose={() => {
              setOpenCreateCommunicationRequestModal(false);
              Response.refetch({
                member_id: Number(member_id),
                provider_id: Number(referral_provider_id),
              });
            }}
            disableDoctorNameEdit
            disableMemberNameEdit
            member_id={PatientMember}
          />
        </UIModel>
        <BookAppointmentModel
          isOpen={openBookAppointmentModal}
          onClose={() => {
            setOpenBookAppointmentModal(false);
          }}
          selectedRequest={Response?.data?.get_communication_request}
        />
      </>
    );
  }
}

export default ReferredButton;
