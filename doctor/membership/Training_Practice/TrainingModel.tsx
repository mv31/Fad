import { gql } from "@apollo/client";
import * as GoGQL from "@gogocode-package/graphql_code_generator";
import {
  useUpdate_Doctor_Membership_Info_TrainingMutation,
  ViewDoctorIncludesEnum,
} from "@gogocode-package/graphql_code_generator";
import {
  UILoader,
  UIModel,
  UIPrimaryButton,
  UITextField,
  useErrorNotification,
  useSnackbar,
} from "@gogocode-package/ui-web";
import { EditRounded } from "@mui/icons-material";
import { LocalizationProvider, MobileDatePicker } from "@mui/lab";
import AdapterDateFns from "@mui/lab/AdapterDateFns";
import {
  Autocomplete,
  Button,
  FormControl,
  Grid,
  IconButton,
  Paper,
  TextField,
  Theme,
  Typography,
  useTheme,
} from "@mui/material";
import { makeStyles } from "@mui/styles";
import { DOCTOR_MEMBERSHIP_UPDATE_SUCCESS_MSG } from "@src/../../Constants";
import { ErrorBoundary } from "@src/components/handlers/ErrorBoundary";
import { emptyCheck } from "@src/utils";
import _ from "lodash";
import React, { useCallback, useEffect, useState } from "react";
import { GET_UPDATE_STATUS } from "../GetUpdateStatus";
import { FETCH_MEMBERSHIP_DETAILS } from "./TrainingPractice";

type Props = {
  isOpen: boolean;
  onClose?: () => void;
  type: "Add" | "Edit";
  trainingType: GoGQL.ProviderTrainingType;
  trainings: GoGQL.ProviderTraining[];
  editableTraining: GoGQL.ProviderTraining;
};

export const UPDATE_DOCTOR_MEMBERSHIP_INFO_TRAINING = gql`
  mutation update_doctor_membership_info_training(
    $input: ProviderTrainingInput!
    $row_id: Float
    $operation: DBOperation!
  ) {
    update_doctor_membership_info_training(input: $input, row_id: $row_id, operation: $operation)
  }
`;

const FETCH_HOSPITAL = gql`
  query fetch_hospitals($input: HospitalSearchInput!) {
    fetch_hospitals(input: $input) {
      name
      country
      state
      city
    }
  }
`;

const GET_TAXONOMIES = gql`
  query get_taxonomies {
    get_taxonomies {
      specialty
    }
  }
`;

type SearchFields = {
  country: string;
  state: string;
  city: string;
  name: string;
  type: string;
  yearFrom: Date;
  yearTo: Date;
};

