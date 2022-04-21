import {
  ProviderHospitalAffliation,
  useView_Doctor_Membership_InfoQuery,
  ViewDoctorIncludesEnum,
} from "@gogocode-package/graphql_code_generator";
import { Typography, Grid, Button, Theme } from "@mui/material";
import { UILoader } from "@gogocode-package/ui-web";
import React, { useEffect, useState } from "react";
import IconButton from "@mui/material/IconButton";
import HospitalModel, { UPDATE_HOSPITALS } from "./HospitalModel";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import DeleteOutlineRounded from "@mui/icons-material/DeleteOutlineRounded";
import AddIcon from "@mui/icons-material/Add";
import * as GoGQL from "@gogocode-package/graphql_code_generator";
import { makeStyles } from "@mui/styles";
import _ from "lodash";
import { gql } from "@apollo/client";
import ConfirmationPrompt from "@src/components/ConfirmationPrompt";
import { GET_UPDATE_STATUS } from "../GetUpdateStatus";

export const FETCH_HOSPITAL_AFFLIATIONS_DETAILS = gql`
  query view_doctor_membership_info($includes: [ViewDoctorIncludesEnum!]!) {
    view_doctor_membership_info(includes: $includes) {
      ProviderHospitalAffliations {
        id
        state
        city
        hospital
        year_started
        order_no
      }
    }
  }
`;

type ChildCardProps = {
  data: any;
  onEdit: () => void;
  onDelete: () => void;
};
const ChildCard = (props: ChildCardProps) => {
  const styles = useStyles();
  const textColor = "rgba(115, 115, 115, 1)";
  return (
    <div
      style={{
        border: "1px solid #E0E0E0",
        display: "flex",
        justifyContent: "space-between",
        margin: "1%",
        borderRadius: 5,
        backgroundColor: "fff",
      }}
    >
      <div style={{ margin: "1%" }}>
        <Typography variant="subtitle1" fontSize={20}>
          {props?.data?.hospital}
        </Typography>
        <div style={{ display: "flex" }}>
          <Typography>Year Started : </Typography>
          <Typography ml={1} fontSize={20} color={textColor}>
            {props?.data?.year_started || "-"}
          </Typography>
        </div>
        <div style={{ display: "flex" }}>
          <Typography>City : </Typography>
          <Typography ml={1} fontSize={20} color={textColor}>
            {props?.data?.city || "-"}
          </Typography>
        </div>
        <div style={{ display: "flex" }}>
          <Typography>State : </Typography>
          <Typography ml={1} fontSize={20} color={textColor}>
            {props?.data.state || "-"}
          </Typography>
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", marginRight: "2%", justifyContent: "space-between" }}>
        <IconButton color="primary" className={styles.iconDiv} onClick={props?.onEdit}>
          <EditRoundedIcon />
        </IconButton>

        <IconButton color="primary" className={styles.iconDiv} onClick={props?.onDelete}>
          <DeleteOutlineRounded />
        </IconButton>
      </div>
    </div>
  );
};

export default function Hospital() {
  const hospitalAffiliations = useView_Doctor_Membership_InfoQuery(FETCH_HOSPITAL_AFFLIATIONS_DETAILS, {
    variables: {
      includes: [ViewDoctorIncludesEnum.HospitalAffliation],
    },
    fetchPolicy: "network-only",
  });
  const [type, setType] = useState<"Add" | "Edit">(null);
  const [selectedHospital, setSelectedHospital] = useState<ProviderHospitalAffliation>(null);
  const [conformPromptOpen, setConformPromptOpen] = useState<boolean>(false);
  const [deleteHospitalsRequest, deleteHospitalsResponse] =
    GoGQL.useUpdate_Doctor_Membership_Info_Hospital_AffliationMutation(UPDATE_HOSPITALS, {
      refetchQueries: [
        {
          query: FETCH_HOSPITAL_AFFLIATIONS_DETAILS,
          variables: {
            includes: [ViewDoctorIncludesEnum.HospitalAffliation],
          },
        },
        {
          query: GET_UPDATE_STATUS,
          variables: {
            section: GoGQL.ViewDoctorIncludesEnum.HospitalAffliation,
          },
        },
      ],
    });
  useEffect(() => {
    if (hospitalAffiliations && hospitalAffiliations?.data) {
      console.log(
        "hospitalAffiliations",
        hospitalAffiliations?.data?.view_doctor_membership_info?.ProviderHospitalAffliations
      );
    }
  }, []);
  const onDelete = () => {
    setConformPromptOpen(false);
    deleteHospitalsRequest({
      variables: {
        input: _.omit(selectedHospital, ["__typename", "id"]),
        row_id: Number(selectedHospital?.id),
        operation: GoGQL.DbOperation.Delete,
      },
    });
  };
  return (
    <>
      {hospitalAffiliations?.data?.view_doctor_membership_info?.ProviderHospitalAffliations?.map((item, index) => (
        <ChildCard
          key={index}
          data={item}
          onEdit={() => {
            setSelectedHospital(item);
            setType("Edit");
          }}
          onDelete={() => {
            setConformPromptOpen(true);
            setSelectedHospital(item);
          }}
        />
      ))}
      {hospitalAffiliations?.data?.view_doctor_membership_info?.ProviderHospitalAffliations?.length == 0 && (
        <Typography style={{ display: "flex", justifyContent: "center" }}>No Records found</Typography>
      )}
      {hospitalAffiliations?.loading && (
        <Grid style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}>
          <UILoader loading={hospitalAffiliations?.loading} />
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
      <HospitalModel
        isOpen={type == "Add" || type == "Edit"}
        onClose={() => {
          setType(null);
        }}
        prevData={hospitalAffiliations?.data?.view_doctor_membership_info?.ProviderHospitalAffliations}
        selectedHospital={selectedHospital}
        type={type}
      />
      <ConfirmationPrompt
        action={onDelete}
        isOpen={conformPromptOpen}
        onClose={() => setConformPromptOpen(false)}
        message="Are You sure to delete this License"
        title={"Conformation Prompt"}
        actionLoading={deleteHospitalsResponse?.loading}
      />
    </>
  );
}

const useStyles = makeStyles((theme: Theme) => ({
  paper: {
    // elevation: 2,
    justifySelf: "center",
    margin: "5%",
    marginBottom: "2%",
    width: "100%",
    borderRadius: 5,
    border: "1px solid #E0E0E0",
  },
  iconDiv: {
    margin: "1%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 50,
    width: 40,
    height: 40,
    cursor: "pointer",
    //border: `1px solid ${theme.palette.primary.main}`,
    color: theme.palette.primary.main,
  },
  paper2: {
    margin: "5%",
    justifySelf: "center",
    borderRadius: 10,
    border: `1px solid ${theme.palette.primary.main}`,
    width: "90%",
  },
}));
