import React, { FC, useEffect, useState } from "react";
import Typography from "@mui/material/Typography";
import { makeStyles, createStyles } from "@mui/styles";
import { Badge, Paper, Theme, useTheme } from "@mui/material";
import MyDoctors from "../MyDoctors/MyDoctors";
import CardItem from "./DashboardCard";
import { useRouter } from "next/router";
import { DashboardRoutes, PatientRoutes } from "@src/routes/DashboardRoutes";
import QuickViewModal from "@src/components/dashboard/QuickViewModal";
import RecordCard from "./Records/RecordCard";
import { doctorList, otherServices } from "@src/../../Constants";
import { UIContainer } from "@gogocode-package/ui-web";
import { CommunicationRequestsQuickView } from "../CommunicationRequests/CommunicationRequestsQuickView";
import { AppointmentsQuickView } from "../Appointments/AppointmentsQuickView";
import { useWindowSize } from "@src/../../packages/utils/src";
import { gql } from "@apollo/client";
import {
  EmailListingType,
  useGet_Count_Of_Unread_EmailsQuery,
  useList_EmailsQuery,
} from "@src/../../packages/graphql_code_generator/src";

export type DashboardItems = {
  title: string;
  src: string;
  link: string;
  component?: React.ReactElement;
  cardDescription?: string;
  src1: string;
  tooltipTitle: string;
  badgeCount?: number;
  openWhenRoute?: boolean;
};

export function DashboardHeading() {
  return <div style={{ marginBottom: "1%" }}>{/* <Typography variant="h5">DASHBOARD</Typography> */}</div>;
}

// const GET_COUNT_OF_DRAFT_MAILS = gql`
//   query list_emails($input: EmailListingInput!) {
//     list_emails(input: $input) {
//       count
//     }
//   }
// `;
export const GET_COUNT_OF_DRAFT_MAILS = gql`
  query get_count_of_unread_emails_new {
    get_count_of_unread_emails_new
  }
`;

interface CardProps {
  openModal?: boolean;
}

