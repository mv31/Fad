import { gql } from "@apollo/client";
import {
  ProviderSchool,
  useFetch_CitiesLazyQuery,
  useFetch_SchoolsLazyQuery,
  useFetch_StatesQuery,
  useUpdate_Doctor_Membership_Info_SchoolsMutation,
  ViewDoctorIncludesEnum,
} from "@gogocode-package/graphql_code_generator";
import { UIPrimaryButton, useSnackbar } from "@gogocode-package/ui-web";
import { EditRounded } from "@mui/icons-material";
import { LocalizationProvider, MobileDatePicker } from "@mui/lab";
import AdapterDateFns from "@mui/lab/AdapterDateFns";
import {
  Autocomplete,
  Button,
  CircularProgress,
  FormControl,
  Grid,
  IconButton,
  TextField,
  Theme,
  Typography,
  useTheme,
} from "@mui/material";
import { makeStyles } from "@mui/styles";
import { UIModel } from "@src/../../packages/ui/src";
import { generateLocation } from "@src/utils";
import _ from "lodash";
import * as GoGQL from "@gogocode-package/graphql_code_generator";
import React, { useEffect, useState } from "react";
import { FETCH_CITIES, FETCH_STATES } from "../PersonalDetails/AddLocationDetailsModel";
import { FETCH_DOCTOR_EDUCATION_INFO } from "./EducationDetails";
import { GET_UPDATE_STATUS } from "../GetUpdateStatus";
import { DOCTOR_MEMBERSHIP_UPDATE_SUCCESS_MSG } from "@src/../../Constants";

type Props = {
  isOpen: boolean;
  onClose?: () => void;
  type: "Add" | "Edit";
  schools: ProviderSchool[];
  selectedSchool: ProviderSchool;
};

type SearchFields = {
  school: string;
  country: string;
  state: string;
  city: string;
};

const FETCH_SCHOOLS = gql`
  query fetch_schools($input: SchoolSearchInput!) {
    fetch_schools(input: $input) {
      id
      city
      country
      state_name
      name
    }
  }
`;

export const CREATE_DOCTOR_EDUCATION = gql`
  mutation update_doctor_membership_info_schools(
    $input: ProviderSchoolInput!
    $row_id: Float
    $operation: DBOperation!
  ) {
    update_doctor_membership_info_schools(input: $input, row_id: $row_id, operation: $operation)
  }
`;

