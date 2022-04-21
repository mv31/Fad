import { Button, Grid, Theme, Typography } from "@mui/material";
import {
  useUpdate_Doctor_Membership_Info_CertificationsMutation,
  useView_Doctor_Membership_InfoQuery,
  ViewDoctorIncludesEnum,
} from "@gogocode-package/graphql_code_generator";
import * as GoGQL from "@gogocode-package/graphql_code_generator";
import _ from "lodash";
import React, { useState } from "react";
import { FETCH_CERTIFICATION_DETAILS } from "./CertificationDetails";
import CertificationModal, { UPDATE_CERTIFICATIONS } from "./CertificationModal";
import { makeStyles } from "@mui/styles";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import IconButton from "@mui/material/IconButton";
import DeleteOutlineRounded from "@mui/icons-material/DeleteOutlineRounded";
import AddIcon from "@mui/icons-material/Add";
import { gql } from "@apollo/client";
import { UILoader, useSuccessNotification } from "@gogocode-package/ui-web";
import ConfirmationPrompt from "@src/components/ConfirmationPrompt";
import { GET_UPDATE_STATUS } from "../GetUpdateStatus";

type CertificationChildProps = {
  item: any;
  onEdit: () => void;
  onDelete: () => void;
};

const CertificationChildCard = (props: CertificationChildProps) => {
  const { item, onEdit, onDelete } = props;
  const styles = useStyles();
  return (
    <>
      <div
        style={{
          border: "1px solid #E0E0E0",
          display: "flex",
          justifyContent: "space-between",
          margin: "1%",
          borderRadius: 5,
        }}
      >
        <div style={{ margin: "1%" }}>
          <Typography variant="subtitle1" fontSize={20}>
            {item?.name}
          </Typography>
          <Typography style={{ marginTop: "2%" }}>General Certificate</Typography>
          <div style={{ display: "flex" }}>
            <Typography variant="inherit">{`${item?.general || "-"} : `}</Typography>
            <Typography variant="inherit">&nbsp;{`${item?.general_year_certified || "-"}`}</Typography>
          </div>
          <Typography style={{ marginTop: "2%" }}>Sub Specialty Certificate</Typography>
          <div style={{ display: "flex" }}>
            <Typography variant="inherit">{`${item?.sub_specialty || "-"} : `} </Typography>
            <Typography variant="inherit">&nbsp;{`${item?.sub_specialty_year_certified || "-"}`}</Typography>
          </div>
        </div>
        <div style={{ display: "flex", marginRight: "2%" }}>
          <IconButton color="primary" className={styles.iconDiv} onClick={onEdit}>
            <EditRoundedIcon />
          </IconButton>

          <IconButton color="primary" className={styles.iconDiv} onClick={onDelete}>
            <DeleteOutlineRounded />
          </IconButton>
        </div>
      </div>
    </>
  );
};

export function Certifications() {
  const responses = useView_Doctor_Membership_InfoQuery(FETCH_CERTIFICATION_DETAILS, {
    variables: {
      includes: [ViewDoctorIncludesEnum.Certifications],
    },
    fetchPolicy: "network-only",
  });
  const Certifications = responses?.data?.view_doctor_membership_info?.ProviderCertifications;
  const [type, setType] = useState<"Add" | "Edit">(null);
  const [conformPromptOpen, setConformPromptOpen] = useState<boolean>(false);
  const [updateCertificationsRequest, updateCertificationsResponse] =
    useUpdate_Doctor_Membership_Info_CertificationsMutation(UPDATE_CERTIFICATIONS, {
      refetchQueries: [
        {
          query: FETCH_CERTIFICATION_DETAILS,
          variables: {
            includes: [ViewDoctorIncludesEnum.Certifications],
          },
        },
        {
          query: GET_UPDATE_STATUS,
          variables: {
            section: GoGQL.ViewDoctorIncludesEnum.Certifications,
          },
        },
      ],
    });
  const [currentCertificate, setCurrentCertificate] = useState<GoGQL.ProviderCertifications>(null);

  const onDelete = () => {
    setConformPromptOpen(false);
    updateCertificationsRequest({
      variables: {
        input: _.omit(currentCertificate, ["__typename", "id"]),
        row_id: Number(currentCertificate?.id),
        operation: GoGQL.DbOperation.Delete,
      },
    });
  };

  useSuccessNotification([updateCertificationsResponse?.data?.update_doctor_membership_info_certifications]);

  return (
    <>
      {responses?.data?.view_doctor_membership_info?.ProviderCertifications?.map((item, index) => (
        <CertificationChildCard
          key={index}
          item={item}
          onEdit={() => {
            setType("Edit");
            setCurrentCertificate(item);
          }}
          onDelete={() => {
            setConformPromptOpen(true);
            setCurrentCertificate(item);
          }}
        />
      ))}
      {responses?.data?.view_doctor_membership_info?.ProviderCertifications?.length == 0 && (
        <Typography style={{ display: "flex", justifyContent: "center" }}>No Records found</Typography>
      )}
      {responses?.loading && (
        <Grid style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}>
          <UILoader loading={responses?.loading} />
        </Grid>
      )}{" "}
      <Grid mt={3} mb={3} justifyContent="center" textAlign="center">
        <Button
          variant="contained"
          color="primary"
          onClick={() => {
            setType("Add");
          }}
        >
          <AddIcon />
          ADD
        </Button>
      </Grid>
      <CertificationModal
        isOpen={type == "Edit" || type == "Add"}
        onClose={() => {
          responses.refetch();
          setCurrentCertificate(null);
          setType(null);
        }}
        type={type}
        certifications={Certifications}
        currentCertificate={currentCertificate}
      />
      <ConfirmationPrompt
        action={onDelete}
        isOpen={conformPromptOpen}
        onClose={() => {
          setConformPromptOpen(false);
          setCurrentCertificate(null);
        }}
        message="Are You sure to delete this Certificate"
        title={"Conformation Prompt"}
        actionLoading={updateCertificationsResponse?.loading}
      />
    </>
  );
}

const useStyles = makeStyles((theme: Theme) => ({
  iconDiv: {
    margin: "1%",
    display: "flex",
    justifyContent: "center",
    justifySelf: "center",
    alignSelf: "center",
    alignItems: "center",
    borderRadius: 50,
    width: 40,
    height: 40,
    cursor: "pointer",
    //border: `1px solid ${theme.palette.primary.main}`,
    color: theme.palette.primary.main,
  },
}));
