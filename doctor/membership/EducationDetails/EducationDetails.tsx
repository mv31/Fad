import { Grid, Paper, Typography, Button, CircularProgress, useTheme, Theme } from "@mui/material";
import { makeStyles } from "@mui/styles";
import React, { useState } from "react";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import DeleteOutlineRounded from "@mui/icons-material/DeleteOutlineRounded";
import IconButton from "@mui/material/IconButton";
import { gql } from "@apollo/client";
import AddIcon from "@mui/icons-material/Add";
import { UILoader } from "@gogocode-package/ui-web";
import {
  ProviderSchool,
  useUpdate_Doctor_Membership_Info_SchoolsMutation,
  useView_Doctor_Membership_InfoQuery,
  ViewDoctorIncludesEnum,
} from "@gogocode-package/graphql_code_generator";
import * as GoGQL from "@gogocode-package/graphql_code_generator";
import _ from "lodash";
import EducationModal, { CREATE_DOCTOR_EDUCATION } from "./EducationModal";
import { generateLocation } from "@src/utils";
import Specialization from "./Specialization";
import { GetUpdateStatus, GET_UPDATE_STATUS } from "../GetUpdateStatus";
import ConfirmationPrompt from "@src/components/ConfirmationPrompt";

export const FETCH_DOCTOR_EDUCATION_INFO = gql`
  query view_doctor_membership_info($includes: [ViewDoctorIncludesEnum!]!) {
    view_doctor_membership_info(includes: $includes) {
      ProviderSchools {
        id
        school
        state
        city
        country
        year_from
        year_to
        year_graduated
      }
    }
  }
`;

const EducationChildCard = (props) => {
  const { item, onEdit, schools } = props;
  const styles = useStyles();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedData, setSelectedData] = useState(null);
  const location = generateLocation(props?.city, props?.state, props?.country);
  const [deleteDoctorEducationRequest, deleteDoctorEducationResponse] =
    useUpdate_Doctor_Membership_Info_SchoolsMutation(CREATE_DOCTOR_EDUCATION, {
      refetchQueries: [
        {
          query: FETCH_DOCTOR_EDUCATION_INFO,
          variables: {
            includes: ViewDoctorIncludesEnum.School,
          },
        },
        {
          query: GET_UPDATE_STATUS,
          variables: {
            section: GoGQL.ViewDoctorIncludesEnum.School,
          },
        },
      ],
    });
  const onDelete = () => {
    setIsOpen(false);
    deleteDoctorEducationRequest({
      variables: {
        input: _.omit(selectedData, ["__typename", "id"]),
        row_id: Number(selectedData?.id),
        operation: GoGQL.DbOperation.Delete,
      },
    });
  };

  return (
    <>
      <div
        style={{
          border: "1px solid #E0E0E0",
          display: "flex",
          justifyContent: "space-between",
          margin: "1%",
          borderRadius: 5,
          alignItems: "center",
        }}
      >
        <div style={{ margin: "1%" }}>
          <Typography style={{ fontSize: 24 }}>{props.school}</Typography>
          <div style={{ display: "flex", alignItems: "center" }}>
            <Typography style={{ fontSize: 20 }}>{`${props.yearFrom || "-"} - ${props.yearTo || "-"} , `}</Typography>
            <div style={{ display: "flex", alignItems: "center", marginLeft: 20 }}>
              <Typography style={{ fontWeight: 600, color: "#555", fontSize: 18 }}>Graduated Year :</Typography>
              <Typography variant="inherit" ml={1}>
                {props.yearGraduated || "-"}
              </Typography>
            </div>
          </div>
          <Typography variant="inherit" fontSize={17} style={{ fontStyle: "italic", marginTop: 5 }}>
            {location}
          </Typography>
        </div>
        {deleteDoctorEducationResponse.loading && (
          <div style={{ marginRight: "2%", display: "flex", alignItems: "center", gap: "10%" }}>
            <CircularProgress />
          </div>
        )}
        {!deleteDoctorEducationResponse.loading && (
          <div style={{ marginRight: "2%", display: "flex", alignItems: "center", gap: "10%" }}>
            <IconButton className={styles.iconDiv} onClick={onEdit}>
              <EditRoundedIcon />
            </IconButton>

            <IconButton
              className={styles.iconDiv}
              onClick={() => {
                setSelectedData(item);
                setIsOpen(true);
              }}
            >
              <DeleteOutlineRounded />
            </IconButton>
          </div>
        )}
      </div>
      <ConfirmationPrompt
        action={onDelete}
        isOpen={isOpen}
        onClose={() => {
          setIsOpen(false);
          setSelectedData(null);
        }}
        message="Are You sure to delete this School"
        title={"Conformation Prompt"}
        actionLoading={deleteDoctorEducationResponse?.loading}
      />
    </>
  );
};

const EducationDetails = () => {
  const styles = useStyles();
  const theme = useTheme();
  const [selectedSchool, setSelectedSchool] = useState<ProviderSchool>(null);
  const [type, setType] = useState<"Add" | "Edit">(null);
  const doctorEducationResponse = useView_Doctor_Membership_InfoQuery(FETCH_DOCTOR_EDUCATION_INFO, {
    variables: {
      includes: ViewDoctorIncludesEnum.School,
    },
  });

  return (
    <div style={{ justifyContent: "center", width: "92%" }}>
      <Paper className={styles.paper}>
        <div style={{ display: "flex", alignItems: "Center", gap: "2%" }}>
          <Typography variant="h5" color={theme.palette.primary.main} style={{ margin: "1%" }}>
            Medical Schools
          </Typography>
          <GetUpdateStatus
            pendingStatusText="Pending with Admin Approval"
            section={GoGQL.ViewDoctorIncludesEnum.School}
          />
        </div>
        {doctorEducationResponse?.data?.view_doctor_membership_info?.ProviderSchools?.map((data, idx) => (
          <>
            <EducationChildCard
              key={idx}
              item={data}
              school={data?.school}
              yearGraduated={data?.year_graduated}
              state={data?.state}
              city={data?.city}
              country={data?.country}
              yearFrom={data?.year_from}
              yearTo={data?.year_to}
              onEdit={() => {
                setType("Edit");
                setSelectedSchool(data);
              }}
              schools={doctorEducationResponse?.data?.view_doctor_membership_info?.ProviderSchools}
            />
          </>
        ))}
        {doctorEducationResponse?.data?.view_doctor_membership_info?.ProviderSchools?.length == 0 && (
          <Typography style={{ display: "flex", justifyContent: "center" }}>No Records found</Typography>
        )}
        {doctorEducationResponse?.loading && (
          <Grid style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}>
            <UILoader loading={doctorEducationResponse?.loading} />
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
      </Paper>

      <Specialization />

      <EducationModal
        isOpen={type == "Edit" || type == "Add"}
        onClose={() => {
          setType(null);
          setSelectedSchool(null);
        }}
        type={type}
        schools={doctorEducationResponse?.data?.view_doctor_membership_info?.ProviderSchools}
        selectedSchool={selectedSchool}
      />
    </div>
  );
};

const useStyles = makeStyles((theme: Theme) => ({
  paper: {
    justifySelf: "center",
    margin: "5%",
    width: "100%",
    borderRadius: 5,
    border: "1px solid #E0E0E0",
  },
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
    color: theme.palette.primary.main,
  },
}));

export default EducationDetails;
