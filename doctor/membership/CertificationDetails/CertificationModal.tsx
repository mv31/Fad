import * as GoGQL from "@gogocode-package/graphql_code_generator";
import { emptyCheck } from "@src/utils";
import { UIModel, UIPrimaryButton, UITextField, useErrorNotification, useSnackbar } from "@gogocode-package/ui-web";
import { DatePicker, LocalizationProvider, MobileDatePicker } from "@mui/lab";
import AdapterDateFns from "@mui/lab/AdapterDateFns";
import { Autocomplete, Button, Grid, TextField, Typography, useTheme } from "@mui/material";
import { gql } from "@apollo/client";
import _ from "lodash";
import React, { useEffect, useState } from "react";
import { FETCH_CERTIFICATION_DETAILS } from "./CertificationDetails";
import { DOCTOR_MEMBERSHIP_UPDATE_SUCCESS_MSG } from "@src/../../Constants";
import { GET_UPDATE_STATUS } from "../GetUpdateStatus";

type Props = {
  isOpen: boolean;
  onClose?: () => void;
  type: "Add" | "Edit";
  certifications: GoGQL.ProviderCertifications[];
  currentCertificate: GoGQL.ProviderCertifications;
};

const FETCH_BOARD_NAMES = gql`
  query fetch_board_names($board_name: String) {
    fetch_board_names(board_name: $board_name)
  }
`;

const FETCH_GENERAL_CERTIFICATES = gql`
  query fetch_general_certificates_based_on_boards($board_name: String!, $certificate: String) {
    fetch_general_certificates_based_on_boards(board_name: $board_name, certificate: $certificate)
  }
`;

const FETCH_SUB_SPEC_CERTIFICATES = gql`
  query fetch_subspec_certificates_based_on_boards(
    $board_name: String!
    $certificate: String
    $general_certificate: String!
  ) {
    fetch_subspec_certificates_based_on_boards(
      board_name: $board_name
      certificate: $certificate
      general_certificate: $general_certificate
    )
  }
`;

export const UPDATE_CERTIFICATIONS = gql`
  mutation update_doctor_membership_info_certifications(
    $input: ProviderCertificationsInput!
    $row_id: Float
    $operation: DBOperation!
  ) {
    update_doctor_membership_info_certifications(input: $input, row_id: $row_id, operation: $operation)
  }
`;