export default function EducationAddModal(props: Props) {
  const { isOpen, onClose, type, schools, selectedSchool } = props;
  const classes = useStyles();
  const theme = useTheme();

  const initial = {
    school: "",
    country: "",
    state: "",
    city: "",
  };

  const [searchFields, setSearchFields] = useState<SearchFields>(initial);

  const [yearGraduated, setYearGraduated] = useState(new Date());
  const [yearFrom, setYearFrom] = useState(new Date());
  const [yearTo, setYearTo] = useState(new Date());
  const [isSearch, setIsSearch] = useState(true);
  const [city, setCity] = useState<{ city: string }>({ city: "" });
  const [state, setState] = useState<{ state_name: string }>({ state_name: "" });
  const [error, setError] = useState(null);

  const [selectedItem, setSelectedItem] = useState<SearchFields>(initial);
  const { enqueueSnackbar } = useSnackbar();
  const [fetchSchoolsRequest, fetchSchoolsResponse] = useFetch_SchoolsLazyQuery(FETCH_SCHOOLS, {
    fetchPolicy: "no-cache",
  });

  const [createDoctorEducationRequest, createDoctorEducationResponse] =
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

  const [CityRequest, CityResponse] = useFetch_CitiesLazyQuery(FETCH_CITIES, {
    fetchPolicy: "cache-and-network",
  });
  const StateResponse = useFetch_StatesQuery(FETCH_STATES, {
    fetchPolicy: "cache-and-network",
  });

  useEffect(() => {
    fetchSchoolsRequest({
      variables: {
        input: {
          name: searchFields?.school,
          country: searchFields?.country,
          state_name: searchFields?.state,
          city: searchFields?.city,
        },
      },
    });
  }, []);

  useEffect(() => {
    if (selectedSchool) {
      setSelectedItem({
        school: selectedSchool?.school,
        country: selectedSchool?.country,
        state: selectedSchool?.state,
        city: selectedSchool?.city,
      });
      setYearFrom(new Date(selectedSchool?.year_from));
      setYearTo(new Date(selectedSchool?.year_to));
      setYearGraduated(new Date(selectedSchool?.year_graduated));
      setIsSearch(false);
    }
  }, [props?.selectedSchool]);

  const handleChange = (name, value) => {
    setIsSearch(true);
    setSearchFields((prevSt) => ({ ...prevSt, [name]: value }));
  };

  useEffect(() => {
    if (searchFields) {
      fetchSchoolsRequest({
        variables: {
          input: {
            name: searchFields?.school,
            country: searchFields?.country,
            state_name: searchFields?.state,
            city: searchFields?.city,
          },
        },
      });
    }
  }, [searchFields]);

  const onCardClick = (item) => {
    setIsSearch(false);
    setSelectedItem({
      school: item.name,
      country: item.country,
      state: item.state_name,
      city: item.city,
    });
  };

  const onAddRequest = () => {
    let filteredSchool = [];
    if (schools?.length > 0) {
      filteredSchool = schools?.map((data) => {
        return _.omit(data, ["id", "__typename"]);
      });
    }
    filteredSchool?.push({
      country: selectedItem?.country,
      state: selectedItem?.state,
      city: selectedItem?.city,
      school: selectedItem?.school,
      year_from: yearFrom.getFullYear().toString(),
      year_to: yearTo.getFullYear().toString(),
      year_graduated: yearGraduated.getFullYear().toString(),
    });
    return filteredSchool;
  };

  const onEditRequest = () => {
    return schools?.map((schoolData) => {
      let data;
      if (schoolData?.id == selectedSchool?.id) {
        data = {
          country: selectedItem?.country,
          state: selectedItem?.state,
          city: selectedItem?.city,
          school: selectedItem?.school,
          year_from: yearFrom.getFullYear().toString(),
          year_to: yearTo.getFullYear().toString(),
          year_graduated: yearGraduated.getFullYear().toString(),
        };
      } else {
        data = _.omit(schoolData, ["id", "__typename"]);
      }
      return data;
    });
  };

  const resetFields = () => {
    setSelectedItem(initial);
    setSearchFields(initial);
    setYearFrom(new Date());
    setYearTo(new Date());
    setYearGraduated(new Date());
    setIsSearch(true);
  };
  const isValid = () => {
    if (isSearch) {
      enqueueSnackbar("No Schools were selected", { variant: "error" });
      return false;
    }
    return true;
  };

  const handleSaveData = () => {
    if (isValid()) {
      // let data;
      // if (type == "Add") {
      //   data = onAddRequest();
      // } else if (type == "Edit") {
      //   data = onEditRequest();
      // }
      let data: GoGQL.ProviderSchoolInput = {
        country: selectedItem?.country,
        state: selectedItem?.state,
        city: selectedItem?.city,
        school: selectedItem?.school,
        year_from: yearFrom.getFullYear().toString(),
        year_to: yearTo.getFullYear().toString(),
        year_graduated: yearGraduated.getFullYear().toString(),
      };
      createDoctorEducationRequest({
        variables: {
          input: data,
          operation: props?.type == "Add" ? GoGQL.DbOperation.Add : GoGQL.DbOperation.Edit,
          row_id: props?.type == "Add" ? null : Number(props?.selectedSchool?.id),
        },
      });
    }
  };

  useEffect(() => {
    if (
      createDoctorEducationResponse?.data &&
      createDoctorEducationResponse?.data?.update_doctor_membership_info_schools
    ) {
      enqueueSnackbar(DOCTOR_MEMBERSHIP_UPDATE_SUCCESS_MSG, { variant: "success" });
      resetFields();
      onClose();
    }
  }, [createDoctorEducationResponse?.data]);

  useEffect(() => {
    if (city?.city) {
      CityRequest({
        variables: {
          city: city?.city,
          state: state?.state_name,
        },
      });
    }
  }, [city?.city]);

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
          variant="contained"
          color="primary"
          style={{ display: "flex", justifySelf: "center", margin: 10 }}
          onClick={handleSaveData}
          disabled={error}
          loading={createDoctorEducationResponse?.loading}
        >
          Save
        </UIPrimaryButton>
      }
      maxWidth="lg"
      title={`${type || ""} School`}
      titleStyle={{ textAlign: "center" }}
      hideCancel
    >
      <div style={{ width: "90%", margin: "0 auto" }}>
        <div
          style={{
            display: "flex",
            gap: "2%",
            justifyContent: "space-between",
            margin: "2% 0",
          }}
        >
          <FormControl fullWidth className={classes.input}>
            <TextField
              id="countryname"
              variant="outlined"
              value={searchFields?.school}
              name={"school"}
              fullWidth
              placeholder="Enter School"
              label="School"
              style={{ backgroundColor: "white" }}
              onChange={(e) => handleChange("school", e.target.value)}
            />
          </FormControl>
          <FormControl className={classes.input}>
            <TextField
              variant="outlined"
              fullWidth
              value={searchFields?.city}
              name={"city"}
              placeholder="Enter City"
              label="City"
              style={{ backgroundColor: "white" }}
              onChange={(e) => handleChange("city", e.target.value)}
            />
          </FormControl>
          <FormControl className={classes.input}>
            <Autocomplete
              disablePortal
              fullWidth
              componentName="state"
              style={{ backgroundColor: "white" }}
              id="state"
              value={{ state_name: searchFields?.state || "" }}
              options={
                StateResponse?.data?.fetch_states.map((state) => {
                  return { state_name: state.state_name };
                }) || []
              }
              onChange={(event, value: { state_name: string }) => {
                handleChange("state", value?.state_name);
              }}
              sx={{ width: "100%" }}
              getOptionLabel={(option) => option.state_name}
              renderInput={(params) => <TextField {...params} label="Choose State" name={"state"} />}
            />
          </FormControl>
          <FormControl className={classes.input}>
            <TextField
              variant="outlined"
              fullWidth
              value={searchFields?.country}
              name={"country"}
              placeholder="Enter Country"
              label="Country"
              style={{ backgroundColor: "white" }}
              onChange={(e) => handleChange("country", e.target.value)}
            />
          </FormControl>
        </div>
        {isSearch ? (
          <div className={classes.searchOutputContainer}>
            {fetchSchoolsResponse?.data?.fetch_schools?.map((item, i) => (
              <div
                className={classes.paper}
                style={{ cursor: "pointer" }}
                key={`key + ${i}`}
                onClick={() => {
                  onCardClick(item);
                }}
              >
                <Grid container style={{ height: "100%" }}>
                  <Grid xs={8} lg={10} style={{ marginTop: "1%", marginLeft: "1%" }}>
                    <Typography color={theme.palette.primary.main} fontSize={18} style={{}}>
                      {" "}
                      {item.name}
                    </Typography>
                    <Typography fontSize={17} style={{ fontStyle: "italic" }} variant={"inherit"}>
                      {generateLocation(item.city, item.state_name, item.country)}
                    </Typography>
                  </Grid>
                </Grid>
              </div>
            ))}
            {fetchSchoolsResponse?.data?.fetch_schools?.length == 0 && (
              <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                <Typography>No Schools Found</Typography>
              </div>
            )}
            {fetchSchoolsResponse?.loading && (
              <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                <CircularProgress color="success" />
              </div>
            )}
          </div>
        ) : (
          <div className={classes.paper}>
            <Grid container style={{ height: "100%" }}>
              <Grid
                xs={10}
                lg={12}
                style={{
                  marginTop: "1%",
                  marginLeft: "1%",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <Typography color={theme.palette.primary.main} fontSize={18} style={{}}>
                    {" "}
                    {selectedItem.school}
                  </Typography>
                  <Typography fontSize={17} style={{ fontStyle: "italic", marginTop: 5 }} variant={"inherit"}>
                    {generateLocation(selectedItem.city, selectedItem.state, selectedItem.country)}
                  </Typography>
                </div>
                <IconButton
                  onClick={(e) => {
                    setIsSearch(true);
                    setSelectedItem(initial);
                  }}
                >
                  <EditRounded htmlColor={theme.palette.primary.main} />
                </IconButton>
              </Grid>
            </Grid>
          </div>
        )}
        <div style={{ display: "flex", gap: "3%", marginTop: "2%" }}>
          <div style={{ flexBasis: "40%", margin: "1% 0" }}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <MobileDatePicker
                disableFuture
                toolbarTitle={"Year From"}
                disableCloseOnSelect={false}
                okText=""
                onError={(error) => setError(error)}
                views={["year"]}
                label="Year From"
                value={yearFrom}
                onChange={(value) => {
                  setYearFrom(value);
                }}
                renderInput={(params) => <TextField {...params} fullWidth />}
              />
            </LocalizationProvider>
          </div>
          <div style={{ flexBasis: "40%", margin: "1% 0" }}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <MobileDatePicker
                disableFuture
                toolbarTitle={"Year To"}
                disableCloseOnSelect={false}
                okText=""
                onError={(error) => setError(error)}
                views={["year"]}
                label="Year To"
                value={yearTo}
                minDate={yearFrom}
                onChange={(value) => {
                  setYearTo(value);
                }}
                renderInput={(params) => <TextField {...params} fullWidth />}
              />
            </LocalizationProvider>
          </div>
          <div style={{ flexBasis: "40%", margin: "1% 0" }}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <MobileDatePicker
                disableFuture
                toolbarTitle={"Year Graduated"}
                disableCloseOnSelect={false}
                okText=""
                onError={(error) => setError(error)}
                views={["year"]}
                label="Year Graduated"
                minDate={yearTo}
                value={yearGraduated}
                onChange={(value) => {
                  setYearGraduated(value);
                }}
                renderInput={(params) => <TextField {...params} fullWidth />}
              />
            </LocalizationProvider>
          </div>
        </div>
      </div>
    </UIModel>
  );
}

const useStyles = makeStyles((theme: Theme) => ({
  container: {
    margin: "2%",
  },
  form: {
    display: "flex",
    width: "90%",
  },
  input: {
    width: "100%",
  },
  emptyGrid: {
    height: 10,
  },
  paper: {
    border: `1px solid ${theme.palette.primary.main}`,
    borderRadius: 10,
    padding: 10,
    background: "white",
  },
  searchOutputContainer: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(30ch, 1fr))",
    minHeight: "45vh",
    margin: "2% 0",
    height: "45vh",
    border: `1px solid ${theme.palette.primary.main}`,
    overflowY: "auto",
    background: theme.palette.secondary.main,
  },
}));
