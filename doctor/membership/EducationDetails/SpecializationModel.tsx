import { Autocomplete, InputAdornment, TextField, Typography } from "@mui/material";
import { UILoader, UIModel, UIPrimaryButton, useSnackbar } from "@gogocode-package/ui-web";
import * as GoGraphql from "@gogocode-package/graphql_code_generator";
import React, { useEffect, useState } from "react";
import { SEARCH_SPECIALITIES, SEARCH_SUB_SPECIALITIES } from "@src/components/Search/SpecialityModal";
import { createStyles, makeStyles } from "@mui/styles";
import { ADD_PROVIDER_SPECIALTIES, FETCH_PROVIDER_SPECIALTIES } from "./Specialization";
import { gql } from "@apollo/client";
import _ from "lodash";
import { emptyCheck } from "@src/utils";
import { GET_UPDATE_STATUS } from "../GetUpdateStatus";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  modelType: "Add" | "Edit";
  providerSpecialties: GoGraphql.ProviderSpecialty[];
  selectedSpecialty: GoGraphql.ProviderSpecialty;
};

const FETCH_SPECIALTIES = gql`
  query get_taxonomies($specialty: String!) {
    get_taxonomies(specialty: $specialty) {
      specialty
    }
  }
`;

const FETCH_SUB_SPECIALTIES = gql`
  query fetch_subspecialties_of_specialty($specialty: String!) {
    fetch_subspecialties_of_specialty(specialty: $specialty) {
      id
      sub_specialty
    }
  }
`;

const FETCH_EXPERTISE = gql`
  query fetch_expertises($specialty: String!, $sub_specialty: String!) {
    fetch_expertises(specialty: $specialty, sub_specialty: $sub_specialty) {
      id
      expertise
    }
  }
`;

const GET_TAXONOMY_FROM_SPECIALTY = gql`
  query get_taxonomy_from_specialty($specialty: String!) {
    get_taxonomy_from_specialty(specialty: $specialty) {
      id
    }
  }
`;

