import { Divider, IconButton, Paper, Theme, Tooltip, useTheme } from "@mui/material";
import React, { FC, useState } from "react";
import { createStyles, makeStyles } from "@mui/styles";
import { DashboardItems } from "../Dashboard/Dashboard";
import { UIPrimaryButton } from "@src/../../packages/ui/src";
import { InfoOutlined } from "@mui/icons-material";
import Card from "../Dashboard/Card";
import QuickViewModal from "@src/components/dashboard/QuickViewModal";
import { useRouter } from "next/router";
import { DoctorRoutes } from "@src/routes/DashboardRoutes";
import { AppointmentRequestQuickView } from "./AppointmentRequestsQuickView";
import { TodayAppointments } from "./TodayAppointments";
import { useWindowSize } from "@src/../../packages/utils/src";
interface Props {
  onclickCard?: () => void;
  item?: DashboardItems;
  quickAction?: () => void;
  cardDescription?: string;
}

type TopCardProps = {
  onClickInfo: (e: any) => void;
  onClickButton: (e: any) => void;
  infoOnly?: boolean;
  isHover?: boolean;
  tooltipTitle: string;
};
export const TopCardAction = (props: TopCardProps) => {
  const theme = useTheme();
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: "1%" }}>
      <div>
        <IconButton onClick={(e) => props?.onClickInfo(e)}>
          <InfoOutlined htmlColor={props.isHover ? "white" : theme.palette.primary.main} />
        </IconButton>
      </div>
      <Tooltip title={props.tooltipTitle}>
        <div style={{ borderColor: "green" }}>
          {!props?.infoOnly && (
            <UIPrimaryButton
              variant="outlined"
              onClick={(e) => props.onClickButton(e)}
              style={{
                fontSize: 15,
                border: props.isHover ? "1px solid white" : `1px solid ${theme.palette.primary.main}`,
                color: props.isHover ? "white" : theme.palette.primary.main,
              }}
            >
              {"Quick View"}
            </UIPrimaryButton>
          )}
        </div>
      </Tooltip>
    </div>
  );
};

const AppointmentCard: FC<Props> = (props: Props) => {
  const classes = useStyles();
  const router = useRouter();
  const [quickViewModal, setQuickViewModal] = useState<boolean>(false);
  const [currentQuickViewItems, setCurrentQuickViewItems] =
    useState<{ title: string; component: React.ReactElement }>(null);
  const { height, width } = useWindowSize();
  return (
    <Paper
      className={classes.paper}
      style={{ height: height - height * (60 / 100) - 60, width: (width - (20 / 100) * width) / 4 }}
    >
      <div style={{ height: "45%", margin: "0%" }}>
        <Card
          title="Today's Appointments"
          onclickCard={() => {
            setCurrentQuickViewItems({ title: "Today's Appointments", component: <TodayAppointments /> });
            setQuickViewModal(true);
          }}
          quickAction={() => {
            setCurrentQuickViewItems({ title: "Today's Appointments", component: <TodayAppointments /> });
            setQuickViewModal(true);
          }}
          cardDescription="List Today's Appointments"
          img="/today appointment.svg"
          img1="/rafiki1.svg"
          tooltipTitle="Quickview for the Today's Appointment with the Consumer "
        />
      </div>
      <Divider style={{ height: "7%", backgroundColor: "white" }} />
      <div style={{ height: "45%", margin: "0%" }}>
        <Card
          title="Appointments"
          onclickCard={() => {
            router.push(DoctorRoutes.Appointments);
          }}
          quickAction={() => {
            setCurrentQuickViewItems({ title: "Appointments", component: <AppointmentRequestQuickView /> });
            setQuickViewModal(true);
          }}
          cardDescription="Listing Upcoming Appointments"
          img="/appointment.svg"
          img1="/pana-1.svg"
          tooltipTitle="Quickview for all the Appointments with the Consumer"
        />
      </div>
      <QuickViewModal
        isOpen={quickViewModal}
        onClose={() => {
          setQuickViewModal(false);
        }}
        component={currentQuickViewItems?.component}
        title={currentQuickViewItems?.title}
        link={DoctorRoutes.Appointments}
        maxWidth={currentQuickViewItems?.title == "Appointments" ? "xl" : "lg"}
      />
    </Paper>
  );
};

export default AppointmentCard;

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    paper: {
      // height: "300px",
      // width: "340px",
      // display: "flex",
      // justifyContent: "space-evenly",
      alignItems: "center",
      // marginBottom: "2%",
      // borderRadius: "5%",
      // flexDirection: "column",
      // padding: "2%",
      cursor: "pointer",
      backgroundColor: theme.palette.secondary.main,
    },
  })
);
