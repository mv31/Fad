import { gql } from "@apollo/client";
import { EllipsisText, UIModel, UIPrimaryButton } from "@src/../../packages/ui/src";
import React, { useState } from "react";
import { createStyles, makeStyles } from "@mui/styles";
import { QuickViewStates } from "@src/DataPullState";
import { useRouter } from "next/router";
import { PatientRoutes } from "@src/routes/DashboardRoutes";
import { MedicalRecords } from "../../MedicaRecords/MedicalRecords";

type Props = {
  isOpen: boolean;
  onClose: () => void;
};
export const GET_RECORDS = gql`
  query {
    get_records {
      rows {
        id
        signed_url
        record_url
      }
      count
    }
  }
`;

const ViewRecordsModal = (props: Props) => {
  const router = useRouter();
  const isShowAll = QuickViewStates.useState((s) => s.isShowAll);
  return (
    <UIModel
      isOpen={props?.isOpen}
      onClose={props?.onClose}
      title={"Medical Records"}
      cancelText="Close"
      maxWidth="lg"
      action={
        isShowAll && (
          <>
            <UIPrimaryButton
              onClick={() => {
                props?.onClose();
                router.push(PatientRoutes.Medical_Records);
              }}
            >
              Show All
            </UIPrimaryButton>
          </>
        )
      }
    >
      <MedicalRecords pagination={false} limit={5} />
    </UIModel>
  );
};

export default ViewRecordsModal;

const useStyles = makeStyles(() =>
  createStyles({
    card: {
      height: 180,
      width: "25%",
    },
  })
);
