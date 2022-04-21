import React, { CSSProperties } from "react";
import { createStyles, makeStyles } from "@mui/styles";
import { useRouter } from "next/router";

interface DoctorImageProps {
  gender: string;
  name: string;
  style?: CSSProperties;
  src?: string;
  specialty?: any;
  type?: string;
}
export function DoctorImage(props: DoctorImageProps) {
  const router = useRouter();
  const styles = useStyles();
  router.query.type == "doctor";
  const doctorIcon =
    props?.gender == "M"
      ? "/Male-Doctor.png"
      : props?.gender == "F"
      ? "/Female-Doctor.png"
      : "/doctor_icon_no_gender.png";

  const practitionerIcon =
    props.gender == "M"
      ? "/Male-Practitioner.png"
      : props.gender == "F"
      ? "/Female-Practitioner.png"
      : "/doctor_icon_no_gender.png";

  const CheckSpecialty = () => {
    if (!props?.src) {
      let dentalCheck = props?.specialty?.join(" | ")?.indexOf("Dental");
      let dentistCheck = props?.specialty?.join(" | ")?.indexOf("Dentist");
      if (dentalCheck >= 0 || dentistCheck >= 0) {
        return practitionerIcon;
      } else return doctorIcon;
    }
  };

  return (
    <img
      src={props?.src || (router.query.type == "doctor" ? CheckSpecialty() : practitionerIcon)}
      alt={props?.name}
      className={styles.doctorLogo}
      style={props?.style}
    />
  );
}

const useStyles = makeStyles(() =>
  createStyles({
    doctorLogo: {
      height: 80,
      width: 80,
      borderRadius: 100,
      objectFit: "cover",
      alignSelf: "center",
    },
  })
);
