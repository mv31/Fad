import {
  Paper,
  Typography,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button,
  IconButton,
  useTheme,
  CircularProgress,
} from "@mui/material";
import { DeleteOutlined, EditLocation, EditOutlined, EditRounded } from "@mui/icons-material";
import AddIcon from "@mui/icons-material/Add";
import { makeStyles } from "@mui/styles";
import React, { useState } from "react";
import { UIPrimaryButton } from "@src/../../packages/ui/src";
import * as GoGQL from "@gogocode-package/graphql_code_generator";
import SpecializationModel from "./SpecializationModel";
import { gql } from "@apollo/client";
import _ from "lodash";
import { StyledTableCell } from "@src/components/dashboard/StyledTableComponents";
import { GetUpdateStatus, GET_UPDATE_STATUS } from "../GetUpdateStatus";
import ConfirmationPrompt from "@src/components/ConfirmationPrompt";

export const ADD_PROVIDER_SPECIALTIES = gql`
  mutation update_doctor_membership_info_provider_speciality(
    $input: ProviderSpecialtyInput!
    $row_id: Float
    $operation: DBOperation!
  ) {
    update_doctor_membership_info_provider_speciality(input: $input, row_id: $row_id, operation: $operation)
  }
`;

export const FETCH_PROVIDER_SPECIALTIES = gql`
  query view_doctor_membership_info($includes: [ViewDoctorIncludesEnum!]!) {
    view_doctor_membership_info(includes: $includes) {
      ProviderSpecialties {
        id
        taxonomy_id
        expertise
        Taxonomy {
          id
          specialty
          sub_specialty
        }
      }
    }
  }
`;

