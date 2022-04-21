import { gql } from "@apollo/client";
import { useTheme } from "@mui/material/styles";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import Delete from "@mui/icons-material/Delete";
import { Button, CircularProgress, IconButton, InputAdornment, Paper, TextField } from "@mui/material";
import {
  useUpdate_Doctor_Membership_Info_General_InformationMutation,
  useView_Doctor_Membership_InfoQuery,
  ViewDoctorIncludesEnum,
} from "@gogocode-package/graphql_code_generator";
import { UILoader, UIModel, useSnackbar } from "@src/../../packages/ui/src";
import CropperModal from "@src/components/CropperModal";
import { BackendEndpoints } from "@src/routes/BackendEndpoints";
import React, { FC, useEffect, useState } from "react";
import useFetch, { CachePolicies } from "use-http";
import { DetailsCard, FETCH_DOCTOR_MEMBERSHIP_INFO } from "./DetailsCard";
import { GET_PROFILE_PICTURE } from "@src/components/header/FADAppBar";
import { ProfileDetails } from "./ProfileDetails";
import { GeneralDetails } from "./GeneralDetails";
import { LocationDetails } from "./LocationDetails";
import CameraAltRoundedIcon from "@mui/icons-material/CameraAltRounded";
import UploadRoundedIcon from "@mui/icons-material/UploadRounded";
import CameraAltOutlinedIcon from "@mui/icons-material/CameraAltOutlined";
import FileUploadOutlinedIcon from "@mui/icons-material/FileUploadOutlined";
import { dataURLtoBlob } from "@src/utils";
import Webcam from "react-webcam";
import { videoConstraints } from "@src/components/register/Panels/ThirdPanel";

export const UPDATE_DOCTOR_INFORMATION = gql`
  mutation update_doctor_membership_info_general_information($input: GeneralInformationInput!) {
    update_doctor_membership_info_general_information(input: $input) {
      user {
        profile_picture
      }
    }
  }
`;