const SpecializationModel = (props: Props) => {
  const styles = useStyles();
  const [specialty, setSpecialty] = useState<{ id?: string; specialty: string }>(null);
  const [subSpecialty, setSubSpecialty] = useState<{ id: string; subSpecialty: string }>(null);
  const [expertise, setExpertise] = useState<{ id: string; expertise: string }>(null);
  const { enqueueSnackbar } = useSnackbar();
  useEffect(() => {
    if (props?.selectedSpecialty) {
      setSpecialty({
        id: String(props?.selectedSpecialty?.Taxonomy?.id),
        specialty: props?.selectedSpecialty?.Taxonomy?.specialty,
      });
      setSubSpecialty({
        id: String(props?.selectedSpecialty?.Taxonomy?.id),
        subSpecialty: props?.selectedSpecialty?.Taxonomy?.sub_specialty,
      });
      setExpertise({
        id: String(props?.selectedSpecialty?.Taxonomy?.id),
        expertise: props?.selectedSpecialty?.expertise,
      });
    }
  }, [props?.selectedSpecialty]);
  const [searchSpecialtiesRequest, searchSpecialtiesResponse] = GoGraphql.useGet_TaxonomiesLazyQuery(
    FETCH_SPECIALTIES,
    { fetchPolicy: "network-only" }
  );

  useEffect(() => {
    searchSpecialtiesRequest({
      variables: {
        specialty: specialty?.specialty || "",
      },
    });
  }, []);

  const [searchSubSpecialty, searchSubSpecialtyResponse] = GoGraphql.useFetch_Subspecialties_Of_SpecialtyLazyQuery(
    FETCH_SUB_SPECIALTIES,
    { fetchPolicy: "network-only" }
  );

  const [fetchExpertiseRequest, fetchExpertiseResponse] = GoGraphql.useFetch_ExpertisesLazyQuery(FETCH_EXPERTISE, {
    fetchPolicy: "network-only",
  });

  const [getTaxonomyFromSpecialtyRequest, getTaxonomyFromSpecialtyResponse] =
    GoGraphql.useGet_Taxonomy_From_SpecialtyLazyQuery(GET_TAXONOMY_FROM_SPECIALTY, {
      fetchPolicy: "no-cache",
    });

  const [updateProviderSpecialtiesRequest, updateProviderSpecialtiesResponse] =
    GoGraphql.useUpdate_Doctor_Membership_Info_Provider_SpecialityMutation(ADD_PROVIDER_SPECIALTIES, {
      refetchQueries: [
        {
          query: FETCH_PROVIDER_SPECIALTIES,
          variables: {
            includes: [GoGraphql.ViewDoctorIncludesEnum.Specialties],
          },
        },
        {
          query: GET_UPDATE_STATUS,
          variables: {
            section: GoGraphql.ViewDoctorIncludesEnum.Specialties,
          },
        },
      ],
    });

  // useEffect(()=>{},[specialty])

  const onAddRequest = async () => {
    let filteredSpecialty = [];
    // if (props?.providerSpecialties?.length > 0) {
    //   filteredSpecialty = props?.providerSpecialties?.map((data) => {
    //     return {
    //       taxonomy_id: data?.taxonomy_id,
    //       expertise: data?.expertise,
    //     };
    //   });
    // }
    let taxonomyId = Number(subSpecialty?.id);
    if (!taxonomyId) {
      if (searchSubSpecialtyResponse?.data?.fetch_subspecialties_of_specialty?.length == 0) {
        let taxonomyFromSpecialtyResponse = await getTaxonomyFromSpecialtyRequest({
          variables: {
            specialty: specialty?.specialty,
          },
        });
        taxonomyId = Number(taxonomyFromSpecialtyResponse?.data?.get_taxonomy_from_specialty?.id);
      }
    }
    filteredSpecialty?.push({
      specialty: specialty?.specialty,
      subSpecialty: subSpecialty?.subSpecialty,
      taxonomy_id: taxonomyId,
      expertise: expertise?.expertise,
    });
    return filteredSpecialty;
  };

  const onEditRequest = () => {
    let specialties = [];
    props?.providerSpecialties?.forEach((specialtyData) => {
      if (specialtyData?.id == props?.selectedSpecialty?.id) {
        specialties.push({
          specialty: specialty?.specialty,
          subSpecialty: subSpecialty?.subSpecialty,
          taxonomy_id: subSpecialty ? Number(subSpecialty?.id) : Number(specialty?.id),
          expertise: expertise?.expertise,
        });
      } else {
        // data = {
        //   taxonomy_id: props?.selectedSpecialty?.taxonomy_id,
        //   expertise: props?.selectedSpecialty?.expertise,
        // };
      }
    });
    return specialties;
  };

  const resetFields = () => {
    setSpecialty(null);
    setSubSpecialty(null);
    setExpertise(null);
  };

  const isValid = () => {
    let response = { valid: true, field: "" };
    if (specialty?.specialty == "" || specialty?.specialty == null || specialty?.specialty == undefined) {
      response = { valid: false, field: "Specialty" };
    }
    if (searchSubSpecialtyResponse?.data?.fetch_subspecialties_of_specialty?.length > 0) {
      if (
        subSpecialty?.subSpecialty == "" ||
        subSpecialty?.subSpecialty == null ||
        subSpecialty?.subSpecialty == undefined
      ) {
        response = { valid: false, field: "SubSpecialty" };
      }
    }
    if (!response.valid) {
      enqueueSnackbar(`${response.field} field is required`, { variant: "error" });
    }
    return response.valid;
  };

  const onSave = async () => {
    if (isValid()) {
      let input = [];
      if (props?.modelType == "Add") {
        input = await onAddRequest();
      } else if (props?.modelType == "Edit") {
        input = onEditRequest();
      }
      if (input?.length == 1) {
        updateProviderSpecialtiesRequest({
          variables: {
            input: {
              ...input[0],
            },
            operation: props?.modelType == "Add" ? GoGraphql?.DbOperation?.Add : GoGraphql?.DbOperation?.Edit,
            row_id: props?.modelType == "Add" ? null : Number(props?.selectedSpecialty?.id),
          },
        });
      }
    }
  };

  useEffect(() => {
    if (
      updateProviderSpecialtiesResponse?.data &&
      updateProviderSpecialtiesResponse?.data?.update_doctor_membership_info_provider_speciality
    ) {
      resetFields();
      props?.onClose();
    }
  }, [updateProviderSpecialtiesResponse?.data]);
  return (
    <UIModel
      isOpen={props?.isOpen}
      onClose={(event, reason) => {
        if (reason !== "backdropClick") {
          resetFields();
          props.onClose();
        }
      }}
      title={`${props?.modelType || ""} Specialization`}
      action={
        <UIPrimaryButton onClick={onSave} loading={updateProviderSpecialtiesResponse?.loading}>
          Save
        </UIPrimaryButton>
      }
    >
      <div className={styles.container}>
        <Autocomplete
          fullWidth
          disablePortal
          freeSolo
          value={specialty}
          style={{ backgroundColor: "white" }}
          ListboxProps={{ style: { maxHeight: "15rem" } }}
          id="Enterspeciality"
          getOptionLabel={(option) => option?.specialty}
          options={
            searchSpecialtiesResponse?.data?.get_taxonomies
              ? searchSpecialtiesResponse?.data?.get_taxonomies.map((item) => ({
                  specialty: item.specialty,
                  // id: item.id,
                }))
              : []
          }
          renderInput={(params) => (
            <TextField
              {...params}
              InputLabelProps={{
                style: { color: "grey" },
              }}
              label="Enter Specialty"
            />
          )}
          onInputChange={(event, specialty: string) => {
            searchSpecialtiesRequest({
              variables: {
                specialty,
              },
            });
          }}
          onChange={(event, specialty: { id?: string; specialty: string }, reason) => {
            setSpecialty(specialty);
            setSubSpecialty(null);
            searchSubSpecialty({
              variables: {
                specialty: specialty?.specialty || "",
              },
            });
            fetchExpertiseRequest({
              variables: {
                specialty: specialty?.specialty || "",
                sub_specialty: subSpecialty?.subSpecialty || "",
              },
            });
          }}
        />
        <Autocomplete
          fullWidth
          disablePortal
          freeSolo
          value={subSpecialty}
          key={subSpecialty?.toString()}
          style={{ backgroundColor: "white" }}
          ListboxProps={{ style: { maxHeight: "10rem" } }}
          id="EnterSubSpecialty"
          getOptionLabel={(option) => option?.subSpecialty}
          options={
            searchSubSpecialtyResponse?.data?.fetch_subspecialties_of_specialty
              ? searchSubSpecialtyResponse?.data?.fetch_subspecialties_of_specialty.map((item) => ({
                  id: item.id,
                  subSpecialty: item.sub_specialty,
                }))
              : []
          }
          disabled={
            specialty?.specialty == "" ||
            specialty?.specialty == undefined ||
            searchSubSpecialtyResponse?.data?.fetch_subspecialties_of_specialty?.length == 0
          }
          renderInput={(params) => (
            <TextField
              {...params}
              InputLabelProps={{
                style: { color: "grey" },
              }}
              label="Select Sub Specialty"
            />
          )}
          onChange={(event, sub_specialty: { id: string; subSpecialty: string }, reason) => {
            setSubSpecialty(sub_specialty);
            fetchExpertiseRequest({
              variables: {
                specialty: specialty?.specialty,
                sub_specialty: sub_specialty?.subSpecialty || "",
              },
            });
          }}
        />
        <Autocomplete
          fullWidth
          disablePortal
          freeSolo
          value={expertise}
          style={{ backgroundColor: "white" }}
          ListboxProps={{ style: { maxHeight: "15rem" } }}
          id="EnterExpertise"
          getOptionLabel={(option) => option?.expertise || ""}
          options={
            fetchExpertiseResponse?.data?.fetch_expertises
              ? fetchExpertiseResponse?.data?.fetch_expertises.map((item) => ({
                  id: item.id,
                  expertise: item.expertise,
                }))
              : []
          }
          renderInput={(params) => (
            <TextField
              {...params}
              InputLabelProps={{
                style: { color: "grey" },
              }}
              label="Select Expertise"
            />
          )}
          onChange={(event, expertise: { id: string; expertise: string }, reason) => {
            setExpertise(expertise);
          }}
        />
      </div>
    </UIModel>
  );
};

const useStyles = makeStyles(() =>
  createStyles({
    container: {
      display: "flex",
      flexDirection: "column",
      padding: "1%",
      justifyContent: "space-around",
      height: 250,
    },
  })
);

export default SpecializationModel;