const Specialization = () => {
  const styles = useStyles();
  const theme = useTheme();
  const [modelType, setModelType] = useState<"Add" | "Edit">(null);
  const [selectedSpecialty, setSelectedSpecialty] = useState(null);
  const [conformPromptOpen, setConformPromptOpen] = useState<boolean>(false);
  const ProviderSpecialties = GoGQL.useView_Doctor_Membership_InfoQuery(FETCH_PROVIDER_SPECIALTIES, {
    variables: {
      includes: [GoGQL.ViewDoctorIncludesEnum.Specialties],
    },
  });

  const [updateProviderSpecialtiesRequest, updateProviderSpecialtiesResponse] =
    GoGQL.useUpdate_Doctor_Membership_Info_Provider_SpecialityMutation(ADD_PROVIDER_SPECIALTIES, {
      refetchQueries: [
        {
          query: FETCH_PROVIDER_SPECIALTIES,
          variables: {
            includes: [GoGQL.ViewDoctorIncludesEnum.Specialties],
          },
        },
        {
          query: GET_UPDATE_STATUS,
          variables: {
            section: GoGQL.ViewDoctorIncludesEnum.Specialties,
          },
        },
      ],
    });

  const onDelete = () => {
    setConformPromptOpen(false);
    let updatedSpecialties = ProviderSpecialties?.data?.view_doctor_membership_info?.ProviderSpecialties?.filter(
      (specialty) => specialty?.id == selectedSpecialty?.id
    ).map((specialty) => {
      return {
        specialty: specialty?.Taxonomy?.specialty,
        subSpecialty: specialty?.Taxonomy?.sub_specialty || null,
        taxonomy_id: specialty?.taxonomy_id,
        expertise: specialty?.expertise || null,
      };
    });
    updateProviderSpecialtiesRequest({
      variables: {
        input: updatedSpecialties[0],
        operation: GoGQL?.DbOperation?.Delete,
        row_id: Number(selectedSpecialty?.id),
      },
    });
  };

  return (
    <Paper className={styles.paper} style={{ padding: "5%" }}>
      <div style={{ display: "flex" }}>
        <Typography variant="h5" color={theme.palette.primary.main} style={{ margin: "1%" }}>
          Specialization
        </Typography>
        <GetUpdateStatus
          pendingStatusText="Pending with Admin Approval"
          section={GoGQL.ViewDoctorIncludesEnum.Specialties}
        />
      </div>
      <TableContainer
        style={{
          borderRadius: 10,
          marginTop: 30,
          width: "100%",
        }}
        component={Paper}
      >
        <Table aria-label="simple table">
          <TableHead>
            <TableRow style={{ backgroundColor: theme.palette.primary.main }}>
              <StyledTableCell style={{ minWidth: "25%", fontSize: 18, fontWeight: 600, color: "white" }}>
                Specialty
              </StyledTableCell>
              <StyledTableCell
                align="center"
                style={{ minWidth: "25%", fontSize: 18, fontWeight: 600, color: "white" }}
              >
                Sub-Specialty
              </StyledTableCell>
              <StyledTableCell
                align="center"
                style={{ minWidth: "25%", fontSize: 18, fontWeight: 600, color: "white" }}
              >
                Expertise
              </StyledTableCell>
              <StyledTableCell
                align="center"
                style={{ minWidth: "25%", fontSize: 18, fontWeight: 600, color: "white" }}
              >
                Actions
              </StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {ProviderSpecialties?.data?.view_doctor_membership_info?.ProviderSpecialties?.map((specialty) => (
              <TableRow key={specialty?.id}>
                <StyledTableCell component="th">{specialty?.Taxonomy?.specialty}</StyledTableCell>
                <StyledTableCell align="center">{specialty?.Taxonomy?.sub_specialty}</StyledTableCell>
                <StyledTableCell align="center">{specialty?.expertise || "-"}</StyledTableCell>
                <StyledTableCell align="center">
                  <div style={{ display: "flex", gap: "2%", justifyContent: "center" }}>
                    {
                      <IconButton
                        onClick={() => {
                          setSelectedSpecialty(specialty);
                          setModelType("Edit");
                        }}
                      >
                        <EditRounded htmlColor={theme.palette.primary.main} />
                      </IconButton>
                    }
                    {
                      <IconButton
                        onClick={() => {
                          setConformPromptOpen(true);
                          setSelectedSpecialty(specialty);
                          // onDelete(specialty?.id);
                        }}
                      >
                        <DeleteOutlined htmlColor={theme.palette.primary.main} />
                      </IconButton>
                    }
                  </div>
                </StyledTableCell>
              </TableRow>
            ))}
            {ProviderSpecialties?.data?.view_doctor_membership_info?.ProviderSpecialties?.length == 0 && (
              <TableRow>
                <StyledTableCell colSpan={6} style={{ textAlign: "center" }}>
                  {" "}
                  <Typography>No Specialization Found</Typography>
                </StyledTableCell>
              </TableRow>
            )}
            {ProviderSpecialties?.loading && (
              <TableRow>
                <StyledTableCell colSpan={6} style={{ textAlign: "center" }}>
                  <CircularProgress color="success" />
                </StyledTableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <div style={{ display: "flex", justifyContent: "center", marginTop: "2%" }}>
        <UIPrimaryButton onClick={() => setModelType("Add")}>
          <AddIcon />
          Add
        </UIPrimaryButton>
      </div>
      <SpecializationModel
        isOpen={modelType == "Add" || modelType == "Edit"}
        onClose={() => {
          setModelType(null);
          setSelectedSpecialty(null);
        }}
        modelType={modelType}
        providerSpecialties={ProviderSpecialties?.data?.view_doctor_membership_info?.ProviderSpecialties}
        selectedSpecialty={selectedSpecialty}
      />
      <ConfirmationPrompt
        action={onDelete}
        isOpen={conformPromptOpen}
        onClose={() => {
          setConformPromptOpen(false);
          setSelectedSpecialty(null);
        }}
        message="Are You sure to delete this Specialization"
        title={"Conformation Prompt"}
        actionLoading={updateProviderSpecialtiesResponse?.loading}
      />
    </Paper>
  );
};

const useStyles = makeStyles({
  paper: {
    justifySelf: "center",
    margin: "5%",
    width: "100%",
    borderRadius: 5,
    border: "1px solid #E0E0E0",
  },
});

export default Specialization;