const TrainingModel = (props: Props) => {
  const classes = useStyles();
  const { isOpen, onClose, type, trainingType, trainings, editableTraining } = props;
  const [error, setError] = useState(null);
  const { enqueueSnackbar } = useSnackbar();
  const theme = useTheme();
  const initial = {
    country: "",
    state: "",
    city: "",
    name: "",
    type: "",
    yearFrom: null,
    yearTo: null,
  };
  const [searchFields, setSearchFields] = useState<SearchFields>(initial);
  const [selectedTraining, setSelectedTraining] = useState(null);
  const [isSearch, setIsSearch] = useState<boolean>(true);

  const [TrainingRequest, TrainingResponse] = useUpdate_Doctor_Membership_Info_TrainingMutation(
    UPDATE_DOCTOR_MEMBERSHIP_INFO_TRAINING,
    {
      refetchQueries: [
        {
          query: FETCH_MEMBERSHIP_DETAILS,
          variables: {
            includes: [ViewDoctorIncludesEnum.Training],
          },
        },
        {
          query: GET_UPDATE_STATUS,
          variables: {
            section: GoGQL.ViewDoctorIncludesEnum.Training,
          },
        },
      ],
    }
  );
  const [FetchHospitalRequest, FetchHospitalResponse] = GoGQL.useFetch_HospitalsLazyQuery(FETCH_HOSPITAL, {
    fetchPolicy: "network-only",
  });

  const TaxonomyResponse = GoGQL.useGet_TaxonomiesQuery(GET_TAXONOMIES, {
    fetchPolicy: "no-cache",
  });

  useEffect(() => {
    if (
      TaxonomyResponse.data &&
      TaxonomyResponse.data?.get_taxonomies &&
      TaxonomyResponse.data?.get_taxonomies?.length > 0
    ) {
      setSearchFields({
        ...searchFields,
        type: TaxonomyResponse.data?.get_taxonomies[0].specialty,
      });
    }
  }, [TaxonomyResponse.data]);

  useEffect(() => {
    FetchHospitalRequest({
      variables: {
        input: {
          country: searchFields?.country,
          city: searchFields?.city,
          state: searchFields?.state,
          name: searchFields?.name,
        },
      },
    });
  }, []);

  useEffect(() => {
    if (editableTraining) {
      setSearchFields({
        country: editableTraining?.country,
        state: editableTraining?.state,
        city: editableTraining?.city,
        name: editableTraining?.hospital,
        type: editableTraining?.training_type,
        yearFrom: new Date(String(editableTraining?.year_from)),
        yearTo: new Date(String(editableTraining?.year_to)),
      });
      setSelectedTraining({
        country: editableTraining?.country,
        state: editableTraining?.state,
        city: editableTraining?.city,
        name: editableTraining?.hospital,
      });
      setIsSearch(false);
    }
  }, [props, editableTraining]);

  const memoizedCallback = useCallback(() => {
    if (trainingType === GoGQL.ProviderTrainingType.Internship) {
      return [{ label: "Rotating" }, { label: "Medical" }, { label: "Surgical" }];
    } else {
      if (TaxonomyResponse?.data?.get_taxonomies) {
        return TaxonomyResponse?.data?.get_taxonomies?.map((data) => {
          return {
            label: data?.specialty,
          };
        });
      } else {
        return [];
      }
    }
  }, [trainingType, TaxonomyResponse?.data]);

  const handleChange = (event) => {
    setIsSearch(true);
    const { name, value } = event.target;
    setSearchFields((prevSt) => ({ ...prevSt, [name]: value }));

    const { state, country, city, name: searchFieldsName } = searchFields;
    FetchHospitalRequest({
      variables: {
        input: {
          state,
          country,
          city,
          name: searchFieldsName,
          [name]: value,
        },
      },
    });
  };

  const onAddRequest = () => {
    let filteredTrainings = [];
    console.log("data", trainings);
    if (trainings?.length > 0) {
      filteredTrainings = trainings?.map((data) => {
        return _.omit(data, ["id", "__typename"]);
      });
    }
    let type = GoGQL.ProviderTrainingType[trainingType];
    filteredTrainings?.push({
      country: selectedTraining?.country,
      state: selectedTraining?.state,
      city: selectedTraining?.city,
      hospital: selectedTraining?.name,
      year_from: searchFields?.yearFrom.getFullYear(),
      year_to: searchFields?.yearTo.getFullYear(),
      type,
      training_type: searchFields?.type,
    });
    return filteredTrainings;
  };
  const onEditRequest = () => {
    let filteredTrainings = [];
    if (trainings?.length > 0) {
      trainings?.map((data) => {
        if (data?.id == editableTraining?.id) {
          filteredTrainings?.push({
            country: selectedTraining?.country,
            state: selectedTraining?.state,
            city: selectedTraining?.city,
            hospital: selectedTraining?.name,
            year_from: searchFields?.yearFrom.getFullYear(),
            year_to: searchFields?.yearTo.getFullYear(),
            type: GoGQL.ProviderTrainingType[trainingType],
            training_type: searchFields?.type,
          });
        } else {
          filteredTrainings.push(_.omit(data, ["id", "__typename"]));
        }
      });
    }
    return filteredTrainings;
  };
  const resetFields = () => {
    setSearchFields(initial);
    setSelectedTraining(null);
    setIsSearch(true);
  };
  const isValid = () => {
    const error_msg = emptyCheck([
      { name: "Year Started", value: searchFields.yearFrom },
      { name: "Year To", value: searchFields.yearTo },
      { name: "Type", value: searchFields.type },
    ]);
    if (isSearch && error_msg.length > 0) {
      enqueueSnackbar("No trainings were selected", { variant: "error" });
      return false;
    } else if (error_msg.length > 0) {
      error_msg.map((error) => {
        enqueueSnackbar(error, { variant: "error" });
        return false;
      });
    }

    return true;
  };

  const handleSave = async () => {
    if (isValid()) {
      // let data;
      // if (type == "Add") {
      //   data = onAddRequest();
      // } else if (type == "Edit") {
      //   data = onEditRequest();
      // }
      const data = {
        country: selectedTraining?.country,
        state: selectedTraining?.state,
        city: selectedTraining?.city,
        hospital: selectedTraining?.name,
        year_from: searchFields?.yearFrom.getFullYear(),
        year_to: searchFields?.yearTo.getFullYear(),
        type: GoGQL.ProviderTrainingType[trainingType],
        training_type: searchFields?.type,
      };
      const response = await TrainingRequest({
        variables: {
          input: data,
          operation: props?.type == "Add" ? GoGQL.DbOperation.Add : GoGQL.DbOperation.Edit,
          row_id: props?.type == "Add" ? null : Number(props?.editableTraining?.id),
        },
      });
      if (response?.data?.update_doctor_membership_info_training) {
        enqueueSnackbar(DOCTOR_MEMBERSHIP_UPDATE_SUCCESS_MSG, { variant: "success" });
      }
      resetFields();
      onClose();
    }
  };

  useErrorNotification([TrainingResponse?.error]);

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
      action={
        <UIPrimaryButton
          style={{ display: "flex", justifySelf: "center", margin: 10 }}
          variant="contained"
          color="primary"
          onClick={handleSave}
          loading={TrainingResponse?.loading}
          disabled={error}
        >
          Save
        </UIPrimaryButton>
      }
      hideCancel
      maxWidth="lg"
      title={`${type || ""} Training`}
      titleStyle={{ textAlign: "center" }}
    >
      {isSearch ? (
        <Grid container justifyContent="space-between" style={{ height: "100%" }}>
          <Grid
            xs={12}
            sm={7}
            lg={5}
            style={{
              alignItems: "center",
              justifyContent: "center",
              border: "1px solid",
              height: 500,
            }}
          >
            <FormControl fullWidth className={classes.input}>
              <TextField
                id="countryname"
                variant="outlined"
                value={searchFields?.country}
                fullWidth
                placeholder="Enter Country"
                label="Country"
                name="country"
                style={{ backgroundColor: "white" }}
                onChange={(e) => handleChange(e)}
              />
            </FormControl>
            <FormControl className={classes.input}>
              <TextField
                variant="outlined"
                fullWidth
                value={searchFields?.state}
                placeholder="Enter State"
                label="State"
                name="state"
                style={{ backgroundColor: "white" }}
                onChange={(e) => handleChange(e)}
              />
            </FormControl>
            <FormControl className={classes.input}>
              <TextField
                variant="outlined"
                fullWidth
                value={searchFields?.city}
                placeholder=" Enter City"
                label="City"
                name="city"
                style={{ backgroundColor: "white" }}
                onChange={(e) => handleChange(e)}
              />
            </FormControl>
            <FormControl className={classes.input}>
              <TextField
                variant="outlined"
                fullWidth
                value={searchFields?.name}
                placeholder="Enter Hospital"
                label="Hospital"
                name="name"
                style={{ backgroundColor: "white" }}
                onChange={(e) => handleChange(e)}
              />
            </FormControl>
          </Grid>
          <Grid
            xs={12}
            sm={10}
            lg={7}
            style={{ height: 500, backgroundColor: theme.palette.secondary.main, overflow: "auto" }}
          >
            {FetchHospitalResponse?.data?.fetch_hospitals?.map((item, i) => (
              <Paper
                className={classes.paper}
                style={{ margin: "3%", cursor: "pointer" }}
                key={`key + ${i}`}
                onClick={() => {
                  setSelectedTraining(item);
                  setIsSearch(false);
                }}
              >
                <Grid container>
                  <Grid xs={8} lg={10} style={{ marginTop: "2%", marginLeft: "%" }}>
                    <Typography color={theme.palette.primary.main} fontSize={20} style={{}}>
                      {" "}
                      {item.name}
                    </Typography>
                    <Typography>{item.city}</Typography>
                    <Typography>{item.state}</Typography>
                    <Typography>{item.country}</Typography>
                  </Grid>
                </Grid>
              </Paper>
            ))}
            {isSearch && FetchHospitalResponse?.data?.fetch_hospitals?.length == 0 && (
              <Grid style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}>
                {" "}
                <Typography>No Result</Typography>
              </Grid>
            )}
            {isSearch && FetchHospitalResponse?.loading && (
              <Grid style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}>
                <UILoader loading={FetchHospitalResponse?.loading} />
              </Grid>
            )}
          </Grid>
        </Grid>
      ) : (
        <Paper className={classes.paper}>
          <Grid container justifyContent={"space-between"} display="flex" alignItems={"center"}>
            <Grid xs={8} lg={10} style={{ marginTop: "2%", marginLeft: "%" }}>
              <Typography color={theme.palette.primary.main} fontSize={20} style={{}}>
                {" "}
                {selectedTraining?.name}
              </Typography>
              <Typography>{selectedTraining?.city}</Typography>
              <Typography>{selectedTraining?.state}</Typography>
              <Typography>{selectedTraining?.country}</Typography>
            </Grid>
            <IconButton
              onClick={(e) => {
                setSelectedTraining(null);
                setIsSearch(true);
                e.stopPropagation();
              }}
              style={{ height: "50%" }}
            >
              <EditRounded htmlColor={theme.palette.primary.main} />
            </IconButton>
          </Grid>
        </Paper>
      )}
      <div style={{ marginTop: 10 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "2%" }}>
          <ErrorBoundary>
            <Autocomplete
              disablePortal
              className={classes.input1}
              style={{ backgroundColor: "white" }}
              id="training-type"
              value={{ label: searchFields?.type }}
              ListboxProps={{ style: { maxHeight: "15rem" } }}
              options={memoizedCallback()}
              onInputChange={(_, stateValue) => {
                setSearchFields({ ...searchFields, type: stateValue });
              }}
              sx={{ width: "50%" }}
              renderInput={(params) => <UITextField required fullWidth {...params} label="Type" />}
            />
          </ErrorBoundary>
          <div className={classes.input1}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <MobileDatePicker
                views={["year"]}
                disableCloseOnSelect={false}
                disableFuture
                onError={(error) => setError(error)}
                okText=""
                label="Year From"
                value={searchFields?.yearFrom}
                onChange={(val) => setSearchFields({ ...searchFields, yearFrom: val })}
                renderInput={(params) => <TextField {...params} fullWidth />}
              />
            </LocalizationProvider>
          </div>
          <div className={classes.input1}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <MobileDatePicker
                disableCloseOnSelect={false}
                disableFuture
                onError={(error) => setError(error)}
                okText=""
                views={["year"]}
                label="Year To"
                minDate={searchFields?.yearFrom}
                value={searchFields?.yearTo}
                onChange={(val) => setSearchFields({ ...searchFields, yearTo: val })}
                renderInput={(params) => <TextField {...params} fullWidth />}
              />
            </LocalizationProvider>
          </div>
        </div>
      </div>
    </UIModel>
  );
};

export default TrainingModel;

const useStyles = makeStyles((theme: Theme) => ({
  container: {
    margin: "2%",
  },
  form: {
    display: "flex",
    width: "90%",
  },
  input: {
    marginTop: "7%",
    marginLeft: "5%",
    marginRight: "5%",
    width: "90%",
  },
  input1: {
    marginTop: "2%",
  },
  emptyGrid: {
    height: 10,
  },
  paper: {
    margin: "0%",
    border: `1px solid ${theme.palette.primary.main}`,
    borderRadius: 10,
    padding: 10,
  },
}));
