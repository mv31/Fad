import React, { useEffect, useState } from "react";
import { ComponentWithLoader, DataTable, UIModel, UIPrimaryButton } from "@gogocode-package/ui-web";
import { gql } from "@apollo/client";
import { HeaderProps } from "@src/../../packages/ui/src/DataTable";
import * as GoGQL from "@gogocode-package/graphql_code_generator";
import StatusLabel from "@src/components/StatusLabel";
import router from "next/router";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  npi: string;
  isDoctor: boolean;
  providerId: string;
};

const FAVOFNPI = gql`
  query get_favorites_of_npi($npi: String!) {
    get_favorites_of_npi(npi: $npi) {
      id
      member_full_name
      added_doctor_to_favorite
    }
  }
`;

export const ADD_REMOVE_PROVIDER_FROM_WISHLIST = gql`
  mutation add_remove_provider_to_wishlist($npi: String!, $provider_id: String, $member_id: Float!) {
    add_remove_provider_to_wishlist(npi: $npi, provider_id: $provider_id, member_id: $member_id)
  }
`;

const header: HeaderProps[] = [
  { columnName: "Member", dataKey: "member" },
  { columnName: "Status", dataKey: "status" },
  { columnName: "Action", dataKey: "action" },
];

export const AddToFavModal = (props: Props) => {
  const [body, setBody] = useState(null);
  const [selectedMemberId, setSelectedMemberId] = useState(null);
  const checkIfDoctorIsFavorite = GoGQL.useGet_Favorites_Of_NpiQuery(FAVOFNPI, {
    variables: {
      npi: props?.npi,
    },
    fetchPolicy: "cache-and-network",
  });

  const [addOrRemoveFromFav, addOrRemoveFromFavResponse] = GoGQL.useAdd_Remove_Provider_To_WishlistMutation(
    ADD_REMOVE_PROVIDER_FROM_WISHLIST,
    {
      refetchQueries: [{ query: FAVOFNPI, variables: { npi: props?.npi } }],
    }
  );

  const renderStatus = (member: GoGQL.PatientMember) => (
    <>
      {
        <StatusLabel
          text={
            member?.added_doctor_to_favorite
              ? props?.isDoctor
                ? "Added To My Doctors"
                : "Added To My Practitioners"
              : props?.isDoctor
              ? "Not Added To My Doctors"
              : "Not Added To My Practitioners"
          }
          color={member?.added_doctor_to_favorite ? "green" : "yellow"}
        />
      }
    </>
  );
  const onClickHandler = (member: GoGQL.PatientMember) => {
    setSelectedMemberId(member?.id);
    addOrRemoveFromFav({
      variables: {
        member_id: Number(member?.id),
        npi: props?.npi,
        provider_id: props?.providerId,
      },
    });
  };
  const renderAction = (member: GoGQL.PatientMember) => (
    <>
      <ComponentWithLoader loading={member?.id == selectedMemberId && addOrRemoveFromFavResponse?.loading}>
        {member?.added_doctor_to_favorite ? (
          <UIPrimaryButton
            onClick={() => onClickHandler(member)}
            loading={member?.id == selectedMemberId && addOrRemoveFromFavResponse?.loading}
            variant="outlined"
            color="error"
          >
            Remove
          </UIPrimaryButton>
        ) : (
          <UIPrimaryButton
            onClick={() => onClickHandler(member)}
            loading={member?.id == selectedMemberId && addOrRemoveFromFavResponse?.loading}
          >
            Add
          </UIPrimaryButton>
        )}
      </ComponentWithLoader>
    </>
  );
  useEffect(() => {
    if (checkIfDoctorIsFavorite?.data?.get_favorites_of_npi) {
      setBody(
        checkIfDoctorIsFavorite?.data?.get_favorites_of_npi?.map((member: GoGQL.PatientMember) => ({
          member: member.member_full_name,
          status: renderStatus(member),
          action: renderAction(member),
        }))
      );
    }
  }, [checkIfDoctorIsFavorite?.data?.get_favorites_of_npi]);
  return (
    <UIModel
      action={
        <UIPrimaryButton
          onClick={() => {
            router.push("/consumer/dashboard?modal=true") && props?.onClose();
          }}
        >
          View MyDoctors
        </UIPrimaryButton>
      }
      hideCancel={true}
      isOpen={props?.isOpen}
      onClose={props?.onClose}
      title="Add / Remove Favorites"
      maxWidth="md"
    >
      <DataTable
        headerData={header}
        data={body}
        loading={checkIfDoctorIsFavorite?.loading}
        rawData={checkIfDoctorIsFavorite?.data?.get_favorites_of_npi}
        disablePagination
      />
    </UIModel>
  );
};