const PersonalDetails: FC = () => {
  const { enqueueSnackbar } = useSnackbar();
  const theme = useTheme();
  const [selectedImage, setSelectedImage] = useState(null);
  const [changedProfileURL, setChangedProfileURL] = useState(null);
  const [summary, setSummary] = useState<string>("");
  const [changeProfileHover, setChangeProfileHover] = useState<boolean>(false);
  const [webCamModelOpen, setWebCamModelOpen] = useState<boolean>(false);
  const webcamRef = React.useRef(null);
  const { post, response, loading, error } = useFetch(BackendEndpoints.FILE_UPLOAD, {
    method: "POST",
    cachePolicy: CachePolicies.NO_CACHE,
  });

  const [updateDoctorRequest, updateDoctorResponse] = useUpdate_Doctor_Membership_Info_General_InformationMutation(
    UPDATE_DOCTOR_INFORMATION,
    {
      refetchQueries: [
        {
          query: FETCH_DOCTOR_MEMBERSHIP_INFO,
          variables: {
            includes: [ViewDoctorIncludesEnum.Address, ViewDoctorIncludesEnum.User],
          },
        },
        { query: GET_PROFILE_PICTURE },
      ],
    }
  );
  const doctor_info_response = useView_Doctor_Membership_InfoQuery(FETCH_DOCTOR_MEMBERSHIP_INFO, {
    variables: {
      includes: [ViewDoctorIncludesEnum.Address, ViewDoctorIncludesEnum.User],
    },
  });

  useEffect(() => {
    if (response.ok && response?.data?.status == "SUCCESS") {
      console.log("responseuseeffect", response?.data?.data?.unsignedUrl);
      updateDoctorRequest({
        variables: {
          input: {
            user: {
              profile_picture: response?.data?.data?.unsignedUrl,
            },
          },
        },
      });
      enqueueSnackbar("Profile Image Changed", {
        variant: "success",
      });
    }
    if (error) {
      enqueueSnackbar(error?.message || "Failed to upload file. Try again later", {
        variant: "error",
      });
    }
  }, [response.data]);

  function uploadImage(file) {
    if (file) {
      if (file?.size > 2097152) {
        enqueueSnackbar("File Size should be below 2MB max", {
          variant: "error",
        });
        return;
      }
    }
    setSelectedImage(URL.createObjectURL(file));
  }

  async function onSave(blob, url) {
    if (blob) {
      blob.name = "profile_picture.jpeg";
      const newImage = new File([blob], blob.name, { type: blob.type });
      let fd = new FormData();
      fd.append("file", newImage);
      await post(fd);
      setChangedProfileURL(url);
      setSelectedImage(null);
    }
  }
  const capture = React.useCallback(() => {
    const imageSrc = webcamRef.current.getScreenshot();
    if (imageSrc) {
      uploadImage(dataURLtoBlob(imageSrc));
      // setImage(imageSrc);
    }
    setWebCamModelOpen(false);
  }, [webcamRef]);

  const RenderImageText = () => {
    if (loading) {
      return <CircularProgress size={25} color="success" />;
    } else {
      return changeProfileHover ? (
        <div style={{ display: "flex" }}>
          <IconButton
            onClick={(e) => {
              e.stopPropagation();
              setWebCamModelOpen(true);
            }}
          >
            <CameraAltRoundedIcon htmlColor={theme.palette.primary.main} fontSize="small" />
          </IconButton>
          <label htmlFor="btn-upload">
            <input
              id="btn-upload"
              name="btn-upload"
              style={{ display: "none" }}
              type="file"
              accept="image/*"
              onChange={(event) => uploadImage(event.target.files[0])}
            />
            <IconButton
              onClick={(e) => {
                e.stopPropagation();
              }}
              component="span"
            >
              <UploadRoundedIcon htmlColor={theme.palette.primary.main} fontSize="small" />
            </IconButton>
          </label>
        </div>
      ) : (
        <div style={{ display: "flex" }}>
          <EditOutlinedIcon />
          Change
        </div>
      );
    }
  };

  useEffect(() => {
    if (doctor_info_response?.data?.view_doctor_membership_info?.summary) {
      setSummary(doctor_info_response?.data?.view_doctor_membership_info?.summary);
    }
  }, [doctor_info_response?.data]);

  return (
    <div style={{ flexBasis: "80%" }}>
      <Paper style={{ margin: "5%", padding: "5% 5%", border: "1px solid #E0E0E0" }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "2%" }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", rowGap: "10%", flex: 1 }}>
            <img
              src={doctor_info_response?.data?.view_doctor_membership_info?.User?.profile_picture || "/doc2.png"}
              width={150}
              height={150}
              style={{ flexShrink: 1, borderRadius: 150 / 2 }}
            />

            <label>
              <div style={{ display: "flex", justifyContent: "space-between", gap: "2%" }}>
                <Button
                  onMouseOver={() => setChangeProfileHover(true)}
                  onMouseLeave={() => setChangeProfileHover(false)}
                  variant="outlined"
                  style={{ borderRadius: 15, alignSelf: "center" }}
                >
                  <RenderImageText />
                </Button>
                {(changedProfileURL ||
                  doctor_info_response?.data?.view_doctor_membership_info?.User?.profile_picture) && (
                  <Button
                    variant="outlined"
                    style={{ borderRadius: 15, alignSelf: "center" }}
                    onClick={() => {
                      setChangedProfileURL(null);
                      updateDoctorRequest({
                        variables: {
                          input: {
                            user: {
                              profile_picture: null,
                            },
                          },
                        },
                      });
                    }}
                  >
                    <>
                      <Delete />
                      Remove
                    </>
                  </Button>
                )}
              </div>
            </label>
          </div>

          <TextField
            multiline
            variant="filled"
            helperText={"The changes will be automatically saved as you type. "}
            rows={5}
            placeholder={"Describe Your Practice (Not More Than 500 Characters )"}
            maxRows={8}
            style={{ border: `1px solid ${theme?.palette?.primary?.main}`, borderRadius: 10, flex: 4 }}
            value={summary}
            onChange={(event) => {
              setSummary(event?.target?.value);
            }}
            inputProps={{
              maxLength: 500,
            }}
            InputProps={{
              disableUnderline: true,
              endAdornment: (
                <InputAdornment position="start">
                  <UILoader loading={doctor_info_response?.loading} />
                </InputAdornment>
              ),
            }}
            onBlur={() => {
              updateDoctorRequest({
                variables: {
                  input: {
                    provider: {
                      summary,
                    },
                  },
                },
              });
            }}
          />
        </div>
        <ProfileDetails />
        {/* <DetailsCard title="Profile Details" /> */}
        <GeneralDetails />
        {/* <DetailsCard title="General Details" /> */}
        <LocationDetails />
        {/* <DetailsCard title="Location Details" /> */}
        <CropperModal
          isOpen={selectedImage != null}
          onClose={() => {
            setSelectedImage(null);
          }}
          selectedImage={selectedImage}
          onSave={onSave}
        />
      </Paper>
      {webCamModelOpen && (
        <UIModel
          isOpen={webCamModelOpen}
          onClose={() => {
            webcamRef.current = null;
            setWebCamModelOpen(false);
          }}
          maxWidth="md"
          title="Change Profile Picture"
        >
          <div style={{ height: "80%" }}>
            <Webcam
              audio={false}
              height={"100%"}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              width={"100%"}
              videoConstraints={videoConstraints}
            />
          </div>
          <Button
            size="small"
            variant="contained"
            style={{
              outlineColor: theme.palette.primary.main,
              outlineWidth: "1px",
              outlineStyle: "solid",
              marginTop: "5%",
              width: "100%",
              display: "flex",
              justifySelf: "center",
            }}
            onClick={capture}
          >
            <CameraAltRoundedIcon style={{ marginRight: "5%" }} />
            Capture
          </Button>
        </UIModel>
      )}
    </div>
  );
};
export default PersonalDetails;