const Cards = (props: CardProps) => {
  const styles = useStyles();
  const theme = useTheme();
  const [quickViewModal, setQuickViewModal] = useState<boolean>(false);
  const [selectedItems, setSelectedItems] = useState<number>(1);
  const [isUpperHover, setIsUpperHover] = useState<boolean>(false);
  const [isLowerHover, setIsLowerHover] = useState<boolean>(false);
  const classes = useStyles();
  const router = useRouter();
  const { data } = useGet_Count_Of_Unread_EmailsQuery(GET_COUNT_OF_DRAFT_MAILS, {
    pollInterval: Number(process.env.NEXT_PUBLIC_MAIL_POLL_INTERVAL || 5000),
  });
  const { width, height } = useWindowSize();

  const [openDoctorViewModal, setOpenDoctorViewModal] = useState<boolean>(false);

  const items: DashboardItems[] = [
    {
      title: "My Doctors / Practitioners",
      link: PatientRoutes.My_Doctors,
      src: "/my doctors.svg",
      src1: "/pana.svg",
      component: <MyDoctors isQuickView />,
      cardDescription: "View My Doctors/Practitioners list",
      tooltipTitle: "Quickview for all the Doctors / Practitioners in the wishlist",
      openWhenRoute: openDoctorViewModal,
    },
    // {
    //   title: "Eligibility",
    //   link: PatientRoutes.CommunicationRequest,
    //   src: "/communication.svg",
    //   src1: "/bro.svg",
    //   component: <CommunicationRequestsQuickView />,
    //   cardDescription: "Shows Eligibility requests made by you",
    //   tooltipTitle: "Quickview for Consumer's Eligibility ",
    // },
    // {
    //   title: "Eligibility",
    //   link: PatientRoutes.CommunicationRequest,
    //   src: "/communication.svg",
    //   src1: "/bro.svg",
    //   component: (
    //     <CommunicationRequestsQuickView
    //       onQuickViewClose={() => setQuickViewModal(false)}
    //       onBookingAppointmentClose={() => {
    //         setQuickViewModal(true);
    //         setSelectedItems(2); // May change
    //       }}
    //     />
    //   ),
    //   cardDescription: "Shows Eligibility requests made by you",
    //   tooltipTitle: "Quickview for Consumer's Eligibility ",
    // },
    {
      title: "Communication",
      link: DashboardRoutes.MAIL_BOX,
      src: "/mail box.svg",
      src1: "/mail box.svg",
      cardDescription: "Generate mails and view mails",
      tooltipTitle: "Quickview for mail view",
      badgeCount: data?.get_count_of_unread_emails,
    },
    {
      title: "Appointments",
      link: PatientRoutes.Appointments,
      src: "/appointment.svg",
      src1: "/pana-1.svg",
      component: <AppointmentsQuickView />,
      cardDescription: "Shows your upcoming and past appointments",
      tooltipTitle: "Quickview for all the Appointments",
    },
    // { title: "Mailbox", link: DashboardRoutes.MAIL_BOX, src: "/mail box.svg" },
  ];
  function doctorSearch() {
    router.push({
      pathname: "/search",
      query: { type: "doctor" },
    });
  }

  function otherPractice() {
    router.push({
      pathname: "/search",
      query: { type: "other" },
    });
  }

  useEffect(() => {
    if (props && props?.openModal) {
      if (props?.openModal) {
        setOpenDoctorViewModal(true);
        setQuickViewModal(true);
      }
    } else {
      setOpenDoctorViewModal(false);
      setQuickViewModal(false);
    }
  }, [props]);

  return (
    <>
      <div style={{ display: "flex", justifyContent: "center", gap: "2%" }}>
        <Paper
          className={classes.searchPaper}
          style={{ height: height - height * (50 / 100) - 60 }}
          elevation={0}
          onClick={doctorSearch}
          onMouseLeave={() => {
            setIsUpperHover(false);
            setIsLowerHover(false);
          }}
        >
          {" "}
          <div
            onMouseOver={() => {
              setIsUpperHover(true);
            }}
            onMouseLeave={() => {
              setIsUpperHover(false);
            }}
            className={classes.upperContent}
            style={{ backgroundColor: isUpperHover ? theme.palette.primary.main : theme.palette.secondary.main }}
          >
            <div
              style={{
                display: "flex",
                height: "100%",
                textAlign: "center",
                alignItems: "center",
                justifyContent: "space-evenly",
                width: "100%",
              }}
            >
              <div style={{ height: "90%", alignSelf: "center" }}>
                <img height={"100%"} width={"100%"} src="/DoctorCard.png" />
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  textAlign: "center",
                  alignItems: "center",
                  height: "100%",
                }}
              >
                {/* <SearchIcon fontSize="medium" /> */}
                <Typography
                  fontSize={isUpperHover ? 28 : 40}
                  color={isUpperHover ? "#fff" : "black"}
                  alignSelf={"center"}
                >
                  Doctors
                </Typography>
              </div>
              {isUpperHover && (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-evenly",
                    width: "30%",
                  }}
                >
                  {doctorList.map((data, index) => {
                    return (
                      <div key={index} className={classes.wrapper}>
                        <img className={classes.icon} src={data.image} alt={data.altText} />
                        <p className={isUpperHover ? classes.description : classes.hoverDescription}>{data.title}</p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </Paper>

        <Paper
          className={classes.searchPaper}
          style={{ height: height - height * (50 / 100) - 60 }}
          elevation={0}
          onClick={otherPractice}
          onMouseLeave={() => {
            setIsUpperHover(false);
            setIsLowerHover(false);
          }}
        >
          {" "}
          <div
            onMouseOver={() => {
              setIsLowerHover(true);
            }}
            onMouseLeave={() => {
              setIsLowerHover(false);
            }}
            className={classes.upperContent}
            style={{ backgroundColor: isLowerHover ? theme.palette.primary.main : theme.palette.secondary.main }}
          >
            <div
              style={{
                display: "flex",
                height: "100%",
                textAlign: "center",
                alignItems: "center",
                justifyContent: "space-evenly",
                width: "100%",
              }}
            >
              <div style={{ height: "90%", alignSelf: "center" }}>
                <img height={"100%"} width={"100%"} src="/OtherPractitionerCard.png" />
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  textAlign: "center",
                  alignItems: "center",
                  height: "100%",
                }}
              >
                {/* <SearchIcon fontSize="medium" /> */}
                <Typography
                  alignSelf={"center"}
                  fontSize={isLowerHover ? 28 : 40}
                  color={isLowerHover ? "#fff" : "black"}
                >
                  Other Health Care Practitioners
                </Typography>
              </div>
              {isLowerHover && (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-evenly",
                    width: "30%",
                  }}
                >
                  {otherServices.map((data, index) => {
                    return (
                      <div key={index} className={classes.wrapper}>
                        <img className={classes.icon} src={data.image} alt={data.altText} />
                        <p className={isLowerHover ? classes.description : classes.hoverDescription}>{data.title}</p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </Paper>
      </div>
      <div className={styles.container} style={{ height: height - height * (60 / 100) - 60 }}>
        {items.map((item, index) => {
          return (
            <CardItem
              onclickCard={() => {
                router.push(item.link);
              }}
              key={index}
              item={item}
              quickAction={() => {
                setQuickViewModal(true);
                setSelectedItems(index);
              }}
              cardDescription={item.cardDescription}
              tooltipTitle={item.tooltipTitle}
            />
          );
        })}
        {/* <AppointmentCard /> */}
        <RecordCard
          onclickCard={() => {
            router.push(PatientRoutes.Medical_Records);
          }}
          item={{
            title: "Medical Records",
            link: DashboardRoutes.MAIL_BOX,
            src1: "/my records1.svg",
            src: "/my records.svg",
            tooltipTitle: "Quickview the Appointments with the Consumer",
          }}
          cardDescription={"Records can be uploaded and view here"}
        />
        {quickViewModal && (
          <QuickViewModal
            isOpen={quickViewModal}
            onClose={() => {
              if (props?.openModal) {
                router.push("/consumer/dashboard");
              }
              setOpenDoctorViewModal(false);
              setQuickViewModal(false);
            }}
            component={items[selectedItems].component}
            title={items[selectedItems].title}
            link={items[selectedItems].link}
            maxWidth={items[selectedItems]?.title == "Appointments" ? "xl" : "xl"}
          />
        )}
      </div>
    </>
  );
};

interface DashboardProps {
  openModal?: boolean;
}

function Dashboard(props: DashboardProps) {
  return (
    // <UIContainer>
    <div style={{ margin: "2%" }}>
      <Cards openModal={props?.openModal} />
    </div>
    // </UIContainer>
  );
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      padding: "1%",
    },
    iconDiv: {
      margin: "1%",
      display: "flex",
      justifyContent: "center",
      justifySelf: "flex-end",
      alignSelf: "center",
      alignItems: "center",
      borderRadius: 50,
      width: 40,
      height: 40,
      cursor: "pointer",
      //border: `1px solid ${theme.palette.primary.main}`,
      color: theme.palette.primary.main,
    },
    container: {
      display: "flex",
      width: "100%",
      rowGap: 10,
      columnGap: 20,
      flexWrap: "wrap",
      justifyContent: "space-between",
      marginTop: 10,
      // backgroundColor: "red",
    },
    container2: {
      display: "flex",
      // rowGap: 10,
      // columnGap: 20,
      flexWrap: "wrap",
      justifyContent: "space-between",
      // marginTop: 10,
      backgroundColor: "blue",
    },

    paper: {
      height: 300,
      width: 550,

      // display: "flex",
      justifyContent: "space-evenly",
      alignItems: "center",
      marginBottom: "2%",
      // borderRadius: "5%",
      // flexDirection: "column",
      // padding: "1%",
      cursor: "pointer",
      backgroundColor: theme.palette.secondary.main,
    },
    title: {
      fontWeight: "bold",
    },
    upper: {
      height: "100%",
      width: 250,
      background: "blue",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      cursor: "pointer",
      position: "relative",
      borderRadius: 40,
      borderBottomRightRadius: 0,
      borderBottomLeftRadius: 0,
    },
    upperContent: {
      // background: theme.palette.primary.main,hoverContent
      // backgroundColor: "red",
      alignSelf: "flex-start",
      width: "100%",
      height: "100%",
      transition: "all .3s",
      display: "flex",
      justifyContent: "space-between",

      padding: 0,
      margin: 0,
    },
    wrapper: {
      display: "flex",
      alignItems: "center",
      gap: 5,
    },
    icon: {
      height: 23,
      width: 23,
      marginLeft: 10,
    },
    description: {
      fontSize: 20,
      color: "#fff",
      alignSelf: "flex-start",
    },
    hoverDescription: {
      fontSize: 20,
      color: "black",
      alignSelf: "flex-start",
    },
    lowerContent: {
      //background: theme.palette.primary.main,
      alignSelf: "flex-start",
      width: "100%",
      height: "100%",
      transition: "all .3s",
      borderBottomRightRadius: 20,
      borderBottomLeftRadius: 20,
    },
    hoverContent: {
      background: theme.palette.primary.main,

      display: "flex",
      alignSelf: "flex-start",
      width: "100%",
      height: "100%",
      transition: "all .3s",
      // borderRadius: 30,
      // borderBottomRightRadius: 30,
      // borderBottomLeftRadius: 30,
    },
    hoverLowerContent: {
      background: theme.palette.primary.main,

      display: "flex",
      alignSelf: "flex-start",
      width: "100%",
      height: "100%",
      transition: "all .3s",
      // borderRadius: 30,
      // borderBottomRightRadius: 30,
      // borderBottomLeftRadius: 30,
    },
    wrapper2: {
      display: "flex",
      alignItems: "center",
      gap: 10,
    },
    badge: {
      fontSize: 18,
      height: 25,
      width: 25,
      borderRadius: 50,
    },
    searchPaper: {
      // height: 400,
      width: "50%",

      // display: "flex",
      justifyContent: "space-evenly",
      alignItems: "center",
      marginBottom: "2%",
      // borderRadius: "5%",
      // flexDirection: "column",
      // padding: "1%",
      cursor: "pointer",
      backgroundColor: "blue",
    },
  })
);

export default Dashboard;