const CertificationModal = (props: Props) => {
  const theme = useTheme();
  const { isOpen, onClose, type, certifications, currentCertificate } = props;
  const { enqueueSnackbar } = useSnackbar();
  const [boardName, setBoardName] = useState<string>("");
  const [generalCertificate, setGeneralCertificate] = useState<string>("");
  const [subSpecCertificate, setSubSpecCertificate] = useState<string>("");
  const [generalCertifiedYear, setGeneralCertifiedYear] = useState<Date>(null);
  const [subSpecCertifiedYear, setSubSpecCertifiedYear] = useState<Date>(null);
  const [error, setError] = useState(null);
  const [boardNamesRequest, boardNamesResponse] = GoGQL.useFetch_Board_NamesLazyQuery(FETCH_BOARD_NAMES, {
    variables: {
      board_name: boardName,
    },
    fetchPolicy: "cache-and-network",
  });

  const generalCertificatesResponse = GoGQL.useFetch_General_Certificates_Based_On_BoardsQuery(
    FETCH_GENERAL_CERTIFICATES,
    {
      variables: {
        board_name: boardName,
        certificate: generalCertificate,
      },
      fetchPolicy: "cache-and-network",
    }
  );

  const subSpecCertificatesResponse = GoGQL.useFetch_Subspec_Certificates_Based_On_BoardsQuery(
    FETCH_SUB_SPEC_CERTIFICATES,
    {
      variables: {
        board_name: boardName,
        certificate: subSpecCertificate,
        general_certificate: generalCertificate,
      },
      fetchPolicy: "cache-and-network",
    }
  );

  const [addRequest, addResponse] = GoGQL.useUpdate_Doctor_Membership_Info_CertificationsMutation(
    UPDATE_CERTIFICATIONS,
    {
      refetchQueries: [
        { query: FETCH_CERTIFICATION_DETAILS, variables: { includes: GoGQL.ViewDoctorIncludesEnum.Certifications } },
        {
          query: GET_UPDATE_STATUS,
          variables: {
            section: GoGQL.ViewDoctorIncludesEnum.Certifications,
          },
        },
      ],
      fetchPolicy: "no-cache",
    }
  );

  useEffect(() => {
    boardNamesRequest({
      variables: {
        board_name: boardName,
      },
    });
  }, []);

  useEffect(() => {
    if (props?.currentCertificate) {
      setBoardName(currentCertificate?.name);
      setGeneralCertificate(currentCertificate?.general);
      setSubSpecCertificate(currentCertificate?.sub_specialty);
      setGeneralCertifiedYear(new Date(currentCertificate?.general_year_certified));
      setSubSpecCertifiedYear(new Date(currentCertificate?.sub_specialty_year_certified));
    }
  }, [props?.currentCertificate]);

  useErrorNotification([addResponse?.error]);

  const resetFields = () => {
    setBoardName("");
    setGeneralCertificate("");
    setSubSpecCertificate("");
    setGeneralCertifiedYear(null);
    setSubSpecCertifiedYear(null);
  };

  const addOperation = () => {
    let filteredCertifications: Partial<GoGQL.ProviderCertifications>[] = [];
    if (certifications?.length > 0) {
      filteredCertifications = certifications?.map((certification) => {
        return _.omit(certification, ["id", "__typename"]);
      });
    }
    filteredCertifications?.push({
      name: boardName,
      general: generalCertificate,
      general_year_certified: generalCertifiedYear?.getFullYear() ? String(generalCertifiedYear.getFullYear()) : "",
      sub_specialty: subSpecCertificate,
      sub_specialty_year_certified: subSpecCertifiedYear?.getFullYear()
        ? String(subSpecCertifiedYear.getFullYear())
        : "",
    });
    return filteredCertifications;
  };

  const editOperation = () => {
    return certifications?.map((certification) => {
      let value;
      if (certification?.id == currentCertificate?.id) {
        value = {
          name: boardName,
          general: generalCertificate,
          general_year_certified: String(generalCertifiedYear.getFullYear()),
          sub_specialty: subSpecCertificate,
          sub_specialty_year_certified: String(subSpecCertifiedYear.getFullYear()),
        };
      } else {
        value = _.omit(certification, ["__typename", "id"]);
      }
      return value;
    });
  };
  const isValid = () => {
    const error_msg = emptyCheck([
      { name: "Board Name", value: boardName },
      { name: "General Certificate", value: generalCertificate },
      { name: " Certified Year ", value: generalCertifiedYear },
    ]);
    if (error_msg.length >= 2) {
      enqueueSnackbar("Fields should not be empty", { variant: "error" });
      return false;
    } else if (error_msg.length > 0) {
      error_msg.map((error) => {
        enqueueSnackbar(error, { variant: "error" });
      });
      return false;
    } else return true;
  };

  const onSave = async () => {
    if (isValid()) {
      // let data;
      // if (type == "Add") {
      //   data = addOperation();
      // } else if (type == "Edit") {
      //   data = editOperation();
      // }
      const data = {
        name: boardName,
        general: generalCertificate,
        general_year_certified: generalCertifiedYear?.getFullYear() ? String(generalCertifiedYear.getFullYear()) : "",
        sub_specialty: subSpecCertificate,
        sub_specialty_year_certified: subSpecCertifiedYear?.getFullYear()
          ? String(subSpecCertifiedYear.getFullYear())
          : "",
      };
      const response = await addRequest({
        variables: {
          input: data,
          operation: props?.type == "Add" ? GoGQL.DbOperation.Add : GoGQL.DbOperation.Edit,
          row_id: props?.type == "Add" ? null : Number(props?.currentCertificate?.id),
        },
      });
      if (response?.data?.update_doctor_membership_info_certifications) {
        enqueueSnackbar(DOCTOR_MEMBERSHIP_UPDATE_SUCCESS_MSG, { variant: "success" });
      }
      resetFields();
      onClose();
    }
  };
  useErrorNotification([addResponse?.error]);
  return (
    <UIModel
      isOpen={isOpen}
      disableEscapeKeyDown
      onClose={(event, reason) => {
        if (reason !== "backdropClick") {
          resetFields();
          props.onClose();
        }
      }}
      maxWidth="lg"
      style={{}}
      action={
        <UIPrimaryButton
          variant="contained"
          style={{ display: "flex", justifySelf: "center", margin: 10 }}
          onClick={onSave}
          // disabled={error}
          loading={addResponse?.loading}
        >
          Save
        </UIPrimaryButton>
      }
      hideCancel
      title={`${type || ""} Certification`}
      titleStyle={{ color: theme.palette.primary.main }}
    >
      <div style={{ width: "80%", margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          {" "}
          <Typography>Name of the Board</Typography>
          <Grid xs={6}>
            <Autocomplete
              disablePortal
              style={{ backgroundColor: "white" }}
              id="name-board"
              value={boardName}
              options={boardNamesResponse?.data?.fetch_board_names || []}
              onInputChange={(_, stateValue) => {
                boardNamesRequest({
                  variables: {
                    board_name: stateValue,
                  },
                });
              }}
              onChange={(_, newValue: string) => {
                setBoardName(newValue);
              }}
              sx={{ width: "100%" }}
              renderInput={(params) => <UITextField required onChange={() => {}} {...params} />}
            />
          </Grid>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography>General certificate(s)</Typography>
          <Grid container xs={6} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Grid item xs={5}>
              <Autocomplete
                disablePortal
                style={{ backgroundColor: "white" }}
                id="general-certificate"
                value={generalCertificate}
                options={generalCertificatesResponse?.data?.fetch_general_certificates_based_on_boards || []}
                onInputChange={(_, stateValue) => {
                  setGeneralCertificate(stateValue);
                }}
                sx={{ width: "100%" }}
                renderInput={(params) => <UITextField required onChange={() => {}} {...params} />}
              />
            </Grid>
            <Grid item xs={5}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <MobileDatePicker
                  disableFuture
                  views={["year"]}
                  label="Year Certified"
                  value={generalCertifiedYear}
                  toolbarTitle={"General Year Certified"}
                  disableCloseOnSelect={false}
                  okText=""
                  onError={(error) => setError(error)}
                  onChange={(value) => {
                    setGeneralCertifiedYear(value);
                  }}
                  renderInput={(params) => <TextField {...params} />}
                />
              </LocalizationProvider>
            </Grid>
          </Grid>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography>Subspecialty Certificates</Typography>

          <Grid container xs={6} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Grid xs={5}>
              <Autocomplete
                disablePortal
                disabled={subSpecCertificatesResponse?.data?.fetch_subspec_certificates_based_on_boards?.length == 0}
                style={{ backgroundColor: "white" }}
                id="hospital-affiliations"
                value={subSpecCertificate}
                options={subSpecCertificatesResponse?.data?.fetch_subspec_certificates_based_on_boards || []}
                onInputChange={(_, stateValue) => {
                  setSubSpecCertificate(stateValue);
                }}
                sx={{ width: "100%" }}
                renderInput={(params) => <UITextField required onChange={() => {}} {...params} />}
              />
            </Grid>
            <Grid item xs={5}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <MobileDatePicker
                  disableFuture
                  InputAdornmentProps={{}}
                  disabled={subSpecCertificatesResponse?.data?.fetch_subspec_certificates_based_on_boards?.length == 0}
                  views={["year"]}
                  label="Year Certified"
                  // maxDate={new Date()}
                  value={subSpecCertifiedYear}
                  disableCloseOnSelect={false}
                  onError={(error) => {
                    console.log("error");
                    if (subSpecCertificatesResponse?.data?.fetch_subspec_certificates_based_on_boards?.length != 0) {
                      console.log("setting error");
                      setError(error);
                    }
                  }}
                  toolbarTitle={"Specialty Year Certified"}
                  orientation={"portrait"}
                  okText=""
                  onChange={(value) => {
                    setSubSpecCertifiedYear(value);
                  }}
                  renderInput={(params) => <TextField {...params} />}
                />
              </LocalizationProvider>
            </Grid>
          </Grid>
        </div>
      </div>
    </UIModel>
  );
};

export default CertificationModal;
